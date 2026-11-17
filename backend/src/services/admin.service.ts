import { User, EmailAccount, RecoverySession, ProviderConfig, AuditLog } from '../models';
import { UserRole, EmailProvider } from '../types';
import { AppError } from '../middlewares';

export const getAdminStatistics = async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    totalAccounts,
    totalRecoverySessions,
    providerDistributionRaw,
    recentAuditLogs,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } }),
    EmailAccount.countDocuments(),
    RecoverySession.countDocuments(),
    EmailAccount.aggregate([
      { $group: { _id: '$provider', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AuditLog.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const providerDistribution: Record<string, number> = {};
  for (const item of providerDistributionRaw) {
    providerDistribution[item._id] = item.count;
  }

  return {
    totalUsers,
    activeUsers,
    totalAccounts,
    totalRecoverySessions,
    providerDistribution,
    recentAuditLogs,
  };
};

export const getAdminUsers = async (
  filter: {
    search?: string;
    role?: string;
  },
  page = 1,
  limit = 20
) => {
  const query: Record<string, unknown> = {};

  if (filter.role) query.role = filter.role;
  if (filter.search) {
    query.$or = [
      { name: { $regex: filter.search, $options: 'i' } },
      { email: { $regex: filter.search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-passwordHash -refreshTokens -mfaSecret -mfaBackupCodes')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAdminUserById = async (userId: string) => {
  const user = await User.findById(userId)
    .select('-passwordHash -refreshTokens -mfaSecret -mfaBackupCodes')
    .lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const accounts = await EmailAccount.find({ userId }).lean();
  const sessions = await RecoverySession.find({ userId }).sort({ createdAt: -1 }).limit(10).lean();

  return {
    user,
    accounts,
    recentSessions: sessions,
  };
};

export const updateAdminUserRole = async (userId: string, role: UserRole) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  ).select('-passwordHash -refreshTokens -mfaSecret -mfaBackupCodes');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

export const getAdminAccounts = async (
  filter: {
    provider?: string;
    search?: string;
  },
  page = 1,
  limit = 20
) => {
  const query: Record<string, unknown> = {};
  if (filter.provider) query.provider = filter.provider;
  if (filter.search) {
    query.email = { $regex: filter.search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [accounts, total] = await Promise.all([
    EmailAccount.find(query)
      .populate('userId', 'name email role')
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

export const updateProviderConfig = async (
  provider: EmailProvider,
  data: Partial<ProviderConfigUpdateDTO>
) => {
  const config = await ProviderConfig.findOneAndUpdate(
    { provider },
    { $set: data },
    { new: true, upsert: true }
  );

  return config;
};

export interface ProviderConfigUpdateDTO {
  name: string;
  logo: string;
  domains: string[];
  recoveryUrl: string;
  hasOAuth: boolean;
  documentationUrl: string;
  isActive: boolean;
}
