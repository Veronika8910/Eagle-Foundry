import { z } from 'zod';

export const searchQuerySchema = z.object({
    q: z.string().min(1, 'Search query is required').max(200),
    type: z.enum(['all', 'startups', 'opportunities', 'students', 'orgs']).default('all'),
    limit: z.string().optional().transform((val) => {
        if (!val) return 10;
        const num = parseInt(val, 10);
        return isNaN(num) ? 10 : Math.min(Math.max(1, num), 50);
    }),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
