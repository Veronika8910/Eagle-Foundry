import { Router } from 'express';
import * as startupsController from './startups.controller.js';
import { validateBody, validateParams, uuidParamSchema } from '../../middlewares/validate.js';
import { authMiddleware, requireActiveUser } from '../../middlewares/auth.js';
import { requireStudent } from '../../middlewares/rbac.js';
import {
    createStartupSchema,
    updateStartupSchema,
} from './startups.validators.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);
router.use(requireActiveUser);

// Student routes
router.post(
    '/',
    requireStudent,
    validateBody(createStartupSchema),
    startupsController.createStartup
);

router.get('/', requireStudent, startupsController.listStartups);

router.get(
    '/:id',
    validateParams(uuidParamSchema),
    startupsController.getStartup
);

router.put(
    '/:id',
    requireStudent,
    validateParams(uuidParamSchema),
    validateBody(updateStartupSchema),
    startupsController.updateStartup
);

router.post(
    '/:id/submit',
    requireStudent,
    validateParams(uuidParamSchema),
    startupsController.submitStartup
);

router.post(
    '/:id/archive',
    requireStudent,
    validateParams(uuidParamSchema),
    startupsController.archiveStartup
);

router.get(
    '/:id/team',
    validateParams(uuidParamSchema),
    startupsController.getTeam
);

export default router;
