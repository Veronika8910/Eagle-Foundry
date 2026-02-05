import { z } from 'zod';

export const sendMessageSchema = z.object({
    content: z.string().min(1, 'Message cannot be empty').max(5000),
});

export const listMessagesQuerySchema = z.object({
    cursor: z.string().optional(),
    limit: z.string().optional().transform((val) => {
        if (!val) return 50;
        const num = parseInt(val, 10);
        return isNaN(num) ? 50 : Math.min(Math.max(1, num), 100);
    }),
    before: z.string().optional(), // For loading older messages
});

export const listThreadsQuerySchema = z.object({
    cursor: z.string().optional(),
    limit: z.string().optional().transform((val) => {
        if (!val) return 20;
        const num = parseInt(val, 10);
        return isNaN(num) ? 20 : Math.min(Math.max(1, num), 50);
    }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
export type ListThreadsQuery = z.infer<typeof listThreadsQuerySchema>;
