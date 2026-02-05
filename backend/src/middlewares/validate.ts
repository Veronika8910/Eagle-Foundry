import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { error, ErrorCode } from '../utils/response.js';

interface ValidationSchemas {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}

/**
 * Middleware factory to validate request body, query, and params
 */
export function validate(schemas: ValidationSchemas) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (schemas.body) {
                req.body = await schemas.body.parseAsync(req.body);
            }
            if (schemas.query) {
                req.query = await schemas.query.parseAsync(req.query);
            }
            if (schemas.params) {
                req.params = await schemas.params.parseAsync(req.params);
            }
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                const details = err.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));

                error(
                    res,
                    ErrorCode.VALIDATION_ERROR,
                    'Validation failed',
                    400,
                    details
                );
                return;
            }
            next(err);
        }
    };
}

/**
 * Validate only request body
 */
export function validateBody<T extends ZodSchema>(schema: T) {
    return validate({ body: schema });
}

/**
 * Validate only query parameters
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
    return validate({ query: schema });
}

/**
 * Validate only URL params
 */
export function validateParams<T extends ZodSchema>(schema: T) {
    return validate({ params: schema });
}

// Common validation schemas
export const uuidParamSchema = z.object({
    id: z.string().uuid('Invalid ID format'),
});

export const emailSchema = z.string().email('Invalid email format').toLowerCase().trim();

export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    );

export const otpSchema = z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits');
