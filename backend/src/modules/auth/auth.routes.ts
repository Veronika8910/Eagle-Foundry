import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validateBody } from '../../middlewares/validate.js';
import { authMiddleware, requireActiveUser } from '../../middlewares/auth.js';
import {
    authRateLimiter,
    otpRateLimiter,
    loginRateLimiter,
    passwordResetRateLimiter,
} from '../../middlewares/rateLimit.js';
import {
    studentSignupSchema,
    companySignupSchema,
    loginSchema,
    verifyOtpSchema,
    resendOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    refreshTokenSchema,
} from './auth.validators.js';

const router = Router();

// Public endpoints with rate limiting
router.post(
    '/student/signup',
    authRateLimiter,
    validateBody(studentSignupSchema),
    authController.studentSignup
);

router.post(
    '/company/signup',
    authRateLimiter,
    validateBody(companySignupSchema),
    authController.companySignup
);

router.post(
    '/verify-otp',
    otpRateLimiter,
    validateBody(verifyOtpSchema),
    authController.verifyOtp
);

router.post(
    '/resend-otp',
    otpRateLimiter,
    validateBody(resendOtpSchema),
    authController.resendOtp
);

router.post(
    '/login',
    loginRateLimiter,
    validateBody(loginSchema),
    authController.login
);

router.post(
    '/refresh',
    authRateLimiter,
    validateBody(refreshTokenSchema),
    authController.refreshToken
);

router.post(
    '/logout',
    validateBody(refreshTokenSchema),
    authController.logout
);

router.post(
    '/forgot-password',
    passwordResetRateLimiter,
    validateBody(forgotPasswordSchema),
    authController.forgotPassword
);

router.post(
    '/reset-password',
    passwordResetRateLimiter,
    validateBody(resetPasswordSchema),
    authController.resetPassword
);

// Protected endpoints
router.get(
    '/me',
    authMiddleware,
    requireActiveUser,
    authController.getMe
);

export default router;
