import { OtpPurpose } from '@prisma/client';
import { env } from '../../config/env.js';
import { generateOtp, hashOtp, verifyOtp as verifyOtpHash } from '../../utils/security.js';
import {
    getOtpExpiryTime,
    isExpired,
    canResendOtp,
    getResendCooldownRemaining,
    isWithinRateLimitWindow,
    isOtpSendLimitExceeded,
} from '../../utils/time.js';
import * as otpRepo from './otp.repo.js';
import { OtpValidationResult, OtpResendResult } from './otp.types.js';
import { publish } from '../../events/publish.js';
import { buildOtpRequestedEvent } from '../../events/builders.js';
import { logger } from '../../connectors/logger.js';

/**
 * Create and send a new OTP
 */
export async function createAndSendOtp(
    email: string,
    purpose: OtpPurpose
): Promise<{ success: boolean; expiresAt: Date }> {
    const otp = generateOtp();
    const codeHash = hashOtp(otp);
    const expiresAt = getOtpExpiryTime();

    // Create OTP record (this also deletes any existing OTP)
    await otpRepo.createOtp({
        email,
        purpose,
        codeHash,
        expiresAt,
    });

    // Publish event to send email via SQS -> Lambda
    const eventPurpose = purpose === OtpPurpose.SIGNUP_VERIFY ? 'signup' : 'password_reset';
    const event = buildOtpRequestedEvent(email, otp, eventPurpose, expiresAt);
    await publish(event.type, event.payload);

    logger.info({ email, purpose }, 'OTP created and event published');

    return { success: true, expiresAt };
}

/**
 * Resend OTP with rate limiting
 */
export async function resendOtp(
    email: string,
    purpose: OtpPurpose
): Promise<OtpResendResult> {
    const existingOtp = await otpRepo.findOtp(email, purpose);

    if (!existingOtp) {
        // No existing OTP, create a new one
        await createAndSendOtp(email, purpose);
        return { success: true };
    }

    // Check cooldown
    if (!canResendOtp(existingOtp.lastSentAt)) {
        const cooldownRemaining = getResendCooldownRemaining(existingOtp.lastSentAt);
        return {
            success: false,
            error: 'cooldown',
            cooldownRemaining,
        };
    }

    // Check rate limit
    let sendCountInWindow = existingOtp.sendCountInWindow;
    let sendCountWindowStart = existingOtp.sendCountWindowStart;

    if (isWithinRateLimitWindow(sendCountWindowStart)) {
        if (isOtpSendLimitExceeded(sendCountInWindow, sendCountWindowStart)) {
            return {
                success: false,
                error: 'rate_limit',
            };
        }
        sendCountInWindow += 1;
    } else {
        // Reset window
        sendCountInWindow = 1;
        sendCountWindowStart = new Date();
    }

    // Generate new OTP
    const otp = generateOtp();
    const codeHash = hashOtp(otp);
    const expiresAt = getOtpExpiryTime();

    // Update OTP record
    await otpRepo.updateOtpForResend(existingOtp.id, {
        codeHash,
        expiresAt,
        sendCountInWindow,
        sendCountWindowStart: sendCountInWindow === 1 ? sendCountWindowStart : undefined,
    });

    // Publish event to send email
    const eventPurpose = purpose === OtpPurpose.SIGNUP_VERIFY ? 'signup' : 'password_reset';
    const event = buildOtpRequestedEvent(email, otp, eventPurpose, expiresAt);
    await publish(event.type, event.payload);

    logger.info({ email, purpose }, 'OTP resent');

    return { success: true };
}

/**
 * Verify OTP code
 */
export async function verifyOtp(
    email: string,
    purpose: OtpPurpose,
    code: string
): Promise<OtpValidationResult> {
    const otpRecord = await otpRepo.findOtp(email, purpose);

    if (!otpRecord) {
        return { valid: false, error: 'not_found' };
    }

    // Check if expired
    if (isExpired(otpRecord.expiresAt)) {
        await otpRepo.deleteOtp(otpRecord.id);
        return { valid: false, error: 'expired' };
    }

    // Check max attempts
    if (otpRecord.attempts >= env.OTP_MAX_ATTEMPTS) {
        await otpRepo.deleteOtp(otpRecord.id);
        return { valid: false, error: 'max_attempts' };
    }

    // Verify the code
    const isValid = verifyOtpHash(code, otpRecord.codeHash);

    if (!isValid) {
        await otpRepo.incrementOtpAttempts(otpRecord.id);
        return { valid: false, error: 'invalid' };
    }

    // Valid - delete the OTP record
    await otpRepo.deleteOtp(otpRecord.id);

    logger.info({ email, purpose }, 'OTP verified successfully');

    return { valid: true };
}

/**
 * Check if an OTP exists for email/purpose without verifying
 */
export async function hasActiveOtp(
    email: string,
    purpose: OtpPurpose
): Promise<boolean> {
    const otpRecord = await otpRepo.findOtp(email, purpose);

    if (!otpRecord) {
        return false;
    }

    if (isExpired(otpRecord.expiresAt)) {
        await otpRepo.deleteOtp(otpRecord.id);
        return false;
    }

    return true;
}

/**
 * Delete all OTPs for an email (used after successful verification)
 */
export async function clearOtpsForEmail(email: string): Promise<void> {
    await otpRepo.deleteOtpsByEmail(email);
}
