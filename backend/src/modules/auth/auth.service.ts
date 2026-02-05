import { UserRole, UserStatus, OrgStatus, OtpPurpose } from '@prisma/client';
import { db } from '../../connectors/db.js';
import { env } from '../../config/env.js';
import {
    hashPassword,
    verifyPassword,
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    hashToken,
    getTokenExpiry,
} from '../../utils/security.js';
import { isStudentEmail, isValidCompanyEmail, normalizeEmail } from '../../utils/emailRules.js';
import * as otpService from '../otp/otp.service.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { ErrorCode } from '../../utils/response.js';
import { logger } from '../../connectors/logger.js';
import {
    StudentSignupInput,
    CompanySignupInput,
    LoginInput,
    ResetPasswordInput,
} from './auth.validators.js';

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
}

export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    orgId: string | null;
    studentProfile?: {
        id: string;
        firstName: string;
        lastName: string;
    } | null;
    org?: {
        id: string;
        name: string;
        status: OrgStatus;
    } | null;
}

/**
 * Register a new student
 */
export async function registerStudent(input: StudentSignupInput): Promise<{ userId: string }> {
    const email = normalizeEmail(input.email);

    // Validate student email domain
    if (!isStudentEmail(email)) {
        throw new AppError(
            ErrorCode.INVALID_EMAIL_DOMAIN,
            `Email must end with @${env.STUDENT_EMAIL_DOMAIN}`,
            400
        );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new AppError(ErrorCode.ALREADY_EXISTS, 'Email already registered', 409);
    }

    // Create user with PENDING_OTP status
    const passwordHash = await hashPassword(input.password);

    const user = await db.user.create({
        data: {
            email,
            passwordHash,
            role: UserRole.STUDENT,
            status: UserStatus.PENDING_OTP,
            studentProfile: {
                create: {
                    firstName: input.firstName,
                    lastName: input.lastName,
                },
            },
        },
    });

    // Create and send OTP
    await otpService.createAndSendOtp(email, OtpPurpose.SIGNUP_VERIFY);

    logger.info({ userId: user.id, email }, 'Student registered');

    return { userId: user.id };
}

/**
 * Register a new company
 */
export async function registerCompany(input: CompanySignupInput): Promise<{ userId: string; orgId: string }> {
    const email = normalizeEmail(input.email);

    // Validate company email domain
    if (!isValidCompanyEmail(email)) {
        throw new AppError(
            ErrorCode.BLOCKED_EMAIL_DOMAIN,
            'Please use a company email address. Public email providers are not allowed.',
            400
        );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new AppError(ErrorCode.ALREADY_EXISTS, 'Email already registered', 409);
    }

    // Create org and user in a transaction
    const passwordHash = await hashPassword(input.password);

    const result = await db.$transaction(async (tx) => {
        // Create org
        const org = await tx.org.create({
            data: {
                name: input.companyName,
                status: OrgStatus.PENDING_OTP,
            },
        });

        // Create user as company admin
        const user = await tx.user.create({
            data: {
                email,
                passwordHash,
                role: UserRole.COMPANY_ADMIN,
                status: UserStatus.PENDING_OTP,
                orgId: org.id,
            },
        });

        return { userId: user.id, orgId: org.id };
    });

    // Create and send OTP
    await otpService.createAndSendOtp(email, OtpPurpose.SIGNUP_VERIFY);

    logger.info({ userId: result.userId, orgId: result.orgId, email }, 'Company registered');

    return result;
}

/**
 * Verify OTP and activate user
 */
