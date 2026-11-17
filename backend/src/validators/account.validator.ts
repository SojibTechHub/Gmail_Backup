import { z } from 'zod';
import { EmailProvider, AccountOwnershipStatus } from '../types';

export const createAccountSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  provider: z.nativeEnum(EmailProvider).optional(),
  label: z.string().min(1, 'Label is required').max(100),
  ownershipStatus: z.nativeEnum(AccountOwnershipStatus).default(AccountOwnershipStatus.OWNER),
  hasRecoveryEmail: z.boolean().default(false),
  hasRecoveryPhone: z.boolean().default(false),
  has2FA: z.boolean().default(false),
  hasBackupCodes: z.boolean().default(false),
  notes: z.string().max(1000).optional(),
});

export const updateAccountSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  provider: z.nativeEnum(EmailProvider).optional(),
  ownershipStatus: z.nativeEnum(AccountOwnershipStatus).optional(),
  hasRecoveryEmail: z.boolean().optional(),
  hasRecoveryPhone: z.boolean().optional(),
  has2FA: z.boolean().optional(),
  hasBackupCodes: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
});
