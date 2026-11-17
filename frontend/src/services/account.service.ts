import apiClient from '../lib/axios';
import { ApiResponse, IEmailAccount, UserDashboardStats } from '../types';

export const accountService = {
  async getAccounts(params?: {
    search?: string;
    provider?: string;
    readiness?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await apiClient.get<ApiResponse<IEmailAccount[]>>('/accounts', { params });
    return {
      accounts: res.data.data || [],
      pagination: res.data.meta,
    };
  },

  async getAccountById(id: string) {
    const res = await apiClient.get<ApiResponse<{ account: IEmailAccount }>>(`/accounts/${id}`);
    return res.data.data?.account;
  },

  async createAccount(data: Partial<IEmailAccount>) {
    const res = await apiClient.post<ApiResponse<{ account: IEmailAccount }>>('/accounts', data);
    return res.data.data?.account;
  },

  async updateAccount(id: string, data: Partial<IEmailAccount>) {
    const res = await apiClient.patch<ApiResponse<{ account: IEmailAccount }>>(
      `/accounts/${id}`,
      data
    );
    return res.data.data?.account;
  },

  async deleteAccount(id: string) {
    const res = await apiClient.delete<ApiResponse>(`/accounts/${id}`);
    return res.data;
  },

  async getDashboardStats() {
    const res = await apiClient.get<ApiResponse<UserDashboardStats>>('/accounts/stats');
    return res.data.data;
  },
};

export default accountService;
