import { Router } from 'express';
import * as searchController from './search.controller.js';
import { authMiddleware, requireActiveUser } from '../../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);
router.use(requireActiveUser);

router.get('/', searchController.search);

export default router;
