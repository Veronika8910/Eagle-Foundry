import { Router } from 'express';
import * as applicationsController from './applications.controller.js';
import { validateBody, validateParams, uuidParamSchema } from '../../middlewares/validate.js';
import { authMiddleware, requireActiveUser } from '../../middlewares/auth.js';
import { requireStudent, requireCompanyMember, requireCompanyAdmin } from '../../middlewares/rbac.js';
import { updateApplicationStatusSchema } from './applications.validators.js';

const router = Router();

router.use(authMiddleware);
router.use(requireActiveUser);

// Student routes
router.get('/me', requireStudent, applicationsController.getMyApplications);

router.post(
    '/:id/withdraw',
    requireStudent,
    validateParams(uuidParamSchema),
    applicationsController.withdrawApplication
);

// Company routes
router.get(
    '/:id',
    requireCompanyMember,
    validateParams(uuidParamSchema),
    applicationsController.getApplication
);

router.patch(
    '/:id/status',
    requireCompanyAdmin,
    validateParams(uuidParamSchema),
    validateBody(updateApplicationStatusSchema),
    applicationsController.updateApplicationStatus
);

export default router;