export async function verifySignupOtp(email: string, code: string): Promise<{ success: boolean }> {
    const normalizedEmail = normalizeEmail(email);

    // Verify OTP
    const result = await otpService.verifyOtp(normalizedEmail, OtpPurpose.SIGNUP_VERIFY, code);

    if (!result.valid) {
        const messages: Record<string, string> = {
            expired: 'OTP has expired. Please request a new one.',
            invalid: 'Invalid OTP code.',
            max_attempts: 'Maximum attempts exceeded. Please request a new OTP.',
            not_found: 'No OTP found for this email.',
        };
        throw new AppError(
            `OTP_${result.error?.toUpperCase() || 'ERROR'}`,
            messages[result.error || 'invalid'],
            400
        );
    }

    // Find user
    const user = await db.user.findUnique({
        where: { email: normalizedEmail },
        include: { org: true },
    });

    if (!user) {
        throw new AppError(ErrorCode.NOT_FOUND, 'User not found', 404);
    }

    // Activate user (and org if company)
    await db.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: user.id },
            data: {
                status: UserStatus.ACTIVE,
                emailVerifiedAt: new Date(),
            },
        });

        if (user.org) {
            await tx.org.update({
                where: { id: user.org.id },
                data: { status: OrgStatus.ACTIVE },
            });
        }
    });

    logger.info({ userId: user.id, email: normalizedEmail }, 'User verified and activated');

    return { success: true };
}

/**
 * Login user
 */
export async function login(input: LoginInput): Promise<AuthTokens> {
    const email = normalizeEmail(input.email);

    // Find user
    const user = await db.user.findUnique({
        where: { email },
        include: {
            org: true,
            studentProfile: true,
        },
    });

    if (!user) {
        throw new AppError(ErrorCode.INVALID_CREDENTIALS, 'Invalid email or password', 401);
    }

    // Verify password
    const passwordValid = await verifyPassword(input.password, user.passwordHash);
    if (!passwordValid) {
        throw new AppError(ErrorCode.INVALID_CREDENTIALS, 'Invalid email or password', 401);
    }

    // Check status
    if (user.status === UserStatus.PENDING_OTP) {
        throw new AppError(
            ErrorCode.ACCOUNT_PENDING,
            'Please verify your email before logging in',
            403
        );
    }

    if (user.status === UserStatus.SUSPENDED) {
        throw new AppError(ErrorCode.ACCOUNT_SUSPENDED, 'Your account has been suspended', 403);
    }

    // Check org status for company users
    if (user.org && user.org.status === OrgStatus.SUSPENDED) {
        throw new AppError(ErrorCode.ORG_SUSPENDED, 'Your organization has been suspended', 403);
    }

    // Generate tokens
    const tokens = await generateTokens(user);

    logger.info({ userId: user.id, email }, 'User logged in');

    return tokens;
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    // Verify refresh token - will throw if invalid  
    try {
        verifyRefreshToken(refreshToken);
    } catch {
        throw new AppError(ErrorCode.TOKEN_INVALID, 'Invalid refresh token', 401);
    }

    // Find the refresh token in DB
    const tokenHash = hashToken(refreshToken);
    const storedToken = await db.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: { include: { org: true, studentProfile: true } } },
    });

    if (!storedToken) {
        throw new AppError(ErrorCode.TOKEN_INVALID, 'Refresh token not found', 401);
    }

    if (storedToken.expiresAt < new Date()) {
        await db.refreshToken.delete({ where: { id: storedToken.id } });
        throw new AppError(ErrorCode.TOKEN_EXPIRED, 'Refresh token has expired', 401);
    }

    // Check user status
    const user = storedToken.user;
    if (user.status !== UserStatus.ACTIVE) {
        throw new AppError(ErrorCode.ACCOUNT_SUSPENDED, 'Account is not active', 403);
    }

    // Delete old token and generate new ones (rotation)
    await db.refreshToken.delete({ where: { id: storedToken.id } });

    const tokens = await generateTokens(user);

    logger.info({ userId: user.id }, 'Token refreshed');

    return tokens;
}

/**
 * Logout - revoke refresh token
 */
export async function logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);

    try {
        await db.refreshToken.delete({ where: { tokenHash } });
    } catch {
        // Token may already be deleted, ignore
    }
}

