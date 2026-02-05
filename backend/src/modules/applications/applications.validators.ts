import { z } from 'zod';

export const createApplicationSchema = z.object({
    coverLetter: z.string().max(3000).optional().nullable(),
    resumeUrl: z.string().url().optional().nullable(),
});

export const updateApplicationStatusSchema = z.object({
    status: z.enum(['SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED']),
    note: z.string().max(500).optional().nullable(),
});

export const listApplicationsQuerySchema = z.object({
    cursor: z.string().optional(),
    limit: z.string().optional().transform((val) => {
        if (!val) return 20;
        const num = parseInt(val, 10);
        return isNaN(num) ? 20 : Math.min(Math.max(1, num), 100);
    }),
    status: z.enum(['SUBMITTED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN']).optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;
