import { Notification } from '../models';
import { NotificationType } from '../types';
import { AppError } from '../middlewares';

export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string
) => {
  return Notification.create({
    userId,
    type,
    title,
    message,
  });
};

export const getUserNotifications = async (userId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ userId }),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const markNotificationRead = async (userId: string, notificationId: string) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  return notification;
};

export const markAllNotificationsRead = async (userId: string) => {
  await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  return { success: true };
};

export const deleteNotification = async (userId: string, notificationId: string) => {
  const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  return { success: true };
};
