import { z } from 'zod';

export const listNotificationsQuerySchema = z.object({
    cursor: z.string().optional(),
    limit: z.string().optional().transform((val) => {
        if (!val) return 20;
        const num = parseInt(val, 10);
        return isNaN(num) ? 20 : Math.min(Math.max(1, num), 100);
    }),
    unreadOnly: z.string().optional().transform((val) => val === 'true'),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
