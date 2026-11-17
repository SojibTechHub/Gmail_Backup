import apiClient from '../lib/axios';
import { ApiResponse, INotification } from '../types';

export const notificationService = {
  async getNotifications(params?: { page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<INotification[]>>('/notifications', { params });
    return {
      notifications: res.data.data || [],
      unreadCount: res.data.meta?.total || 0,
      pagination: res.data.meta,
    };
  },

  async markRead(id: string) {
    const res = await apiClient.patch<ApiResponse<{ notification: INotification }>>(
      `/notifications/${id}/read`
    );
    return res.data.data?.notification;
  },

  async markAllRead() {
    const res = await apiClient.patch<ApiResponse>('/notifications/read-all');
    return res.data;
  },

  async deleteNotification(id: string) {
    const res = await apiClient.delete<ApiResponse>(`/notifications/${id}`);
    return res.data;
  },
};

export default notificationService;
