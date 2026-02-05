import { OtpPurpose } from '@prisma/client';
import { db } from '../../connectors/db.js';
import { OtpRecord } from './otp.types.js';

/**
 * Find OTP record by email and purpose
 */
export async function findOtp(
    email: string,
    purpose: OtpPurpose
): Promise<OtpRecord | null> {
    return db.emailOtp.findFirst({
        where: { email, purpose },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Create a new OTP record
 */
export async function createOtp(data: {
    email: string;
    purpose: OtpPurpose;
    codeHash: string;
    expiresAt: Date;
}): Promise<OtpRecord> {
    // Delete any existing OTP for this email and purpose
    await db.emailOtp.deleteMany({
        where: { email: data.email, purpose: data.purpose },
    });

    return db.emailOtp.create({
        data: {
            email: data.email,
            purpose: data.purpose,
            codeHash: data.codeHash,
            expiresAt: data.expiresAt,
            lastSentAt: new Date(),
            sendCountWindowStart: new Date(),
            sendCountInWindow: 1,
        },
    });
}

/**
 * Update OTP for resend
 */
export async function updateOtpForResend(
    id: string,
    data: {
        codeHash: string;
        expiresAt: Date;
        sendCountInWindow: number;
        sendCountWindowStart?: Date;
    }
): Promise<OtpRecord> {
    return db.emailOtp.update({
        where: { id },
        data: {
            codeHash: data.codeHash,
            expiresAt: data.expiresAt,
            attempts: 0,
            lastSentAt: new Date(),
            sendCountInWindow: data.sendCountInWindow,
            ...(data.sendCountWindowStart && {
                sendCountWindowStart: data.sendCountWindowStart,
            }),
        },
    });
}

/**
 * Increment OTP attempts
 */
export async function incrementOtpAttempts(id: string): Promise<OtpRecord> {
    return db.emailOtp.update({
        where: { id },
        data: { attempts: { increment: 1 } },
    });
}

/**
 * Delete OTP record
 */
export async function deleteOtp(id: string): Promise<void> {
    await db.emailOtp.delete({ where: { id } });
}

/**
 * Delete all OTPs for an email
 */
export async function deleteOtpsByEmail(email: string): Promise<void> {
    await db.emailOtp.deleteMany({ where: { email } });
}

/**
 * Clean up expired OTPs (for scheduled cleanup)
 */
export async function cleanupExpiredOtps(): Promise<number> {
    const result = await db.emailOtp.deleteMany({
        where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
}
