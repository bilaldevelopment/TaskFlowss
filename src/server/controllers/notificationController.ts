import { Response } from 'express';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export function getNotifications(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  const notifications = dbStore.getNotificationsByUser(user._id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  res.status(200).json({
    notifications,
    unreadCount,
  });
}

export function markAsRead(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const user = req.user!;

  const success = dbStore.markNotificationAsRead(id, user._id);
  if (!success) {
    res.status(404).json({ error: 'Notification not found' });
    return;
  }

  res.status(200).json({ success: true, message: 'Notification marked as read' });
}

export function markAllAsRead(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  dbStore.markAllNotificationsAsRead(user._id);

  res.status(200).json({ success: true, message: 'All notifications marked as read' });
}
