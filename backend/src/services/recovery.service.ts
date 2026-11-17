import { v4 as uuidv4 } from 'uuid';
import { RecoverySession, EmailAccount, ProviderConfig } from '../models';
import {
  RecoveryMethod,
  RecoverySessionStatus,
  AuditAction,
  RecoveryReadiness,
  EmailProvider,
} from '../types';
import { AppError } from '../middlewares';
import { logAuditEvent } from './audit.service';

export interface CreateSessionDTO {
  accountId: string;
  method: RecoveryMethod;
  notes?: string;
}

export interface UpdateSessionDTO {
  status?: RecoverySessionStatus;
  notes?: string;
  step?: {
    step: number;
    description: string;
  };
}

export const createRecoverySession = async (
  userId: string,
  data: CreateSessionDTO,
  ip: string,
  userAgent: string
) => {
  const account = await EmailAccount.findOne({ _id: data.accountId, userId });
  if (!account) {
    throw new AppError('Email account not found or access denied', 404);
  }

  const sessionId = uuidv4();

  const session = await RecoverySession.create({
    sessionId,
    userId,
    accountId: account._id,
    provider: account.provider,
    method: data.method,
    status: RecoverySessionStatus.INITIATED,
    startTime: new Date(),
    notes: data.notes,
    steps: [
      {
        step: 1,
        description: `Recovery session initiated using method: ${data.method}`,
        completedAt: new Date(),
      },
    ],
  });

  await logAuditEvent({
    userId,
    action: AuditAction.RECOVERY_START,
    resource: 'RecoverySession',
    resourceId: session.sessionId,
    ipAddress: ip,
    userAgent,
    details: `Started recovery session for ${account.email} using ${data.method}`,
  });

  return session;
};

export const getRecoverySessions = async (
  userId: string,
  filter: {
    accountId?: string;
    provider?: string;
    status?: string;
  },
  page = 1,
  limit = 20
) => {
  const query: Record<string, unknown> = { userId };

  if (filter.accountId) query.accountId = filter.accountId;
  if (filter.provider) query.provider = filter.provider;
  if (filter.status) query.status = filter.status;

  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    RecoverySession.find(query)
      .populate('accountId', 'email label provider ownershipStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    RecoverySession.countDocuments(query),
  ]);

  return {
    sessions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getRecoverySessionById = async (userId: string, sessionId: string) => {
  const session = await RecoverySession.findOne({ sessionId, userId })
    .populate('accountId', 'email label provider ownershipStatus')
    .lean();

  if (!session) {
    throw new AppError('Recovery session not found or access denied', 404);
  }

  return session;
};

export const updateRecoverySession = async (
  userId: string,
  sessionId: string,
  data: UpdateSessionDTO,
  ip: string,
  userAgent: string
) => {
  const session = await RecoverySession.findOne({ sessionId, userId });
  if (!session) {
    throw new AppError('Recovery session not found or access denied', 404);
  }

  if (data.status) {
    session.status = data.status;
    if (
      data.status === RecoverySessionStatus.COMPLETED ||
      data.status === RecoverySessionStatus.FAILED ||
      data.status === RecoverySessionStatus.CANCELLED
    ) {
      session.completionTime = new Date();
    }
  }

  if (data.notes !== undefined) {
    session.notes = data.notes;
  }

  if (data.step) {
    session.steps.push({
      step: data.step.step,
      description: data.step.description,
      completedAt: new Date(),
    });
  }

  await session.save();

  const auditAction =
    data.status === RecoverySessionStatus.COMPLETED
      ? AuditAction.RECOVERY_COMPLETE
      : data.status === RecoverySessionStatus.FAILED
      ? AuditAction.RECOVERY_FAIL
      : AuditAction.RECOVERY_START;

  await logAuditEvent({
    userId,
    action: auditAction,
    resource: 'RecoverySession',
    resourceId: sessionId,
    ipAddress: ip,
    userAgent,
    details: `Updated recovery session ${sessionId} to status ${session.status}`,
  });

  return session;
};

export const getProviderDetails = async (provider: EmailProvider) => {
  const config = await ProviderConfig.findOne({ provider, isActive: true }).lean();
  if (!config) {
    throw new AppError(`Provider configuration not found for: ${provider}`, 404);
  }
  return config;
};

export const getAllProviders = async () => {
  return ProviderConfig.find({ isActive: true }).lean();
};

export const calculateReadinessReport = async (userId: string, accountId: string) => {
  const account = await EmailAccount.findOne({ _id: accountId, userId });
  if (!account) {
    throw new AppError('Email account not found or access denied', 404);
  }

  const providerConfig = await ProviderConfig.findOne({ provider: account.provider }).lean();

  const availableMethods: RecoveryMethod[] = [];
  const missingMethods: RecoveryMethod[] = [];
  const recommendations: string[] = [];

  // 1. Check recovery email
  if (account.hasRecoveryEmail) {
    availableMethods.push(RecoveryMethod.RECOVERY_EMAIL);
  } else {
    missingMethods.push(RecoveryMethod.RECOVERY_EMAIL);
    recommendations.push(
      'Configure a secondary recovery email address in your provider security settings.'
    );
  }

  // 2. Check recovery phone
  if (account.hasRecoveryPhone) {
    availableMethods.push(RecoveryMethod.RECOVERY_PHONE);
  } else {
    missingMethods.push(RecoveryMethod.RECOVERY_PHONE);
    recommendations.push(
      'Link a verified mobile phone number capable of receiving SMS authentication codes.'
    );
  }

  // 3. Check 2FA
  if (account.has2FA) {
    availableMethods.push(RecoveryMethod.AUTHENTICATOR_APP);
  } else {
    missingMethods.push(RecoveryMethod.AUTHENTICATOR_APP);
    recommendations.push(
      'Activate Two-Factor Authentication (TOTP app like Google Authenticator or Microsoft Authenticator).'
    );
  }

  // 4. Check Backup Codes
  if (account.hasBackupCodes) {
    availableMethods.push(RecoveryMethod.BACKUP_CODES);
  } else {
    missingMethods.push(RecoveryMethod.BACKUP_CODES);
    recommendations.push(
      'Generate and securely store printable one-time emergency backup codes in your MailVault.'
    );
  }

  // Calculate score (0-100)
  const trueCount = [
    account.hasRecoveryEmail,
    account.hasRecoveryPhone,
    account.has2FA,
    account.hasBackupCodes,
  ].filter(Boolean).length;

  const score = Math.round((trueCount / 4) * 100);

  let readiness = RecoveryReadiness.SETUP_RECOMMENDED;
  if (score === 100) {
    readiness = RecoveryReadiness.READY;
  } else if (score >= 50) {
    readiness = RecoveryReadiness.PARTIALLY_READY;
  } else if (score >= 25) {
    readiness = RecoveryReadiness.MISSING_INFO;
  }

  return {
    accountId: account._id,
    email: account.email,
    provider: account.provider,
    label: account.label,
    readiness,
    score,
    availableMethods,
    missingMethods,
    recommendations,
    providerConfig: providerConfig
      ? {
          name: providerConfig.name,
          logo: providerConfig.logo,
          recoveryUrl: providerConfig.recoveryUrl,
          documentationUrl: providerConfig.documentationUrl,
          supportedMethods: providerConfig.supportedMethods,
          instructions: providerConfig.instructions,
        }
      : null,
  };
};
