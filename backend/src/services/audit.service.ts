import { AuditLog } from '../models';
import { AuditAction } from '../types';
import { logger } from '../utils';

export interface CreateAuditLogParams {
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress: string;
  userAgent?: string;
}

export const logAuditEvent = async (params: CreateAuditLogParams): Promise<void> => {
  try {
    // Ensure sensitive terms are never recorded
    const sanitizedDetails = params.details
      ? params.details.replace(/(password|token|secret|key|authorization)=([^& ]+)/gi, '$1=[REDACTED]')
      : undefined;

    await AuditLog.create({
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: sanitizedDetails,
      ipAddress: params.ipAddress || 'unknown',
      userAgent: params.userAgent || 'unknown',
    });
  } catch (error) {
    logger.error('Failed to record audit log:', error);
  }
};

export const getAuditLogs = async (
  filter: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  },
  page = 1,
  limit = 20
) => {
  const query: Record<string, unknown> = {};

  if (filter.userId) query.userId = filter.userId;
  if (filter.action) query.action = filter.action;
  if (filter.startDate || filter.endDate) {
    query.createdAt = {};
    if (filter.startDate) (query.createdAt as Record<string, unknown>).$gte = filter.startDate;
    if (filter.endDate) (query.createdAt as Record<string, unknown>).$lte = filter.endDate;
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(query),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