/**
 * Request password reset OTP
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean }> {
    const normalizedEmail = normalizeEmail(email);

    // Find user
    const user = await db.user.findUnique({ where: { email: normalizedEmail } });

    // Always return success to prevent email enumeration
    if (!user) {
        logger.info({ email: normalizedEmail }, 'Password reset requested for non-existent email');
        return { success: true };
    }

    if (user.status === UserStatus.SUSPENDED) {
        logger.info({ email: normalizedEmail }, 'Password reset requested for suspended user');
        return { success: true };
    }

    // Create and send OTP
    await otpService.createAndSendOtp(normalizedEmail, OtpPurpose.PASSWORD_RESET);

    logger.info({ userId: user.id, email: normalizedEmail }, 'Password reset OTP sent');

    return { success: true };
}

/**
 * Reset password with OTP
 */
export async function resetPassword(input: ResetPasswordInput): Promise<{ success: boolean }> {
    const email = normalizeEmail(input.email);

    // Verify OTP
    const result = await otpService.verifyOtp(email, OtpPurpose.PASSWORD_RESET, input.code);

    if (!result.valid) {
        const messages: Record<string, string> = {
            expired: 'OTP has expired. Please request a new one.',
            invalid: 'Invalid OTP code.',
            max_attempts: 'Maximum attempts exceeded. Please request a new OTP.',
            not_found: 'No password reset request found.',
        };
        throw new AppError(
            `OTP_${result.error?.toUpperCase() || 'ERROR'}`,
            messages[result.error || 'invalid'],
            400
        );
    }

    // Find user
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
        throw new AppError(ErrorCode.NOT_FOUND, 'User not found', 404);
    }

    // Update password
    const passwordHash = await hashPassword(input.newPassword);
    await db.user.update({
        where: { id: user.id },
        data: { passwordHash },
    });

    // Revoke all refresh tokens
    await db.refreshToken.deleteMany({ where: { userId: user.id } });

    logger.info({ userId: user.id, email }, 'Password reset successfully');

    return { success: true };
}

/**
 * Get current user info
 */
export async function getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await db.user.findUnique({
        where: { id: userId },
        include: {
            studentProfile: {
                select: { id: true, firstName: true, lastName: true },
            },
            org: {
                select: { id: true, name: true, status: true },
            },
        },
    });

    if (!user) {
        throw new AppError(ErrorCode.NOT_FOUND, 'User not found', 404);
    }

    return {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        orgId: user.orgId,
        studentProfile: user.studentProfile,
        org: user.org,
    };
}

/**
 * Resend OTP for signup verification
 */
export async function resendSignupOtp(email: string): Promise<{ success: boolean; cooldownRemaining?: number }> {
    const normalizedEmail = normalizeEmail(email);

    // Find user
    const user = await db.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
        throw new AppError(ErrorCode.NOT_FOUND, 'No pending verification found for this email', 404);
    }

    if (user.status !== UserStatus.PENDING_OTP) {
        throw new AppError(ErrorCode.CONFLICT, 'Account is already verified', 409);
    }

    // Resend OTP
    const result = await otpService.resendOtp(normalizedEmail, OtpPurpose.SIGNUP_VERIFY);

    if (!result.success) {
        if (result.error === 'cooldown') {
            throw new AppError(
                ErrorCode.OTP_COOLDOWN,
                `Please wait ${result.cooldownRemaining} seconds before requesting another OTP`,
                429
            );
        }
        if (result.error === 'rate_limit') {
            throw new AppError(
                ErrorCode.OTP_RATE_LIMIT,
                'Too many OTP requests. Please try again later.',
                429
            );
        }
    }

    return { success: true };
}

// Helper function to generate tokens
async function generateTokens(user: {
    id: string;
    email: string;
    role: UserRole;
    orgId: string | null;
}): Promise<AuthTokens> {
    const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        orgId: user.orgId || undefined,
    });

    const tokenId = crypto.randomUUID();
    const refreshToken = generateRefreshToken({
        userId: user.id,
        tokenId,
    });

    // Store refresh token hash
    const tokenHash = hashToken(refreshToken);
    const expiresAt = getTokenExpiry(env.JWT_REFRESH_EXPIRES_IN);

    await db.refreshToken.create({
        data: {
            tokenHash,
            userId: user.id,
            expiresAt,
        },
    });

    return {
        accessToken,
        refreshToken,
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    };
}
