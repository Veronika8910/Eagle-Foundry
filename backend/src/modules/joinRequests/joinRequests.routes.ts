import { Router } from 'express';
import * as joinRequestsController from './joinRequests.controller.js';
import { validateBody, validateParams, uuidParamSchema } from '../../middlewares/validate.js';
import { authMiddleware, requireActiveUser } from '../../middlewares/auth.js';
import { requireStudent } from '../../middlewares/rbac.js';
import {
    updateJoinRequestSchema,
} from './joinRequests.validators.js';

const router = Router();

router.use(authMiddleware);
router.use(requireActiveUser);

// Student routes
router.get('/me', requireStudent, joinRequestsController.getMyJoinRequests);

router.post(
    '/:id/cancel',
    requireStudent,
    validateParams(uuidParamSchema),
    joinRequestsController.cancelJoinRequest
);

// Startup founder routes
router.patch(
    '/:id',
    validateParams(uuidParamSchema),
    validateBody(updateJoinRequestSchema),
    joinRequestsController.updateJoinRequest
);

export default router;
