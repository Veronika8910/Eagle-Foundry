import { Prisma } from '@prisma/client';
import { db } from '../../connectors/db.js';

/**
 * Create notification
 */
export async function createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
}) {
    return db.notification.create({
        data: {
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            data: (data.data || {}) as Prisma.InputJsonValue,
        },
    });
}

/**
 * Get notifications for user
 */
export async function getNotifications(
    userId: string,
    cursor: string | undefined,
    limit: number,
    unreadOnly: boolean
) {
    const take = limit + 1;

    const notifications = await db.notification.findMany({
        where: {
            userId,
            ...(unreadOnly && { readAt: null }),
        },
        orderBy: { createdAt: 'desc' },
        take,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
    });

    const hasMore = notifications.length > limit;
    const items = hasMore ? notifications.slice(0, limit) : notifications;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
}

/**
 * Mark notification as read
 */
export async function markAsRead(id: string, userId: string) {
    return db.notification.updateMany({
        where: { id, userId },
        data: { readAt: new Date() },
    });
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string) {
    return db.notification.updateMany({
        where: { userId, readAt: null },
        data: { readAt: new Date() },
    });
}

/**
 * Get unread count
 */
export async function getUnreadCount(userId: string) {
    return db.notification.count({
        where: { userId, readAt: null },
    });
}

/**
 * Delete notification
 */
export async function deleteNotification(id: string, userId: string) {
    return db.notification.deleteMany({
        where: { id, userId },
    });
}
