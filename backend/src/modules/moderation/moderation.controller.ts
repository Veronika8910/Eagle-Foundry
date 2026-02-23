import { Request, Response, NextFunction } from 'express';
import * as moderationService from './moderation.service.js';
import { success, created, paginated } from '../../utils/response.js';
import {
    CreateReportInput,
    ResolveReportInput,
} from '../admin/admin.validators.js';
import { parseLimit } from '../../utils/pagination.js';

/**
 * POST /reports
 */
export async function createReport(
    req: Request<unknown, unknown, CreateReportInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const report = await moderationService.createReport(req.user!.userId, req.body);
        created(res, report);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /reports/pending
 */
export async function getPendingReports(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const query = {
            cursor: req.query.cursor as string | undefined,
            limit: parseLimit(req.query.limit),
        };
        const result = await moderationService.getPendingReports(query);
        paginated(res, result.items, {
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /reports/:id/resolve
 */
export async function resolveReport(
    req: Request<{ id: string }, unknown, ResolveReportInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const report = await moderationService.resolveReport(
            req.user!.userId,
            req.params.id,
            req.body
        );
        success(res, report);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /reports/me
 */
export async function getMyReports(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const query = {
            cursor: req.query.cursor as string | undefined,
            limit: parseLimit(req.query.limit),
        };
        const result = await moderationService.getMyReports(req.user!.userId, query);
        paginated(res, result.items, {
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
        });
    } catch (error) {
        next(error);
    }
}
