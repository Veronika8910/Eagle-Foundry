import { z } from 'zod';
import { httpUrlSchema } from '../../middlewares/validate.js';

export const customQuestionSchema = z.object({
    id: z.string().min(1),
    question: z.string().min(1).max(500),
    required: z.boolean().optional().default(false),
});

export const createStartupSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
    tagline: z.string().max(280).optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    stage: z.string().max(100).optional().nullable(),
    tags: z.array(z.string().max(50)).max(10).optional(),
    logoUrl: httpUrlSchema.optional().nullable(),
});

export const updateStartupSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    tagline: z.string().max(280).optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    stage: z.string().max(100).optional().nullable(),
    tags: z.array(z.string().max(50)).max(10).optional(),
    logoUrl: httpUrlSchema.optional().nullable(),
    acceptingJoinRequests: z.boolean().optional(),
    customQuestions: z.array(customQuestionSchema).max(20).optional().nullable(),
});

export const listStartupsQuerySchema = z.object({
    cursor: z.string().optional(),
    limit: z.string().optional().transform((val) => {
        if (!val) return 20;
        const num = parseInt(val, 10);
        return isNaN(num) ? 20 : Math.min(Math.max(1, num), 100);
    }),
    status: z.enum(['DRAFT', 'SUBMITTED', 'NEEDS_CHANGES', 'APPROVED', 'ARCHIVED']).optional(),
    tags: z.string().optional().transform((val) => val?.split(',').filter(Boolean)),
    stage: z.string().optional(),
    search: z.string().optional(),
});

export type CreateStartupInput = z.infer<typeof createStartupSchema>;
export type UpdateStartupInput = z.infer<typeof updateStartupSchema>;
export type ListStartupsQuery = z.infer<typeof listStartupsQuerySchema>;
