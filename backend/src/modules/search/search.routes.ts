import { Router } from 'express';
import * as searchController from './search.controller.js';
import { authMiddleware, requireActiveUser } from '../../middlewares/auth.js';
import { validateQuery } from '../../middlewares/validate.js';
import { searchQuerySchema } from './search.validators.js';

const router = Router();

router.use(authMiddleware);
router.use(requireActiveUser);

router.get(
    '/',
    validateQuery(searchQuerySchema),
    searchController.search
);

export default router;
