import { z } from 'zod';
import { emailSchema, passwordSchema, otpSchema } from '../../middlewares/validate.js';

export const studentSignupSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
});

export const companySignupSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    companyName: z.string().min(1, 'Company name is required').max(200),
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

export const verifyOtpSchema = z.object({
    email: emailSchema,
    code: otpSchema,
});

export const resendOtpSchema = z.object({
    email: emailSchema,
});

export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export const resetPasswordSchema = z.object({
    email: emailSchema,
    code: otpSchema,
    newPassword: passwordSchema,
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type StudentSignupInput = z.infer<typeof studentSignupSchema>;
export type CompanySignupInput = z.infer<typeof companySignupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
