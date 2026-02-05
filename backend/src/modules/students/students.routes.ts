import { Router } from 'express';
import * as studentsController from './students.controller.js';
import { validateBody, validateParams, uuidParamSchema } from '../../middlewares/validate.js';
import { authMiddleware, requireActiveUser } from '../../middlewares/auth.js';
import { requireStudent } from '../../middlewares/rbac.js';
import {
    updateProfileSchema,
    createPortfolioItemSchema,
    updatePortfolioItemSchema,
    presignResumeSchema,
} from './students.validators.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);
router.use(requireActiveUser);

// Student-only routes
router.get('/me', requireStudent, studentsController.getMyProfile);

router.put(
    '/me',
    requireStudent,
    validateBody(updateProfileSchema),
    studentsController.updateMyProfile
);

router.get('/me/portfolio', requireStudent, studentsController.getMyPortfolio);

router.post(
    '/me/portfolio',
    requireStudent,
    validateBody(createPortfolioItemSchema),
    studentsController.createPortfolioItem
);

router.put(
    '/me/portfolio/:id',
    requireStudent,
    validateParams(uuidParamSchema),
    validateBody(updatePortfolioItemSchema),
    studentsController.updatePortfolioItem
);

router.delete(
    '/me/portfolio/:id',
    requireStudent,
    validateParams(uuidParamSchema),
    studentsController.deletePortfolioItem
);

router.post(
    '/me/resume/presign',
    requireStudent,
    validateBody(presignResumeSchema),
    studentsController.presignResumeUpload
);

// Public profile (for companies and admins)
router.get(
    '/:id/public',
    validateParams(uuidParamSchema),
    // Allow company members and university admins
    (req, res, next) => {
        const role = req.user?.role;
        if (role === 'COMPANY_ADMIN' || role === 'COMPANY_MEMBER' || role === 'UNIVERSITY_ADMIN') {
            next();
        } else {
            res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Access denied' },
            });
        }
    },
    studentsController.getPublicProfile
);

export default router;
