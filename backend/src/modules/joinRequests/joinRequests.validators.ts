import { z } from 'zod';

export const createJoinRequestSchema = z.object({
    message: z.string().max(500).optional().nullable(),
});

export const updateJoinRequestSchema = z.object({
    status: z.enum(['ACCEPTED', 'REJECTED']),
});

export const listJoinRequestsQuerySchema = z.object({
    cursor: z.string().optional(),
    limit: z.string().optional().transform((val) => {
        if (!val) return 20;
        const num = parseInt(val, 10);
        return isNaN(num) ? 20 : Math.min(Math.max(1, num), 100);
    }),
    status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED']).optional(),
});

export type CreateJoinRequestInput = z.infer<typeof createJoinRequestSchema>;
export type UpdateJoinRequestInput = z.infer<typeof updateJoinRequestSchema>;
export type ListJoinRequestsQuery = z.infer<typeof listJoinRequestsQuerySchema>;
