import { z } from 'zod';
import { RecoveryMethod, RecoverySessionStatus } from '../types';

export const createSessionSchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
  method: z.nativeEnum(RecoveryMethod),
  notes: z.string().max(1000).optional(),
});

export const updateSessionSchema = z.object({
  status: z.nativeEnum(RecoverySessionStatus).optional(),
  notes: z.string().max(1000).optional(),
  step: z.object({
    step: z.number().int().min(1),
    description: z.string().min(1),
  }).optional(),
});
