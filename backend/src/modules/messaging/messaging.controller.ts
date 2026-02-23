import { Request, Response, NextFunction } from 'express';
import * as messagingService from './messaging.service.js';
import { success, created, paginated } from '../../utils/response.js';
import { SendMessageInput } from './messaging.validators.js';
import { parseLimit } from '../../utils/pagination.js';

/**
 * POST /messages/threads/:id/messages
 */
export async function sendMessage(
    req: Request<{ id: string }, unknown, SendMessageInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const message = await messagingService.sendMessage(
            req.user!.userId,
            req.params.id,
            req.body
        );
        created(res, message);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /messages/threads/:id/messages
 */
export async function getMessages(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const query = {
            cursor: req.query.cursor as string | undefined,
            limit: parseLimit(req.query.limit),
        };
        const result = await messagingService.getMessages(
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
 * GET /messages/threads
 */
export async function getMyThreads(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const query = {
            cursor: req.query.cursor as string | undefined,
            limit: parseLimit(req.query.limit),
        };
        const result = await messagingService.getMyThreads(req.user!.userId, query);
        paginated(res, result.items, {
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /messages/threads/:id
 */
export async function getThread(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const thread = await messagingService.getThread(
            req.user!.userId,
            req.params.id
        );
        success(res, thread);
    } catch (error) {
        next(error);
    }
}
