import apiClient from '../lib/axios';
import {
  ApiResponse,
  IRecoverySession,
  IProviderConfig,
  ReadinessReportData,
  RecoveryMethod,
  RecoverySessionStatus,
  EmailProvider,
} from '../types';

export const recoveryService = {
  async getSessions(params?: {
    accountId?: string;
    provider?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await apiClient.get<ApiResponse<IRecoverySession[]>>('/recovery/sessions', {
      params,
    });
    return {
      sessions: res.data.data || [],
      pagination: res.data.meta,
    };
  },

  async getSessionById(id: string) {
    const res = await apiClient.get<ApiResponse<{ session: IRecoverySession }>>(
      `/recovery/sessions/${id}`
    );
    return res.data.data?.session;
  },

  async createSession(data: { accountId: string; method: RecoveryMethod; notes?: string }) {
    const res = await apiClient.post<ApiResponse<{ session: IRecoverySession }>>(
      '/recovery/sessions',
      data
    );
    return res.data.data?.session;
  },

  async updateSession(
    sessionId: string,
    data: {
      status?: RecoverySessionStatus;
      notes?: string;
      step?: { step: number; description: string };
    }
  ) {
    const res = await apiClient.patch<ApiResponse<{ session: IRecoverySession }>>(
      `/recovery/sessions/${sessionId}`,
      data
    );
    return res.data.data?.session;
  },

  async getProviders() {
    const res = await apiClient.get<ApiResponse<IProviderConfig[]>>('/recovery/providers');
    return res.data.data || [];
  },

  async getProviderDetails(provider: EmailProvider) {
    const res = await apiClient.get<ApiResponse<IProviderConfig>>(
      `/recovery/providers/${provider}`
    );
    return res.data.data;
  },

  async getReadiness(accountId: string) {
    const res = await apiClient.get<ApiResponse<ReadinessReportData>>(
      `/recovery/readiness/${accountId}`
    );
    return res.data.data;
  },
};

export default recoveryService;
