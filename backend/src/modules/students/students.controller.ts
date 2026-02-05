import { Request, Response, NextFunction } from 'express';
import * as studentsService from './students.service.js';
import { success, created, noContent } from '../../utils/response.js';
import {
    UpdateProfileInput,
    CreatePortfolioItemInput,
    UpdatePortfolioItemInput,
    PresignResumeInput,
} from './students.validators.js';

/**
 * GET /students/me
 */
export async function getMyProfile(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const profile = await studentsService.getProfile(req.user!.userId);
        success(res, profile);
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /students/me
 */
export async function updateMyProfile(
    req: Request<unknown, unknown, UpdateProfileInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const profile = await studentsService.updateProfile(req.user!.userId, req.body);
        success(res, profile);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /students/me/portfolio
 */
export async function getMyPortfolio(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const items = await studentsService.getPortfolioItems(req.user!.userId);
        success(res, items);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /students/me/portfolio
 */
export async function createPortfolioItem(
    req: Request<unknown, unknown, CreatePortfolioItemInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const item = await studentsService.createPortfolioItem(req.user!.userId, req.body);
        created(res, item);
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /students/me/portfolio/:id
 */
export async function updatePortfolioItem(
    req: Request<{ id: string }, unknown, UpdatePortfolioItemInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const item = await studentsService.updatePortfolioItem(
            req.user!.userId,
            req.params.id,
            req.body
        );
        success(res, item);
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /students/me/portfolio/:id
 */
export async function deletePortfolioItem(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await studentsService.deletePortfolioItem(req.user!.userId, req.params.id);
        noContent(res);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /students/me/resume/presign
 */
export async function presignResumeUpload(
    req: Request<unknown, unknown, PresignResumeInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const result = await studentsService.getResumeUploadUrl(req.user!.userId, req.body);
        success(res, result);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /students/:id/public
 */
export async function getPublicProfile(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const profile = await studentsService.getPublicProfile(req.params.id);
        success(res, profile);
    } catch (error) {
        next(error);
    }
}
