import { Router } from 'express';
import * as opportunitiesController from './opportunities.controller.js';
import { validateBody, validateParams, uuidParamSchema } from '../../middlewares/validate.js';
import { authMiddleware, requireActiveUser } from '../../middlewares/auth.js';
import { requireCompanyAdmin } from '../../middlewares/rbac.js';
import { createOpportunitySchema, updateOpportunitySchema } from './opportunities.validators.js';

const router = Router();

// Public routes (listing)
router.get('/', opportunitiesController.listOpportunities);

router.get(
    '/:id',
    validateParams(uuidParamSchema),
    opportunitiesController.getOpportunity
);

// Protected routes
router.use(authMiddleware);
router.use(requireActiveUser);

// Company admin routes
router.post(
    '/',
    requireCompanyAdmin,
    validateBody(createOpportunitySchema),
    opportunitiesController.createOpportunity
);

router.patch(
    '/:id',
    requireCompanyAdmin,
    validateParams(uuidParamSchema),
    validateBody(updateOpportunitySchema),
    opportunitiesController.updateOpportunity
);

router.post(
    '/:id/publish',
    requireCompanyAdmin,
    validateParams(uuidParamSchema),
    opportunitiesController.publishOpportunity
);

router.post(
    '/:id/close',
    requireCompanyAdmin,
    validateParams(uuidParamSchema),
    opportunitiesController.closeOpportunity
);

// Get org's opportunities
router.get('/org/me', requireCompanyAdmin, opportunitiesController.listOrgOpportunities);

export default router;
