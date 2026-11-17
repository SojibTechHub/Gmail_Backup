import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares';
import { formatResponse } from '../utils';
import * as notificationService from '../services/notification.service';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query;

  const result = await notificationService.getUserNotifications(
    req.user!._id.toString(),
    page ? parseInt(page as string, 10) : 1,
    limit ? parseInt(limit as string, 10) : 20
  );

  res.status(200).json(
    formatResponse(true, 'Notifications retrieved', result.notifications, {
      ...result.pagination,
      total: result.unreadCount, // unread count attached in meta or response
    })
  );
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await notificationService.markNotificationRead(
    req.user!._id.toString(),
    req.params.id as string
  );
  res.status(200).json(formatResponse(true, 'Notification marked as read', { notification }));
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllNotificationsRead(req.user!._id.toString());
  res.status(200).json(formatResponse(true, 'All notifications marked as read'));
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.deleteNotification(req.user!._id.toString(), req.params.id as string);
  res.status(200).json(formatResponse(true, 'Notification deleted'));
});
