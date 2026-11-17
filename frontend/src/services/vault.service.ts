import apiClient from '../lib/axios';
import { ApiResponse, IRecoveryVault } from '../types';

export const vaultService = {
  async getVault(accountId: string) {
    const res = await apiClient.get<ApiResponse<IRecoveryVault>>(`/vault/${accountId}`);
    return res.data.data;
  },

  async updateVault(
    accountId: string,
    payload: { encryptedData: string; iv: string; authTag: string }
  ) {
    const res = await apiClient.put<ApiResponse<{ success: boolean; accountId: string }>>(
      `/vault/${accountId}`,
      payload
    );
    return res.data.data;
  },

  async deleteVault(accountId: string) {
    const res = await apiClient.delete<ApiResponse>(`/vault/${accountId}`);
    return res.data;
  },
};

export default vaultService;
