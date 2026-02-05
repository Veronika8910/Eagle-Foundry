import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { validateBody, validateParams, uuidParamSchema } from '../../middlewares/validate.js';
import { authMiddleware, requireActiveUser } from '../../middlewares/auth.js';
import { requireUniversityAdmin } from '../../middlewares/rbac.js';
import {
    reviewStartupSchema,
    updateUserStatusSchema,
    updateOrgStatusSchema,
} from './admin.validators.js';

const router = Router();

// All admin routes require authentication and university admin role
router.use(authMiddleware);
router.use(requireActiveUser);
router.use(requireUniversityAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Startup review
router.get('/startups/pending', adminController.getPendingStartups);

router.post(
    '/startups/:id/review',
    validateParams(uuidParamSchema),
    validateBody(reviewStartupSchema),
    adminController.reviewStartup
);

// User management
router.get('/users', adminController.listUsers);

router.patch(
    '/users/:id/status',
    validateParams(uuidParamSchema),
    validateBody(updateUserStatusSchema),
    adminController.updateUserStatus
);

// Org management
router.get('/orgs', adminController.listOrgs);

router.patch(
    '/orgs/:id/status',
    validateParams(uuidParamSchema),
    validateBody(updateOrgStatusSchema),
    adminController.updateOrgStatus
);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
