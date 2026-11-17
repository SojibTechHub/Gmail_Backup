import jwt, { SignOptions } from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { User, UserSession } from '../models';
import { UserRole, AuditAction, NotificationType } from '../types';
import config from '../config';
import { AppError } from '../middlewares';
import { generateToken, hashToken, sendVerificationEmail, sendPasswordResetEmail, sendSecurityAlert } from '../utils';
import { logAuditEvent } from './audit.service';
import { createNotification } from './notification.service';

const generateAccessJWT = (userId: string, role: UserRole): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign({ id: userId, userId, role }, config.jwt.secret, options);
};

const generateRefreshJWT = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign({ id: userId }, config.jwt.refreshSecret, options);
};

export const register = async (
  data: { name: string; email: string; password: string },
  ip: string,
  userAgent: string
) => {
  const existingUser = await User.findOne({ email: data.email.toLowerCase() });
  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  const rawVerificationToken = generateToken(32);
  const hashedVerificationToken = hashToken(rawVerificationToken);
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash: data.password, // hashed automatically by UserSchema pre-save
    role: UserRole.USER,
    isEmailVerified: false,
    emailVerificationToken: hashedVerificationToken,
    emailVerificationExpires: verificationExpires,
  });

  // Attempt to send verification email (non-blocking if SMTP not configured)
  sendVerificationEmail(user.email, rawVerificationToken).catch(() => {});

  await logAuditEvent({
    userId: user._id.toString(),
    action: AuditAction.USER_REGISTER,
    resource: 'User',
    resourceId: user._id.toString(),
    ipAddress: ip,
    userAgent,
    details: 'User registered account',
  });

  await createNotification(
    user._id.toString(),
    NotificationType.SYSTEM,
    'Welcome to MailVault',
    'Your account has been created. Please verify your email to unlock all security features.'
  );

  const accessToken = generateAccessJWT(user._id.toString(), user.role);
  const refreshToken = generateRefreshJWT(user._id.toString());

  // Store refresh token
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  user.refreshTokens.push({ token: hashToken(refreshToken), expiresAt: refreshExpiresAt });
  await user.save();

  // Create UserSession
  // Suspicious Activity Detection: check if IP or device is new
  try {
    const priorSessions = await UserSession.find({ userId: user._id, isValid: true })
      .sort({ createdAt: -1 })
      .limit(10);

    if (priorSessions.length > 0) {
      const knownIps = new Set(priorSessions.map((s) => s.ipAddress));
      const knownAgents = new Set(priorSessions.map((s) => s.userAgent));
      const isNewIp = ip && !knownIps.has(ip);
      const isNewAgent = userAgent && !knownAgents.has(userAgent);

      if (isNewIp || isNewAgent) {
        await createNotification(
          user._id.toString(),
          NotificationType.SECURITY_ALERT,
          'New Device / Location Sign-in',
          `Sign-in detected from ${ip || 'unknown IP'} (${userAgent?.slice(0, 40) || 'unknown browser'}). If this wasn't you, review your active sessions.`
        );

        sendSecurityAlert(
          user.email,
          `We detected a sign-in to your MailVault account from an unfamiliar device or IP address:\nIP: ${ip}\nDevice: ${userAgent}\nTime: ${new Date().toUTCString()}\n\nIf you did not authorize this, please change your password immediately and revoke other active sessions from your Security Settings.`
        ).catch(() => {});
      }
    }
  } catch {
    // Non-blocking security check
  }

  await UserSession.create({
    userId: user._id,
    token: hashToken(accessToken),
    userAgent,
    ipAddress: ip,
    expiresAt: refreshExpiresAt,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isMfaEnabled: user.isMfaEnabled,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
};

export const login = async (
  email: string,
  password: string,
  mfaCode?: string,
  ip = 'unknown',
  userAgent = 'unknown'
) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check account lock
  if (user.isLocked) {
    throw new AppError('Account is temporarily locked due to multiple failed login attempts. Try again later.', 423);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
    }
    await user.save();
    throw new AppError('Invalid email or password', 401);
  }

  // Reset login attempts on correct password
  user.loginAttempts = 0;
  user.lockUntil = undefined;

  // Check MFA if enabled
  if (user.isMfaEnabled) {
    if (!mfaCode) {
      return {
        mfaRequired: true,
        userId: user._id.toString(),
      };
    }

    let isCodeValid = false;
    if (user.mfaSecret) {
      isCodeValid = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaCode,
        window: 1,
      });
    }

    // Check backup codes if TOTP fails
    if (!isCodeValid && user.mfaBackupCodes && user.mfaBackupCodes.length > 0) {
      const hashedMfa = hashToken(mfaCode);
      const codeIndex = user.mfaBackupCodes.indexOf(hashedMfa);
      if (codeIndex !== -1) {
        user.mfaBackupCodes.splice(codeIndex, 1);
        isCodeValid = true;
      }
    }

    if (!isCodeValid) {
      throw new AppError('Invalid two-factor authentication code', 401);
    }
  }

  user.lastLogin = new Date();
  const accessToken = generateAccessJWT(user._id.toString(), user.role);
  const refreshToken = generateRefreshJWT(user._id.toString());

  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  user.refreshTokens.push({ token: hashToken(refreshToken), expiresAt: refreshExpiresAt });
  await user.save();

  // Suspicious Activity Detection: check if IP or device is new
  try {
    const priorSessions = await UserSession.find({ userId: user._id, isValid: true })
      .sort({ createdAt: -1 })
      .limit(10);

    if (priorSessions.length > 0) {
      const knownIps = new Set(priorSessions.map((s) => s.ipAddress));
      const knownAgents = new Set(priorSessions.map((s) => s.userAgent));
      const isNewIp = ip && !knownIps.has(ip);
      const isNewAgent = userAgent && !knownAgents.has(userAgent);

      if (isNewIp || isNewAgent) {
        await createNotification(
          user._id.toString(),
          NotificationType.SECURITY_ALERT,
          'New Device / Location Sign-in',
          `Sign-in detected from ${ip || 'unknown IP'} (${userAgent?.slice(0, 40) || 'unknown browser'}). If this wasn't you, review your active sessions.`
        );

        sendSecurityAlert(
          user.email,
          `We detected a sign-in to your MailVault account from an unfamiliar device or IP address:\nIP: ${ip}\nDevice: ${userAgent}\nTime: ${new Date().toUTCString()}\n\nIf you did not authorize this, please change your password immediately and revoke other active sessions from your Security Settings.`
        ).catch(() => {});
      }
    }
  } catch {
    // Non-blocking security check
  }

  await UserSession.create({
    userId: user._id,
    token: hashToken(accessToken),
    userAgent,
    ipAddress: ip,
    expiresAt: refreshExpiresAt,
  });

  await logAuditEvent({
    userId: user._id.toString(),
    action: AuditAction.USER_LOGIN,
    resource: 'User',
    resourceId: user._id.toString(),
    ipAddress: ip,
    userAgent,
    details: 'User logged in successfully',
  });

  return {
    mfaRequired: false,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isMfaEnabled: user.isMfaEnabled,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
};

