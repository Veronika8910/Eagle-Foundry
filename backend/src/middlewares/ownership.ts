import { Request, Response, NextFunction } from 'express';
import { error, ErrorCode } from '../utils/response.js';
import { db } from '../connectors/db.js';
import { StartupMemberRole } from '../config/constants.js';

/**
 * Middleware to verify startup ownership (must be founder)
 */
export function requireStartupOwner(paramName: string = 'id') {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.user) {
            error(res, ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
            return;
        }

        const startupId = req.params[paramName];
        if (!startupId) {
            error(res, ErrorCode.VALIDATION_ERROR, 'Startup ID is required', 400);
            return;
        }

        try {
            // Get the user's student profile
            const profile = await db.studentProfile.findUnique({
                where: { userId: req.user.userId },
                select: { id: true },
            });

            if (!profile) {
                error(res, ErrorCode.FORBIDDEN, 'Student profile required', 403);
                return;
            }

            // Check if user is a founder of this startup
            const membership = await db.startupMember.findFirst({
                where: {
                    startupId,
                    profileId: profile.id,
                    role: StartupMemberRole.FOUNDER,
                },
            });

            if (!membership) {
                error(res, ErrorCode.FORBIDDEN, 'Only founders can perform this action', 403);
                return;
            }

            next();
        } catch (err) {
            next(err);
        }
    };
}

/**
 * Middleware to verify startup membership (founder or member)
 */
export function requireStartupMember(paramName: string = 'id') {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.user) {
            error(res, ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
            return;
        }

        const startupId = req.params[paramName];
        if (!startupId) {
            error(res, ErrorCode.VALIDATION_ERROR, 'Startup ID is required', 400);
            return;
        }

        try {
            const profile = await db.studentProfile.findUnique({
                where: { userId: req.user.userId },
                select: { id: true },
            });

            if (!profile) {
                error(res, ErrorCode.FORBIDDEN, 'Student profile required', 403);
                return;
            }

            const membership = await db.startupMember.findFirst({
                where: {
                    startupId,
                    profileId: profile.id,
                },
            });

            if (!membership) {
                error(res, ErrorCode.FORBIDDEN, 'Must be a team member', 403);
                return;
            }

            next();
        } catch (err) {
            next(err);
        }
    };
}

/**
 * Middleware to verify opportunity ownership (org member)
 */
export function requireOpportunityOwner(paramName: string = 'id') {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.user) {
            error(res, ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
            return;
        }

        const opportunityId = req.params[paramName];
        if (!opportunityId) {
            error(res, ErrorCode.VALIDATION_ERROR, 'Opportunity ID is required', 400);
            return;
        }

        if (!req.user.orgId) {
            error(res, ErrorCode.FORBIDDEN, 'Must be part of an organization', 403);
            return;
        }

        try {
            const opportunity = await db.opportunity.findUnique({
                where: { id: opportunityId },
                select: { orgId: true },
            });

            if (!opportunity) {
                error(res, ErrorCode.NOT_FOUND, 'Opportunity not found', 404);
                return;
            }

            if (opportunity.orgId !== req.user.orgId) {
                error(res, ErrorCode.FORBIDDEN, 'Access denied to this opportunity', 403);
                return;
            }

            next();
        } catch (err) {
            next(err);
        }
    };
}

/**
 * Middleware to verify application ownership (applicant)
 */
export function requireApplicationOwner(paramName: string = 'id') {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.user) {
            error(res, ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
            return;
        }

        const applicationId = req.params[paramName];
        if (!applicationId) {
            error(res, ErrorCode.VALIDATION_ERROR, 'Application ID is required', 400);
            return;
        }

        try {
            const profile = await db.studentProfile.findUnique({
                where: { userId: req.user.userId },
                select: { id: true },
            });

            if (!profile) {
                error(res, ErrorCode.FORBIDDEN, 'Student profile required', 403);
                return;
            }

            const application = await db.application.findUnique({
                where: { id: applicationId },
                select: { profileId: true },
            });

            if (!application) {
                error(res, ErrorCode.NOT_FOUND, 'Application not found', 404);
                return;
            }

            if (application.profileId !== profile.id) {
                error(res, ErrorCode.FORBIDDEN, 'Not your application', 403);
                return;
            }

            next();
        } catch (err) {
            next(err);
        }
    };
}

/**
 * Middleware to verify join request ownership (requester)
 */
export function requireJoinRequestOwner(paramName: string = 'id') {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.user) {
            error(res, ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
            return;
        }

        const joinRequestId = req.params[paramName];
        if (!joinRequestId) {
            error(res, ErrorCode.VALIDATION_ERROR, 'Join request ID is required', 400);
            return;
        }

        try {
            const profile = await db.studentProfile.findUnique({
                where: { userId: req.user.userId },
                select: { id: true },
            });

            if (!profile) {
                error(res, ErrorCode.FORBIDDEN, 'Student profile required', 403);
                return;
            }

            const joinRequest = await db.joinRequest.findUnique({
                where: { id: joinRequestId },
                select: { profileId: true },
            });

            if (!joinRequest) {
                error(res, ErrorCode.NOT_FOUND, 'Join request not found', 404);
                return;
            }

            if (joinRequest.profileId !== profile.id) {
                error(res, ErrorCode.FORBIDDEN, 'Not your join request', 403);
                return;
            }

            next();
        } catch (err) {
            next(err);
        }
    };
}
