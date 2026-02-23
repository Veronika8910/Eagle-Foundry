import { Request, Response, NextFunction } from 'express';
import * as orgsService from './orgs.service.js';
import { success, created, noContent, paginated } from '../../utils/response.js';
import { UpdateOrgInput, AddMemberInput } from './orgs.validators.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { ErrorCode } from '../../utils/response.js';
import { parseLimit } from '../../utils/pagination.js';

/**
 * GET /orgs/me
 */
export async function getMyOrg(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user?.orgId) {
            throw new AppError(ErrorCode.NOT_FOUND, 'Not part of an organization', 404);
        }
        const org = await orgsService.getMyOrg(req.user.orgId);
        success(res, org);
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /orgs/me
 */
export async function updateMyOrg(
    req: Request<unknown, unknown, UpdateOrgInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user?.orgId) {
            throw new AppError(ErrorCode.NOT_FOUND, 'Not part of an organization', 404);
        }
        const org = await orgsService.updateMyOrg(req.user.orgId, req.body);
        success(res, org);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /orgs/me/members
 */
export async function getMembers(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user?.orgId) {
            throw new AppError(ErrorCode.NOT_FOUND, 'Not part of an organization', 404);
        }
        const members = await orgsService.getMembers(req.user.orgId);
        success(res, members);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /orgs/me/members
 */
export async function addMember(
    req: Request<unknown, unknown, AddMemberInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user?.orgId) {
            throw new AppError(ErrorCode.NOT_FOUND, 'Not part of an organization', 404);
        }
        const result = await orgsService.addMember(req.user.orgId, req.user.userId, req.body);
        created(res, result);
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /orgs/me/members/:memberId
 */
export async function removeMember(
    req: Request<{ memberId: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user?.orgId) {
            throw new AppError(ErrorCode.NOT_FOUND, 'Not part of an organization', 404);
        }
        await orgsService.removeMember(req.user.orgId, req.user.userId, req.params.memberId);
        noContent(res);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /orgs
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
            search: req.query.search as string | undefined,
        };
        const result = await orgsService.listActiveOrgs(query);
        paginated(res, result.items, {
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /orgs/:orgId
 */
export async function getOrgById(
    req: Request<{ orgId: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const org = await orgsService.getOrgById(req.params.orgId);
        success(res, org);
    } catch (error) {
        next(error);
    }
}