export const logout = async (userId: string, token: string, ip: string, userAgent: string) => {
  const hashed = hashToken(token);
  await Promise.all([
    User.updateOne(
      { _id: userId },
      { $pull: { refreshTokens: { token: hashed } } }
    ),
    UserSession.updateMany(
      { userId, token: hashed },
      { isValid: false }
    ),
  ]);

  await logAuditEvent({
    userId,
    action: AuditAction.USER_LOGOUT,
    resource: 'User',
    resourceId: userId,
    ipAddress: ip,
    userAgent,
    details: 'User logged out',
  });

  return { success: true };
};

export const verifyEmail = async (rawToken: string) => {
  const hashed = hashToken(rawToken);
  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return { success: true, email: user.email };
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // For security, return success without revealing whether email exists
    return { success: true };
  }

  const rawResetToken = generateToken(32);
  user.passwordResetToken = hashToken(rawResetToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  sendPasswordResetEmail(user.email, rawResetToken).catch(() => {});

  return { success: true };
};

export const resetPassword = async (rawToken: string, newPassword: string, ip: string, userAgent: string) => {
  const hashed = hashToken(rawToken);
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError('Invalid or expired password reset token', 400);
  }

  user.passwordHash = newPassword; // Pre-save hook hashes with argon2
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // Invalidate all active refresh tokens
  await user.save();

  await logAuditEvent({
    userId: user._id.toString(),
    action: AuditAction.PASSWORD_RESET,
    resource: 'User',
    resourceId: user._id.toString(),
    ipAddress: ip,
    userAgent,
    details: 'Password was reset using reset token',
  });

  return { success: true };
};

export const refreshAccessToken = async (rawRefreshToken: string) => {
  try {
    const decoded = jwt.verify(rawRefreshToken, config.jwt.refreshSecret) as { id: string };
    const hashed = hashToken(rawRefreshToken);

    const user = await User.findOne({
      _id: decoded.id,
      'refreshTokens.token': hashed,
      'refreshTokens.expiresAt': { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid refresh token or session expired', 401);
    }

    const newAccessToken = generateAccessJWT(user._id.toString(), user.role);
    return { accessToken: newAccessToken };
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }
};

export const setupMfa = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const secret = speakeasy.generateSecret({
    name: `MailVault (${user.email})`,
    issuer: 'MailVault',
  });

  user.mfaSecret = secret.base32;
  await user.save();

  const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || '');

  return {
    secret: secret.base32,
    qrCode: qrCodeDataUrl,
  };
};

