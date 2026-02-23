import { Request, Response, NextFunction } from 'express';
import * as joinRequestsService from './joinRequests.service.js';
import { success, created, paginated } from '../../utils/response.js';
import { parseLimit } from '../../utils/pagination.js';
import {
    CreateJoinRequestInput,
    UpdateJoinRequestInput,
} from './joinRequests.validators.js';

/**
 * POST /startups/:id/join-requests
 */
export async function createJoinRequest(
    req: Request<{ id: string }, unknown, CreateJoinRequestInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const request = await joinRequestsService.createJoinRequest(
            req.user!.userId,
            req.params.id,
            req.body
        );
        created(res, request);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /join-requests/me
 */
export async function getMyJoinRequests(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const query = {
            cursor: req.query.cursor as string | undefined,
            limit: parseLimit(req.query.limit),
            status: req.query.status as 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | undefined,
        };
        const result = await joinRequestsService.getMyJoinRequests(
            req.user!.userId,
            query
        );
        paginated(res, result.items, {
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /join-requests/:id/cancel
 */
export async function cancelJoinRequest(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await joinRequestsService.cancelJoinRequest(req.user!.userId, req.params.id);
        success(res, { message: 'Join request cancelled' });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /startups/:id/join-requests
 */
export async function getStartupJoinRequests(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const query = {
            cursor: req.query.cursor as string | undefined,
            limit: parseLimit(req.query.limit),
            status: req.query.status as 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | undefined,
        };
        const result = await joinRequestsService.getStartupJoinRequests(
            req.user!.userId,
            req.params.id,
            query
        );
        paginated(res, result.items, {
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /join-requests/:id
 */
export async function updateJoinRequest(
    req: Request<{ id: string }, unknown, UpdateJoinRequestInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const request = await joinRequestsService.updateJoinRequest(
            req.user!.userId,
            req.params.id,
            req.body.status
        );
        success(res, request);
    } catch (error) {
        next(error);
    }
}
