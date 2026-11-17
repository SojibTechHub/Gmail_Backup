import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares';
import { formatResponse } from '../utils';
import { EmailProvider, UserRole } from '../types';
import * as adminService from '../services/admin.service';
import * as auditService from '../services/audit.service';

export const getStatistics = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await adminService.getAdminStatistics();
  res.status(200).json(formatResponse(true, 'Admin platform statistics retrieved', stats));
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { search, role, page, limit } = req.query;

  const result = await adminService.getAdminUsers(
    {
      search: search as string,
      role: role as string,
    },
    page ? parseInt(page as string, 10) : 1,
    limit ? parseInt(limit as string, 10) : 20
  );

  res.status(200).json(
    formatResponse(true, 'Users list retrieved', result.users, result.pagination)
  );
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const userDetails = await adminService.getAdminUserById(req.params.id);
  res.status(200).json(formatResponse(true, 'User details retrieved', userDetails));
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body;
  const updatedUser = await adminService.updateAdminUserRole(req.params.id, role as UserRole);
  res.status(200).json(formatResponse(true, 'User role updated', { user: updatedUser }));
});

export const getAccounts = asyncHandler(async (req: Request, res: Response) => {
  const { provider, search, page, limit } = req.query;

  const result = await adminService.getAdminAccounts(
    {
      provider: provider as string,
      search: search as string,
    },
    page ? parseInt(page as string, 10) : 1,
    limit ? parseInt(limit as string, 10) : 20
  );

  res.status(200).json(
    formatResponse(true, 'System accounts retrieved', result.accounts, result.pagination)
  );
});

export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const { userId, action, startDate, endDate, page, limit } = req.query;

  const result = await auditService.getAuditLogs(
    {
      userId: userId as string,
      action: action as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    },
    page ? parseInt(page as string, 10) : 1,
    limit ? parseInt(limit as string, 10) : 20
  );

  res.status(200).json(
    formatResponse(true, 'System audit logs retrieved', result.logs, result.pagination)
  );
});

export const updateProvider = asyncHandler(async (req: Request, res: Response) => {
  const provider = req.params.provider as EmailProvider;
  const config = await adminService.updateProviderConfig(provider, req.body);
  res.status(200).json(formatResponse(true, 'Provider configuration updated', config));
});
