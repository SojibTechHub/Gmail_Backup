import { RecoveryVault, EmailAccount } from '../models';
import { AuditAction } from '../types';
import { AppError } from '../middlewares';
import { logAuditEvent } from './audit.service';

export interface VaultPayload {
  encryptedData: string;
  iv: string;
  authTag: string;
}

export const getVaultData = async (
  userId: string,
  accountId: string,
  ip: string,
  userAgent: string
) => {
  // 1. Verify account ownership
  const account = await EmailAccount.findOne({ _id: accountId, userId });
  if (!account) {
    throw new AppError('Email account not found or access denied', 404);
  }

  // 2. Fetch encrypted vault
  const vault = await RecoveryVault.findOne({ accountId, userId });

  await logAuditEvent({
    userId,
    action: AuditAction.VAULT_ACCESS,
    resource: 'RecoveryVault',
    resourceId: accountId,
    ipAddress: ip,
    userAgent,
    details: `Accessed encrypted vault for account ${account.email}`,
  });

  if (!vault) {
    return {
      hasVault: false,
      accountId,
      encryptedData: null,
      iv: null,
      authTag: null,
    };
  }

  return {
    hasVault: true,
    accountId,
    encryptedData: vault.encryptedData,
    iv: vault.iv,
    authTag: vault.authTag,
    updatedAt: (vault as unknown as { updatedAt: Date }).updatedAt,
  };
};

export const upsertVaultData = async (
  userId: string,
  accountId: string,
  payload: VaultPayload,
  ip: string,
  userAgent: string
) => {
  // 1. Verify account ownership
  const account = await EmailAccount.findOne({ _id: accountId, userId });
  if (!account) {
    throw new AppError('Email account not found or access denied', 404);
  }

  // 2. Upsert client-encrypted blob (never decrypt server-side)
  const vault = await RecoveryVault.findOneAndUpdate(
    { accountId, userId },
    {
      userId,
      accountId,
      encryptedData: payload.encryptedData,
      iv: payload.iv,
      authTag: payload.authTag,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await logAuditEvent({
    userId,
    action: AuditAction.VAULT_UPDATE,
    resource: 'RecoveryVault',
    resourceId: accountId,
    ipAddress: ip,
    userAgent,
    details: `Updated encrypted vault for account ${account.email}`,
  });

  return {
    success: true,
    accountId,
    updatedAt: (vault as unknown as { updatedAt: Date }).updatedAt,
  };
};

export const deleteVaultData = async (
  userId: string,
  accountId: string,
  ip: string,
  userAgent: string
) => {
  const account = await EmailAccount.findOne({ _id: accountId, userId });
  if (!account) {
    throw new AppError('Email account not found or access denied', 404);
  }

  await RecoveryVault.findOneAndDelete({ accountId, userId });

  await logAuditEvent({
    userId,
    action: AuditAction.VAULT_UPDATE,
    resource: 'RecoveryVault',
    resourceId: accountId,
    ipAddress: ip,
    userAgent,
    details: `Cleared encrypted vault for account ${account.email}`,
  });

  return { success: true };
};
