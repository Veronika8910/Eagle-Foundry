import { Request, Response, NextFunction } from 'express';
import * as notificationsService from './notifications.service.js';
import { success, paginated } from '../../utils/response.js';
import { parseLimit } from '../../utils/pagination.js';

/**
 * GET /notifications
 */
export async function getNotifications(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const query = {
            cursor: req.query.cursor as string | undefined,
            limit: parseLimit(req.query.limit),
            unreadOnly: req.query.unreadOnly === 'true',
        };
        const result = await notificationsService.getNotifications(req.user!.userId, query);
        paginated(res, result.items, {
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /notifications/:id/read
 */
export async function markAsRead(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await notificationsService.markAsRead(req.user!.userId, req.params.id);
        success(res, { message: 'Notification marked as read' });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /notifications/read-all
 */
export async function markAllAsRead(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await notificationsService.markAllAsRead(req.user!.userId);
        success(res, { message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /notifications/unread-count
 */
export async function getUnreadCount(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const result = await notificationsService.getUnreadCount(req.user!.userId);
        success(res, result);
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /notifications/:id
 */
export async function deleteNotification(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await notificationsService.deleteNotification(req.user!.userId, req.params.id);
        success(res, { message: 'Notification deleted' });
    } catch (error) {
        next(error);
    }
}
