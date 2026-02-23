import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service.js';
import { success, paginated } from '../../utils/response.js';
import { parseLimit } from '../../utils/pagination.js';
import {
    ReviewStartupInput,
    UpdateUserStatusInput,
    UpdateOrgStatusInput,
} from './admin.validators.js';

/**
 * GET /admin/startups/pending
 */
export async function getPendingStartups(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const query = {
            cursor: req.query.cursor as string | undefined,
            limit: parseLimit(req.query.limit),
            status: req.query.status as string | undefined,
        };
        const result = await adminService.getPendingStartups(query);
        paginated(res, result.items, {
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /admin/startups/:id/review
 */
export async function reviewStartup(
    req: Request<{ id: string }, unknown, ReviewStartupInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const startup = await adminService.reviewStartup(
            req.user!.userId,
            req.params.id,
            req.body
        );
        success(res, { message: 'Startup reviewed', startup });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /admin/users
 */
export async function listUsers(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const query = {
            cursor: req.query.cursor as string | undefined,
            limit: parseLimit(req.query.limit),
            status: req.query.status as string | undefined,
        };
        const result = await adminService.listUsers(query);
        paginated(res, result.items, {
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /admin/users/:id/status
 */
export async function updateUserStatus(
    req: Request<{ id: string }, unknown, UpdateUserStatusInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = await adminService.updateUserStatus(
            req.user!.userId,
            req.params.id,
            req.body
        );
        success(res, user);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /admin/orgs
 */
export async function listOrgs(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const query = {
            cursor: req.query.cursor as string | undefined,
            limit: parseLimit(req.query.limit),
            status: req.query.status as string | undefined,
        };
        const result = await adminService.listOrgs(query);
        paginated(res, result.items, {
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /admin/orgs/:id/status
 */
export async function updateOrgStatus(
    req: Request<{ id: string }, unknown, UpdateOrgStatusInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const org = await adminService.updateOrgStatus(
            req.user!.userId,
            req.params.id,
            req.body
        );
        success(res, org);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /admin/dashboard
 */
export async function getDashboardStats(
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const stats = await adminService.getDashboardStats();
        success(res, stats);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /admin/audit-logs
 */
export async function getAuditLogs(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const query = {
            cursor: req.query.cursor as string | undefined,
            limit: parseLimit(req.query.limit),
            status: req.query.status as string | undefined,
        };
        const result = await adminService.getAuditLogs(query);
        paginated(res, result.items, {
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
        });
    } catch (error) {
        next(error);
    }
}
