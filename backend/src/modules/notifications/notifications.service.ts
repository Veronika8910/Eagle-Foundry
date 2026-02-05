import * as notificationsRepo from './notifications.repo.js';
import { ListNotificationsQuery } from './notifications.validators.js';

/**
 * Get user's notifications
 */
export async function getNotifications(userId: string, query: ListNotificationsQuery) {
    return notificationsRepo.getNotifications(
        userId,
        query.cursor,
        query.limit,
        query.unreadOnly || false
    );
}

/**
 * Mark notification as read
 */
export async function markAsRead(userId: string, notificationId: string) {
    await notificationsRepo.markAsRead(notificationId, userId);
    return { success: true };
}

/**
 * Mark all as read
 */
export async function markAllAsRead(userId: string) {
    await notificationsRepo.markAllAsRead(userId);
    return { success: true };
}

/**
 * Get unread count
 */
export async function getUnreadCount(userId: string) {
    const count = await notificationsRepo.getUnreadCount(userId);
    return { count };
}

/**
 * Delete notification
 */
export async function deleteNotification(userId: string, notificationId: string) {
    await notificationsRepo.deleteNotification(notificationId, userId);
    return { success: true };
}

/**
 * Create notification (for internal use/webhooks)
 */
export async function createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: Record<string, unknown>
) {
    return notificationsRepo.createNotification({
        userId,
        type,
        title,
        message,
        data,
    });
}
