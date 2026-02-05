import { OtpPurpose } from '@prisma/client';

export interface CreateOtpInput {
    email: string;
    purpose: OtpPurpose;
}

export interface VerifyOtpInput {
    email: string;
    purpose: OtpPurpose;
    code: string;
}

export interface OtpRecord {
    id: string;
    email: string;
    purpose: OtpPurpose;
    codeHash: string;
    expiresAt: Date;
    attempts: number;
    lastSentAt: Date;
    sendCountWindowStart: Date;
    sendCountInWindow: number;
    createdAt: Date;
}

export interface OtpValidationResult {
    valid: boolean;
    error?: 'expired' | 'invalid' | 'max_attempts' | 'not_found';
}

export interface OtpResendResult {
    success: boolean;
    error?: 'cooldown' | 'rate_limit';
    cooldownRemaining?: number;
}
