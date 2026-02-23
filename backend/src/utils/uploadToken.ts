import crypto from 'crypto';
import { z } from 'zod';
import { env } from '../config/env.js';
import { FILE_LIMITS } from '../config/constants.js';

const uploadTokenSchema = z.object({
    sub: z.string().uuid(),
    key: z.string().min(1),
    context: z.string().min(1),
    contextId: z.string().uuid(),
    mimeType: z.string().min(1),
    sizeBytes: z.number().int().positive(),
    iat: z.number().int().positive(),
    exp: z.number().int().positive(),
});

export type UploadTokenPayload = z.infer<typeof uploadTokenSchema>;

interface UploadTokenPayloadInput {
    sub: string;
    key: string;
    context: string;
    contextId: string;
    mimeType: string;
    sizeBytes: number;
}

const HEADER_JSON = JSON.stringify({
    alg: 'HS256',
    typ: 'EAGLE_UPLOAD',
});

function encodeBase64Url(value: string): string {
    return Buffer.from(value, 'utf8').toString('base64url');
}

function decodeBase64Url(value: string): string {
    return Buffer.from(value, 'base64url').toString('utf8');
}

function getSigningSecret(): string {
    const secret = env.UPLOAD_TOKEN_SECRET || env.JWT_ACCESS_SECRET;
    if (!secret || (typeof secret === 'string' && secret.trim() === '')) {
        throw new Error('UPLOAD_TOKEN_SECRET or JWT_ACCESS_SECRET must be set');
    }
    return secret;
}

function sign(unsigned: string): string {
    return crypto
        .createHmac('sha256', getSigningSecret())
        .update(unsigned)
        .digest('base64url');
}

function safeCompare(a: string, b: string): boolean {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    const maxLen = Math.max(aBuf.length, bBuf.length);
    const paddedA = Buffer.alloc(maxLen, 0);
    const paddedB = Buffer.alloc(maxLen, 0);
    aBuf.copy(paddedA);
    bBuf.copy(paddedB);
    return crypto.timingSafeEqual(paddedA, paddedB) && aBuf.length === bBuf.length;
}

export function createUploadToken(
    payload: UploadTokenPayloadInput,
    expiresInSeconds: number = FILE_LIMITS.PRESIGNED_URL_EXPIRY_SECONDS
): string {
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload: UploadTokenPayload = {
        ...payload,
        iat: now,
        exp: now + expiresInSeconds,
    };

    const headerB64 = encodeBase64Url(HEADER_JSON);
    const payloadB64 = encodeBase64Url(JSON.stringify(tokenPayload));
    const unsigned = `${headerB64}.${payloadB64}`;
    const signature = sign(unsigned);

    return `${unsigned}.${signature}`;
}

export function verifyUploadToken(token: string): UploadTokenPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) {
        return null;
    }

    const [headerB64, payloadB64, signature] = parts;
    const expectedSignature = sign(`${headerB64}.${payloadB64}`);
    if (!safeCompare(signature, expectedSignature)) {
        return null;
    }

    try {
        const payload = JSON.parse(decodeBase64Url(payloadB64));
        const parsed = uploadTokenSchema.safeParse(payload);
        if (!parsed.success) {
            return null;
        }

        if (parsed.data.exp <= Math.floor(Date.now() / 1000)) {
            return null;
        }

        return parsed.data;
    } catch {
        return null;
    }
}
