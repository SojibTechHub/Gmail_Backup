import { Request, Response } from 'express';
import config from '../config';
import { asyncHandler } from '../middlewares';
import { formatResponse } from '../utils';
import * as authService from '../services/auth.service';

const getClientIp = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  );
};

const setTokenCookies = (res: Response, accessToken: string, refreshToken?: string) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      maxAge: config.cookie.maxAge, // 7 days
    });
  }
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  const result = await authService.register(req.body, ip, userAgent);
  setTokenCookies(res, result.accessToken, result.refreshToken);

  res.status(201).json(
    formatResponse(true, 'Registration successful. Please verify your email.', {
      user: result.user,
      accessToken: result.accessToken,
    })
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  const { email, password, mfaCode } = req.body;

  const result = await authService.login(email, password, mfaCode, ip, userAgent);

  if (result.mfaRequired) {
    res.status(200).json(
      formatResponse(true, 'Two-factor authentication required', {
        mfaRequired: true,
        userId: result.userId,
      })
    );
    return;
  }

  if (result.accessToken && result.refreshToken) {
    setTokenCookies(res, result.accessToken, result.refreshToken);
  }

  res.status(200).json(
    formatResponse(true, 'Login successful', {
      mfaRequired: false,
      user: result.user,
      accessToken: result.accessToken,
    })
  );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  const token = req.cookies?.refreshToken || '';

  if (req.user) {
    await authService.logout(req.user._id.toString(), token, ip, userAgent);
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json(formatResponse(true, 'Logged out successfully'));
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  const result = await authService.verifyEmail(token);
  res.status(200).json(formatResponse(true, 'Email verified successfully', result));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  res.status(200).json(
    formatResponse(
      true,
      'If that email exists in our system, a password reset link has been sent.'
    )
  );
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  const { token, password } = req.body;

  await authService.resetPassword(token, password, ip, userAgent);
  res.status(200).json(formatResponse(true, 'Password has been reset successfully. Please log in.'));
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!rawRefreshToken) {
    res.status(401).json(formatResponse(false, 'Refresh token required'));
    return;
  }

  const result = await authService.refreshAccessToken(rawRefreshToken);
  setTokenCookies(res, result.accessToken);

  res.status(200).json(formatResponse(true, 'Token refreshed', result));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json(formatResponse(false, 'Not authenticated'));
    return;
  }

  res.status(200).json(
    formatResponse(true, 'User profile retrieved', {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isEmailVerified: req.user.isEmailVerified,
        isMfaEnabled: req.user.isMfaEnabled,
        avatar: req.user.avatar,
        lastLogin: req.user.lastLogin,
        createdAt: (req.user as unknown as { createdAt: Date }).createdAt,
      },
    })
  );
});

export const enableMfa = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.setupMfa(req.user!._id.toString());
  res.status(200).json(formatResponse(true, 'MFA setup initiated', result));
});

export const verifyMfa = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  const { token } = req.body;

  const result = await authService.verifyAndEnableMfa(
    req.user!._id.toString(),
    token,
    ip,
    userAgent
  );

  res.status(200).json(
    formatResponse(
      true,
      'Two-factor authentication enabled successfully. Save your backup codes.',
      result
    )
  );
});

export const disableMfa = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  const { token } = req.body;

  await authService.disableMfa(req.user!._id.toString(), token, ip, userAgent);
  res.status(200).json(formatResponse(true, 'Two-factor authentication disabled'));
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(
    req.user!._id.toString(),
    currentPassword,
    newPassword,
    ip,
    userAgent
  );

  res.status(200).json(formatResponse(true, 'Password updated successfully'));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  const updated = await authService.updateProfile(
    req.user!._id.toString(),
    req.body,
    ip,
    userAgent
  );

  res.status(200).json(formatResponse(true, 'Profile updated successfully', { user: updated }));
});

export const getSessions = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1] || '';
  const sessions = await authService.getActiveSessions(req.user!._id.toString(), token);
  res.status(200).json(formatResponse(true, 'Active sessions retrieved', { sessions }));
});

export const revokeSession = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  const result = await authService.revokeSession(
    req.user!._id.toString(),
    req.params.id as string,
    ip,
    userAgent
  );
  res.status(200).json(formatResponse(true, result.message));
});

export const revokeOtherSessions = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1] || '';
  const result = await authService.revokeOtherSessions(
    req.user!._id.toString(),
    token,
    ip,
    userAgent
  );
  res.status(200).json(formatResponse(true, 'Other sessions revoked', result));
});
