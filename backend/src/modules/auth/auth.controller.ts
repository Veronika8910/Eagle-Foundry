import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service.js';
import { success, created } from '../../utils/response.js';
import {
    StudentSignupInput,
    CompanySignupInput,
    LoginInput,
    VerifyOtpInput,
    ResendOtpInput,
    ForgotPasswordInput,
    ResetPasswordInput,
    RefreshTokenInput,
} from './auth.validators.js';

/**
 * POST /auth/student/signup
 */
export async function studentSignup(
    req: Request<unknown, unknown, StudentSignupInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const result = await authService.registerStudent(req.body);
        created(res, {
            message: 'Account created. Please check your email for verification code.',
            userId: result.userId,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /auth/company/signup
 */
export async function companySignup(
    req: Request<unknown, unknown, CompanySignupInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const result = await authService.registerCompany(req.body);
        created(res, {
            message: 'Account created. Please check your email for verification code.',
            userId: result.userId,
            orgId: result.orgId,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /auth/verify-otp
 */
export async function verifyOtp(
    req: Request<unknown, unknown, VerifyOtpInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const result = await authService.verifySignupOtp(req.body.email, req.body.code);
        success(res, {
            message: 'Email verified successfully. You can now log in.',
            ...result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /auth/resend-otp
 */
export async function resendOtp(
    req: Request<unknown, unknown, ResendOtpInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const result = await authService.resendSignupOtp(req.body.email);
        success(res, {
            message: 'Verification code sent to your email.',
            ...result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /auth/login
 */
export async function login(
    req: Request<unknown, unknown, LoginInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const tokens = await authService.login(req.body);
        success(res, tokens);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /auth/refresh
 */
export async function refreshToken(
    req: Request<unknown, unknown, RefreshTokenInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const tokens = await authService.refreshAccessToken(req.body.refreshToken);
        success(res, tokens);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /auth/logout
 */
export async function logout(
    req: Request<unknown, unknown, RefreshTokenInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await authService.logout(req.body.refreshToken);
        success(res, { message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /auth/forgot-password
 */
export async function forgotPassword(
    req: Request<unknown, unknown, ForgotPasswordInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await authService.requestPasswordReset(req.body.email);
        // Always return success to prevent email enumeration
        success(res, {
            message: 'If an account exists with this email, you will receive a password reset code.',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /auth/reset-password
 */
export async function resetPassword(
    req: Request<unknown, unknown, ResetPasswordInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await authService.resetPassword(req.body);
        success(res, { message: 'Password reset successfully. You can now log in with your new password.' });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /auth/me
 */
export async function getMe(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user) {
            throw new Error('User not authenticated');
        }
        const user = await authService.getCurrentUser(req.user.userId);
        success(res, user);
    } catch (error) {
        next(error);
    }
}
