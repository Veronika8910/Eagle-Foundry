import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
    namespace Express {
        interface Request {
            requestId?: string;
        }
    }
}

/**
 * Middleware to generate and attach a unique request ID
 */
export function requestIdMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const incomingRequestId = req.headers['x-request-id'];
    const requestId =
        typeof incomingRequestId === 'string' &&
        /^[A-Za-z0-9._-]{8,128}$/.test(incomingRequestId)
            ? incomingRequestId
            : uuidv4();

    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);

    next();
}
