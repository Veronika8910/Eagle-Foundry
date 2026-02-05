import { Router } from 'express';
import * as moderationController from './moderation.controller.js';
import { validateBody, validateParams, uuidParamSchema } from '../../middlewares/validate.js';
import { authMiddleware, requireActiveUser } from '../../middlewares/auth.js';
import { requireUniversityAdmin } from '../../middlewares/rbac.js';
import { createReportSchema, resolveReportSchema } from '../admin/admin.validators.js';

const router = Router();

router.use(authMiddleware);
router.use(requireActiveUser);

// Any user can create reports
router.post(
    '/',
    validateBody(createReportSchema),
    moderationController.createReport
);

// Any user can see their own reports
router.get('/me', moderationController.getMyReports);

// Admin only routes
router.get(
    '/pending',
    requireUniversityAdmin,
    moderationController.getPendingReports
);

router.post(
    '/:id/resolve',
    requireUniversityAdmin,
    validateParams(uuidParamSchema),
    validateBody(resolveReportSchema),
    moderationController.resolveReport
);

export default router;
