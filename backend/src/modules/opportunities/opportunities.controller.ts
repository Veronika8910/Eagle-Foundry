import { Request, Response, NextFunction } from 'express';
import * as opportunitiesService from './opportunities.service.js';
import { success, created, paginated } from '../../utils/response.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { ErrorCode } from '../../utils/response.js';
import { parseLimit } from '../../utils/pagination.js';
import {
    CreateOpportunityInput,
    UpdateOpportunityInput,
} from './opportunities.validators.js';

/**
 * POST /opportunities
 */
export async function createOpportunity(
    req: Request<unknown, unknown, CreateOpportunityInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user?.orgId) {
            throw new AppError(ErrorCode.FORBIDDEN, 'Not part of an organization', 403);
        }
        const opportunity = await opportunitiesService.createOpportunity(
            req.user.orgId,
            req.body
        );
        created(res, opportunity);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /opportunities
 */
export async function listOpportunities(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const query = {
            cursor: req.query.cursor as string | undefined,
            limit: parseLimit(req.query.limit),
            budgetType: req.query.budgetType as 'paid' | 'unpaid' | 'equity' | undefined,
            tags: req.query.tags ? (Array.isArray(req.query.tags) ? req.query.tags as string[] : [req.query.tags as string]) : undefined,
            search: req.query.search as string | undefined,
        };
        const result = await opportunitiesService.listOpportunities(query);
        paginated(res, result.items, {
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /opportunities/:id
 */
export async function getOpportunity(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const opportunity = await opportunitiesService.getOpportunityById(
            req.params.id,
            req.user?.userId,
            req.user?.orgId || undefined
        );
        success(res, opportunity);
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /opportunities/:id
 */
export async function updateOpportunity(
    req: Request<{ id: string }, unknown, UpdateOpportunityInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user?.orgId) {
            throw new AppError(ErrorCode.FORBIDDEN, 'Not part of an organization', 403);
        }
        const opportunity = await opportunitiesService.updateOpportunity(
            req.params.id,
            req.user.orgId,
            req.body
        );
        success(res, opportunity);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /opportunities/:id/publish
 */
export async function publishOpportunity(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user?.orgId) {
            throw new AppError(ErrorCode.FORBIDDEN, 'Not part of an organization', 403);
        }
        const opportunity = await opportunitiesService.publishOpportunity(
            req.params.id,
            req.user.orgId
        );
        success(res, { message: 'Opportunity published', opportunity });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /opportunities/:id/close
 */
export async function closeOpportunity(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user?.orgId) {
            throw new AppError(ErrorCode.FORBIDDEN, 'Not part of an organization', 403);
        }
        const opportunity = await opportunitiesService.closeOpportunity(
            req.params.id,
            req.user.orgId
        );
        success(res, { message: 'Opportunity closed', opportunity });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /orgs/me/opportunities
 */
export async function listOrgOpportunities(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user?.orgId) {
            throw new AppError(ErrorCode.FORBIDDEN, 'Not part of an organization', 403);
        }
        const query = {
            cursor: req.query.cursor as string | undefined,
            limit: parseLimit(req.query.limit),
            status: req.query.status as 'DRAFT' | 'PUBLISHED' | 'CLOSED' | undefined,
        };
        const result = await opportunitiesService.listOrgOpportunities(
            req.user.orgId,
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
