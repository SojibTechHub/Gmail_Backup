import { EmailAccount, RecoveryVault, RecoverySession } from '../models';
import { EmailProvider, AccountOwnershipStatus, AuditAction, RecoveryReadiness } from '../types';
import { AppError } from '../middlewares';
import { detectProvider } from '../utils';
import { logAuditEvent } from './audit.service';

export interface CreateAccountDTO {
  email: string;
  provider?: EmailProvider;
  label: string;
  ownershipStatus?: AccountOwnershipStatus;
  hasRecoveryEmail?: boolean;
  hasRecoveryPhone?: boolean;
  has2FA?: boolean;
  hasBackupCodes?: boolean;
  notes?: string;
}

export interface UpdateAccountDTO {
  label?: string;
  provider?: EmailProvider;
  ownershipStatus?: AccountOwnershipStatus;
  hasRecoveryEmail?: boolean;
  hasRecoveryPhone?: boolean;
  has2FA?: boolean;
  hasBackupCodes?: boolean;
  notes?: string;
}

export const createAccount = async (
  userId: string,
  data: CreateAccountDTO,
  ip: string,
  userAgent: string
) => {
  const provider = data.provider || detectProvider(data.email);

  const existing = await EmailAccount.findOne({
    userId,
    email: data.email.toLowerCase(),
  });

  if (existing) {
    throw new AppError('This email account has already been registered in your profile', 409);
  }

  const account = await EmailAccount.create({
    userId,
    email: data.email.toLowerCase(),
    provider,
    label: data.label,
    ownershipStatus: data.ownershipStatus || AccountOwnershipStatus.OWNER,
    hasRecoveryEmail: data.hasRecoveryEmail ?? false,
    hasRecoveryPhone: data.hasRecoveryPhone ?? false,
    has2FA: data.has2FA ?? false,
    hasBackupCodes: data.hasBackupCodes ?? false,
    notes: data.notes,
  });

  await logAuditEvent({
    userId,
    action: AuditAction.ACCOUNT_ADD,
    resource: 'EmailAccount',
    resourceId: account._id.toString(),
    ipAddress: ip,
    userAgent,
    details: `Added email account ${account.email} (${account.provider})`,
  });

  return account;
};

export const getAccounts = async (
  userId: string,
  filter: {
    search?: string;
    provider?: string;
    readiness?: string;
  },
  page = 1,
  limit = 20
) => {
  const query: Record<string, unknown> = { userId };

  if (filter.provider) {
    query.provider = filter.provider;
  }
  if (filter.readiness) {
    query.recoveryReadiness = filter.readiness;
  }
  if (filter.search) {
    query.$or = [
      { email: { $regex: filter.search, $options: 'i' } },
      { label: { $regex: filter.search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [accounts, total] = await Promise.all([
    EmailAccount.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    EmailAccount.countDocuments(query),
  ]);

  return {
    accounts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAccountById = async (userId: string, accountId: string) => {
  const account = await EmailAccount.findOne({ _id: accountId, userId });
  if (!account) {
    throw new AppError('Email account not found or access denied', 404);
  }
  return account;
};

export const updateAccount = async (
  userId: string,
  accountId: string,
  data: UpdateAccountDTO,
  ip: string,
  userAgent: string
) => {
  const account = await EmailAccount.findOne({ _id: accountId, userId });
  if (!account) {
    throw new AppError('Email account not found or access denied', 404);
  }

  if (data.label !== undefined) account.label = data.label;
  if (data.provider !== undefined) account.provider = data.provider;
  if (data.ownershipStatus !== undefined) account.ownershipStatus = data.ownershipStatus;
  if (data.hasRecoveryEmail !== undefined) account.hasRecoveryEmail = data.hasRecoveryEmail;
  if (data.hasRecoveryPhone !== undefined) account.hasRecoveryPhone = data.hasRecoveryPhone;
  if (data.has2FA !== undefined) account.has2FA = data.has2FA;
  if (data.hasBackupCodes !== undefined) account.hasBackupCodes = data.hasBackupCodes;
  if (data.notes !== undefined) account.notes = data.notes;

  await account.save();

  await logAuditEvent({
    userId,
    action: AuditAction.ACCOUNT_UPDATE,
    resource: 'EmailAccount',
    resourceId: account._id.toString(),
    ipAddress: ip,
    userAgent,
    details: `Updated email account ${account.email}`,
  });

  return account;
};

export const deleteAccount = async (
  userId: string,
  accountId: string,
  ip: string,
  userAgent: string
) => {
  const account = await EmailAccount.findOneAndDelete({ _id: accountId, userId });
  if (!account) {
    throw new AppError('Email account not found or access denied', 404);
  }

  // Also remove associated vault and recovery sessions
  await Promise.all([
    RecoveryVault.deleteMany({ accountId, userId }),
    RecoverySession.deleteMany({ accountId, userId }),
  ]);

  await logAuditEvent({
    userId,
    action: AuditAction.ACCOUNT_DELETE,
    resource: 'EmailAccount',
    resourceId: accountId,
    ipAddress: ip,
    userAgent,
    details: `Deleted email account ${account.email}`,
  });

  return { success: true };
};

export const getUserDashboardStats = async (userId: string) => {
  const [totalAccounts, recoveryReady, partiallyReady, missingInfo, recentActivities] = await Promise.all([
    EmailAccount.countDocuments({ userId }),
    EmailAccount.countDocuments({ userId, recoveryReadiness: RecoveryReadiness.READY }),
    EmailAccount.countDocuments({ userId, recoveryReadiness: RecoveryReadiness.PARTIALLY_READY }),
    EmailAccount.countDocuments({
      userId,
      recoveryReadiness: {
        $in: [RecoveryReadiness.MISSING_INFO, RecoveryReadiness.SETUP_RECOMMENDED],
      },
    }),
    RecoverySession.find({ userId })
      .populate('accountId', 'email provider label')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    totalAccounts,
    recoveryReady,
    partiallyReady,
    missingInfo,
    recentActivities,
  };
};
