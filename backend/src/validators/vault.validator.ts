import { z } from 'zod';

export const updateVaultSchema = z.object({
  encryptedData: z.string().min(1, 'Encrypted data payload is required'),
  iv: z.string().min(1, 'Initialization vector (IV) is required'),
  authTag: z.string().min(1, 'Authentication tag is required'),
});
