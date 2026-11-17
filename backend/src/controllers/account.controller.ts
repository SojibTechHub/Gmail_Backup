import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares';
import { formatResponse } from '../utils';
import * as accountService from '../services/account.service';

const getClientIp = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  );
};

export const createAccount = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  const account = await accountService.createAccount(
    req.user!._id.toString(),
    req.body,
    ip,
    userAgent
  );

  res.status(201).json(formatResponse(true, 'Email account added successfully', { account }));
});

export const getAccounts = asyncHandler(async (req: Request, res: Response) => {
  const { search, provider, readiness, page, limit } = req.query;

  const result = await accountService.getAccounts(
    req.user!._id.toString(),
    {
      search: search as string,
      provider: provider as string,
      readiness: readiness as string,
    },
    page ? parseInt(page as string, 10) : 1,
    limit ? parseInt(limit as string, 10) : 20
  );

  res.status(200).json(
    formatResponse(true, 'Email accounts retrieved', result.accounts, result.pagination)
  );
});

export const getAccountById = asyncHandler(async (req: Request, res: Response) => {
  const account = await accountService.getAccountById(
    req.user!._id.toString(),
    req.params.id
  );
  res.status(200).json(formatResponse(true, 'Email account retrieved', { account }));
});

export const updateAccount = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  const account = await accountService.updateAccount(
    req.user!._id.toString(),
    req.params.id,
    req.body,
    ip,
    userAgent
  );

  res.status(200).json(formatResponse(true, 'Email account updated successfully', { account }));
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  await accountService.deleteAccount(
    req.user!._id.toString(),
    req.params.id,
    ip,
    userAgent
  );

  res.status(200).json(formatResponse(true, 'Email account and associated vault deleted'));
});

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await accountService.getUserDashboardStats(req.user!._id.toString());
  res.status(200).json(formatResponse(true, 'Dashboard stats retrieved', stats));
});
