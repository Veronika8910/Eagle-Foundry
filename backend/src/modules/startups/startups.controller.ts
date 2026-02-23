import { Request, Response, NextFunction } from 'express';
import * as startupsService from './startups.service.js';
import { success, created, paginated } from '../../utils/response.js';
import { CreateStartupInput, UpdateStartupInput } from './startups.validators.js';
import { parseLimit } from '../../utils/pagination.js';
import type { UserRole } from '@prisma/client';

/**
 * POST /startups
 */
export async function createStartup(
    req: Request<unknown, unknown, CreateStartupInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const startup = await startupsService.createStartup(req.user!.userId, req.body);
        created(res, startup);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /startups
 */
export async function listStartups(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const query = {
            cursor: req.query.cursor as string | undefined,
            limit: parseLimit(req.query.limit),
            status: req.query.status as 'DRAFT' | 'SUBMITTED' | 'NEEDS_CHANGES' | 'APPROVED' | 'ARCHIVED' | undefined,
            tags: req.query.tags ? (Array.isArray(req.query.tags) ? req.query.tags as string[] : [req.query.tags as string]) : undefined,
            stage: req.query.stage as string | undefined,
            search: req.query.search as string | undefined,
        };
        const result = await startupsService.listStartups(req.user!.userId, query);
        paginated(res, result.items, {
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /startups/:id
 */
export async function getStartup(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const startup = await startupsService.getStartupById(
            req.params.id,
            req.user?.userId,
            req.user?.role as UserRole | undefined
        );
        success(res, startup);
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /startups/:id
 */
export async function updateStartup(
    req: Request<{ id: string }, unknown, UpdateStartupInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const startup = await startupsService.updateStartup(
            req.params.id,
            req.user!.userId,
            req.body
        );
        success(res, startup);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /startups/:id/submit
 */
export async function submitStartup(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const startup = await startupsService.submitStartup(req.params.id, req.user!.userId);
        success(res, { message: 'Startup submitted for review', startup });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /startups/:id/archive
 */
export async function archiveStartup(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const startup = await startupsService.archiveStartup(req.params.id, req.user!.userId);
        success(res, { message: 'Startup archived', startup });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /startups/:id/team
 */
export async function getTeam(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const team = await startupsService.getTeamMembers(req.params.id, req.user?.userId, req.user?.role as UserRole | undefined);
        success(res, team);
    } catch (error) {
        next(error);
    }
}
