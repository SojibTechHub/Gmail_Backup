import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares';
import { formatResponse } from '../utils';
import { EmailProvider } from '../types';
import * as recoveryService from '../services/recovery.service';

const getClientIp = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  );
};

export const createSession = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  const session = await recoveryService.createRecoverySession(
    req.user!._id.toString(),
    req.body,
    ip,
    userAgent
  );

  res.status(201).json(formatResponse(true, 'Recovery session initiated', { session }));
});

export const getSessions = asyncHandler(async (req: Request, res: Response) => {
  const { accountId, provider, status, page, limit } = req.query;

  const result = await recoveryService.getRecoverySessions(
    req.user!._id.toString(),
    {
      accountId: accountId as string,
      provider: provider as string,
      status: status as string,
    },
    page ? parseInt(page as string, 10) : 1,
    limit ? parseInt(limit as string, 10) : 20
  );

  res.status(200).json(
    formatResponse(true, 'Recovery sessions retrieved', result.sessions, result.pagination)
  );
});

export const getSessionById = asyncHandler(async (req: Request, res: Response) => {
  const session = await recoveryService.getRecoverySessionById(
    req.user!._id.toString(),
    req.params.id as string
  );
  res.status(200).json(formatResponse(true, 'Recovery session retrieved', { session }));
});

export const updateSession = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  const session = await recoveryService.updateRecoverySession(
    req.user!._id.toString(),
    req.params.id as string,
    req.body,
    ip,
    userAgent
  );

  res.status(200).json(formatResponse(true, 'Recovery session updated', { session }));
});

export const getProviderDetails = asyncHandler(async (req: Request, res: Response) => {
  const provider = req.params.provider as EmailProvider;
  const config = await recoveryService.getProviderDetails(provider);
  res.status(200).json(formatResponse(true, 'Provider details retrieved', config));
});

export const getProviders = asyncHandler(async (_req: Request, res: Response) => {
  const providers = await recoveryService.getAllProviders();
  res.status(200).json(formatResponse(true, 'Supported email providers retrieved', providers));
});

export const getReadiness = asyncHandler(async (req: Request, res: Response) => {
  const report = await recoveryService.calculateReadinessReport(
    req.user!._id.toString(),
    req.params.accountId as string
  );
  res.status(200).json(formatResponse(true, 'Recovery readiness assessment report', report));
});
