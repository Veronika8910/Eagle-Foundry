import type { CookieOptions, Request, Response } from 'express';
import { env } from '../config/env.js';
import { getTokenExpiry } from './security.js';

function parseCookieHeader(cookieHeader: string): Record<string, string> {
    return cookieHeader
        .split(';')
        .map((chunk) => chunk.trim())
        .filter(Boolean)
        .reduce<Record<string, string>>((acc, chunk) => {
            const separator = chunk.indexOf('=');
            if (separator <= 0) {
                return acc;
            }
            const key = chunk.slice(0, separator).trim();
            const value = chunk.slice(separator + 1).trim();
            try {
                acc[key] = decodeURIComponent(value);
            } catch {
                acc[key] = value;
            }
            return acc;
        }, {});
}

function getRefreshCookieMaxAgeMs(): number {
    const expiresAt = getTokenExpiry(env.JWT_REFRESH_EXPIRES_IN);
    return Math.max(0, expiresAt.getTime() - Date.now());
}

export function getRefreshTokenCookieOptions(): CookieOptions {
    const secure =
        (env.REFRESH_COOKIE_SECURE ?? env.NODE_ENV === 'production') ||
        env.REFRESH_COOKIE_SAME_SITE === 'none';

    return {
        httpOnly: true,
        secure,
        sameSite: env.REFRESH_COOKIE_SAME_SITE,
        path: '/api/auth',
        ...(env.REFRESH_COOKIE_DOMAIN ? { domain: env.REFRESH_COOKIE_DOMAIN } : {}),
        maxAge: getRefreshCookieMaxAgeMs(),
    };
}

export function setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie(env.REFRESH_COOKIE_NAME, token, getRefreshTokenCookieOptions());
}

export function clearRefreshTokenCookie(res: Response): void {
    const options = getRefreshTokenCookieOptions();
    res.clearCookie(env.REFRESH_COOKIE_NAME, {
        ...options,
        maxAge: undefined,
    });
}

export function extractRefreshToken(req: Request): string | null {
    const bodyToken =
        typeof req.body === 'object' &&
        req.body !== null &&
        'refreshToken' in req.body &&
        typeof (req.body as { refreshToken?: unknown }).refreshToken === 'string'
            ? (req.body as { refreshToken: string }).refreshToken
            : null;

    if (bodyToken && bodyToken.trim()) {
        return bodyToken;
    }

    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
        return null;
    }

    const cookies = parseCookieHeader(cookieHeader);
    const cookieToken = cookies[env.REFRESH_COOKIE_NAME];
    return cookieToken && cookieToken.trim() ? cookieToken : null;
}
