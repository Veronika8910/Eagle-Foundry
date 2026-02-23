import { z } from 'zod';
import { httpUrlSchema } from '../../middlewares/validate.js';

export const updateProfileSchema = z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    major: z.string().max(200).optional().nullable(),
    gradYear: z.number().int().min(2000).max(2100).optional().nullable(),
    bio: z.string().max(2000).optional().nullable(),
    skills: z.array(z.string().max(50)).max(20).optional(),
    linkedinUrl: httpUrlSchema.optional().nullable(),
    githubUrl: httpUrlSchema.optional().nullable(),
});

export const createPortfolioItemSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(2000).optional().nullable(),
    url: httpUrlSchema.optional().nullable(),
    imageUrl: httpUrlSchema.optional().nullable(),
});

export const updatePortfolioItemSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional().nullable(),
    url: httpUrlSchema.optional().nullable(),
    imageUrl: httpUrlSchema.optional().nullable(),
});

export const presignResumeSchema = z.object({
    filename: z.string().min(1, 'Filename is required').max(255),
    mimeType: z.enum(['application/pdf'], {
        errorMap: () => ({ message: 'Only PDF files are allowed for resumes' }),
    }),
    sizeBytes: z.number().int().min(1).max(10 * 1024 * 1024), // Max 10MB
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreatePortfolioItemInput = z.infer<typeof createPortfolioItemSchema>;
export type UpdatePortfolioItemInput = z.infer<typeof updatePortfolioItemSchema>;
export type PresignResumeInput = z.infer<typeof presignResumeSchema>;
