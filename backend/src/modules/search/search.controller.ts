import { Request, Response, NextFunction } from 'express';
import * as searchService from './search.service.js';
import { success } from '../../utils/response.js';
import { SearchQuery } from './search.validators.js';

/**
 * GET /search
 */
export async function search(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const query = req.query as unknown as SearchQuery;
        const results = await searchService.search(req.user!.userId, query);
        success(res, results);
    } catch (error) {
        next(error);
    }
}
