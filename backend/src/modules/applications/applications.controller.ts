import { Request, Response, NextFunction } from 'express';
import * as applicationsService from './applications.service.js';
import { success, created, paginated } from '../../utils/response.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { ErrorCode } from '../../utils/response.js';
import { parseLimit } from '../../utils/pagination.js';
import {
    CreateApplicationInput,
    UpdateApplicationStatusInput,
} from './applications.validators.js';

/**
 * POST /opportunities/:id/applications
 */
export async function createApplication(
    req: Request<{ id: string }, unknown, CreateApplicationInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const application = await applicationsService.createApplication(
            req.user!.userId,
            req.params.id,
            req.body
        );
        created(res, application);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /applications/me
 */
export async function getMyApplications(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const query = {
            cursor: req.query.cursor as string | undefined,
            limit: parseLimit(req.query.limit),
            status: req.query.status as 'SUBMITTED' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN' | undefined,
        };
        const result = await applicationsService.getMyApplications(
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
 * POST /applications/:id/withdraw
 */
export async function withdrawApplication(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await applicationsService.withdrawApplication(req.user!.userId, req.params.id);
        success(res, { message: 'Application withdrawn' });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /opportunities/:id/applications
 */
export async function getOpportunityApplications(
    req: Request<{ id: string }>,
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
            status: req.query.status as 'SUBMITTED' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN' | undefined,
        };
        const result = await applicationsService.getOpportunityApplications(
            req.user.orgId,
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
 * GET /applications/:id
 */
export async function getApplication(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user?.orgId) {
            throw new AppError(ErrorCode.FORBIDDEN, 'Not part of an organization', 403);
        }
        const application = await applicationsService.getApplicationById(
            req.user.orgId,
            req.params.id
        );
        success(res, application);
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /applications/:id/status
 */
export async function updateApplicationStatus(
    req: Request<{ id: string }, unknown, UpdateApplicationStatusInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user?.orgId) {
            throw new AppError(ErrorCode.FORBIDDEN, 'Not part of an organization', 403);
        }
        const application = await applicationsService.updateApplicationStatus(
            req.user.userId,
            req.user.orgId,
            req.params.id,
            req.body
        );
        success(res, application);
    } catch (error) {
        next(error);
    }
}
