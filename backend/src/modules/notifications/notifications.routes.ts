import { Router } from 'express';
import * as notificationsController from './notifications.controller.js';
import { validateParams, uuidParamSchema } from '../../middlewares/validate.js';
import { authMiddleware, requireActiveUser } from '../../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);
router.use(requireActiveUser);

// Get notifications
router.get('/', notificationsController.getNotifications);

// Get unread count
router.get('/unread-count', notificationsController.getUnreadCount);

// Mark all as read
router.post('/read-all', notificationsController.markAllAsRead);

// Mark as read
router.post(
    '/:id/read',
    validateParams(uuidParamSchema),
    notificationsController.markAsRead
);

// Delete notification
router.delete(
    '/:id',
    validateParams(uuidParamSchema),
    notificationsController.deleteNotification
);

export default router;