export const verifyAndEnableMfa = async (userId: string, token: string, ip: string, userAgent: string) => {
  const user = await User.findById(userId);
  if (!user || !user.mfaSecret) {
    throw new AppError('MFA setup has not been initialized', 400);
  }

  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token,
    window: 1,
  });

  if (!verified) {
    throw new AppError('Invalid verification code', 400);
  }

  // Generate 8 plaintext backup codes
  const plaintextBackupCodes: string[] = [];
  const hashedBackupCodes: string[] = [];

  for (let i = 0; i < 8; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8-char code
    plaintextBackupCodes.push(code);
    hashedBackupCodes.push(hashToken(code));
  }

  user.isMfaEnabled = true;
  user.mfaBackupCodes = hashedBackupCodes;
  await user.save();

  await logAuditEvent({
    userId,
    action: AuditAction.MFA_ENABLE,
    resource: 'User',
    resourceId: userId,
    ipAddress: ip,
    userAgent,
    details: 'MFA enabled with TOTP',
  });

  return {
    success: true,
    backupCodes: plaintextBackupCodes,
  };
};

export const disableMfa = async (userId: string, token: string, ip: string, userAgent: string) => {
  const user = await User.findById(userId);
  if (!user || !user.isMfaEnabled || !user.mfaSecret) {
    throw new AppError('MFA is not enabled', 400);
  }

  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token,
    window: 1,
  });

  if (!verified) {
    throw new AppError('Invalid verification code', 400);
  }

  user.isMfaEnabled = false;
  user.mfaSecret = undefined;
  user.mfaBackupCodes = [];
  await user.save();

  await logAuditEvent({
    userId,
    action: AuditAction.MFA_DISABLE,
    resource: 'User',
    resourceId: userId,
    ipAddress: ip,
    userAgent,
    details: 'MFA disabled',
  });

  return { success: true };
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
  ip: string,
  userAgent: string
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) {
    throw new AppError('Incorrect current password', 400);
  }

  user.passwordHash = newPassword; // hashed automatically
  user.refreshTokens = [];
  await user.save();

  await logAuditEvent({
    userId,
    action: AuditAction.PASSWORD_CHANGE,
    resource: 'User',
    resourceId: userId,
    ipAddress: ip,
    userAgent,
    details: 'User changed password',
  });

  return { success: true };
};

export const updateProfile = async (
  userId: string,
  data: { name?: string; avatar?: string },
  ip: string,
  userAgent: string
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: data },
    { new: true, runValidators: true }
  ).select('-passwordHash -refreshTokens -mfaSecret -mfaBackupCodes');

  if (!user) throw new AppError('User not found', 404);

  await logAuditEvent({
    userId,
    action: AuditAction.USER_UPDATE,
    resource: 'User',
    resourceId: userId,
    ipAddress: ip,
    userAgent,
    details: 'User updated profile',
  });

  return user;
};

export const getActiveSessions = async (userId: string, currentToken?: string) => {
  const sessions = await UserSession.find({ userId, isValid: true })
    .sort({ createdAt: -1 })
    .limit(20);

  const currentHashed = currentToken ? hashToken(currentToken) : null;

  return sessions.map((s) => ({
    id: s._id.toString(),
    ipAddress: s.ipAddress,
    userAgent: s.userAgent,
    createdAt: (s as unknown as { createdAt: Date }).createdAt,
    isCurrent: currentHashed ? s.token === currentHashed : false,
  }));
};

export const revokeSession = async (userId: string, sessionId: string, ip: string, userAgent: string) => {
  const session = await UserSession.findOneAndUpdate(
    { _id: sessionId, userId },
    { isValid: false },
    { new: true }
  );
  if (!session) throw new AppError('Session not found', 404);

  await logAuditEvent({
    userId,
    action: AuditAction.USER_LOGOUT,
    resource: 'UserSession',
    resourceId: sessionId,
    ipAddress: ip,
    userAgent,
    details: 'Remote session revoked by user',
  });

  return { success: true, message: 'Session revoked successfully' };
};

export const revokeOtherSessions = async (userId: string, currentToken: string, ip: string, userAgent: string) => {
  const currentHashed = currentToken ? hashToken(currentToken) : null;
  const filter: Record<string, unknown> = { userId, isValid: true };
  if (currentHashed) {
    filter.token = { $ne: currentHashed };
  }

  const result = await UserSession.updateMany(filter, { isValid: false });

  await logAuditEvent({
    userId,
    action: AuditAction.USER_LOGOUT,
    resource: 'UserSession',
    resourceId: userId,
    ipAddress: ip,
    userAgent,
    details: `Revoked ${result.modifiedCount} other active sessions`,
  });

  return { success: true, revokedCount: result.modifiedCount };
};
