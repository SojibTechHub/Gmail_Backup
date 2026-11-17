import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares';
import { formatResponse } from '../utils';
import * as vaultService from '../services/vault.service';

const getClientIp = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  );
};

export const getVault = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  const vault = await vaultService.getVaultData(
    req.user!._id.toString(),
    req.params.accountId as string,
    ip,
    userAgent
  );

  res.status(200).json(formatResponse(true, 'Encrypted recovery vault retrieved', vault));
});

export const updateVault = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  const result = await vaultService.upsertVaultData(
    req.user!._id.toString(),
    req.params.accountId as string,
    req.body,
    ip,
    userAgent
  );

  res.status(200).json(formatResponse(true, 'Recovery vault updated securely', result));
});

export const deleteVault = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  await vaultService.deleteVaultData(
    req.user!._id.toString(),
    req.params.accountId as string,
    ip,
    userAgent
  );

  res.status(200).json(formatResponse(true, 'Recovery vault purged successfully'));
});
