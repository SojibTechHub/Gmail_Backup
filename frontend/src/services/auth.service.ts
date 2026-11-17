import apiClient from '../lib/axios';
import { ApiResponse, IUser } from '../types';

export const authService = {
  async register(data: { name: string; email: string; password: string }) {
    const res = await apiClient.post<ApiResponse<{ user: IUser; accessToken: string }>>(
      '/auth/register',
      data
    );
    return res.data;
  },

  async login(data: { email: string; password: string; mfaCode?: string }) {
    const res = await apiClient.post<
      ApiResponse<{
        mfaRequired?: boolean;
        userId?: string;
        user?: IUser;
        accessToken?: string;
      }>
    >('/auth/login', data);
    return res.data;
  },

  async logout() {
    const res = await apiClient.post<ApiResponse>('/auth/logout');
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get<ApiResponse<{ user: IUser }>>('/auth/me');
    return res.data.data?.user;
  },

  async verifyEmail(token: string) {
    const res = await apiClient.post<ApiResponse>('/auth/verify-email', { token });
    return res.data;
  },

  async forgotPassword(email: string) {
    const res = await apiClient.post<ApiResponse>('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(token: string, password: string) {
    const res = await apiClient.post<ApiResponse>('/auth/reset-password', {
      token,
      password,
    });
    return res.data;
  },

  async enableMfa() {
    const res = await apiClient.post<ApiResponse<{ secret: string; qrCode: string }>>(
      '/auth/mfa/enable'
    );
    return res.data.data;
  },

  async verifyMfa(token: string) {
    const res = await apiClient.post<ApiResponse<{ backupCodes: string[] }>>(
      '/auth/mfa/verify',
      { token }
    );
    return res.data.data;
  },

  async disableMfa(token: string) {
    const res = await apiClient.post<ApiResponse>('/auth/mfa/disable', { token });
    return res.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await apiClient.post<ApiResponse>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },

  async updateProfile(data: { name?: string; avatar?: string }) {
    const res = await apiClient.patch<ApiResponse<{ user: IUser }>>('/auth/profile', data);
    return res.data.data?.user;
  },
};

export default authService;
