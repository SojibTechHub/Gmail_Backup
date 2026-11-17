import apiClient from '../lib/axios';
import {
  ApiResponse,
  AdminDashboardStats,
  IUser,
  IEmailAccount,
  IAuditLog,
  IProviderConfig,
  EmailProvider,
  UserRole,
} from '../types';

export const adminService = {
  async getStatistics() {
    const res = await apiClient.get<ApiResponse<AdminDashboardStats>>('/admin/statistics');
    return res.data.data;
  },

  async getUsers(params?: { search?: string; role?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<IUser[]>>('/admin/users', { params });
    return {
      users: res.data.data || [],
      pagination: res.data.meta,
    };
  },

  async getUserById(id: string) {
    const res = await apiClient.get<ApiResponse<{ user: IUser; accounts: IEmailAccount[] }>>(
      `/admin/users/${id}`
    );
    return res.data.data;
  },

  async updateUserRole(id: string, role: UserRole) {
    const res = await apiClient.patch<ApiResponse<{ user: IUser }>>(`/admin/users/${id}/role`, {
      role,
    });
    return res.data.data?.user;
  },

  async getAccounts(params?: { provider?: string; search?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<IEmailAccount[]>>('/admin/accounts', { params });
    return {
      accounts: res.data.data || [],
      pagination: res.data.meta,
    };
  },

  async getAuditLogs(params?: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await apiClient.get<ApiResponse<IAuditLog[]>>('/admin/audit-logs', { params });
    return {
      logs: res.data.data || [],
      pagination: res.data.meta,
    };
  },

  async updateProvider(provider: EmailProvider, data: Partial<IProviderConfig>) {
    const res = await apiClient.patch<ApiResponse<IProviderConfig>>(
      `/admin/providers/${provider}`,
      data
    );
    return res.data.data;
  },
};

export default adminService;
