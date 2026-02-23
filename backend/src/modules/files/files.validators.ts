import { z } from 'zod';
import { FileContextType, ALLOWED_FILE_TYPES } from '../../config/constants.js';

const fileContextValues = Object.values(FileContextType);

export const presignUploadSchema = z.object({
    filename: z.string().min(1).max(255),
    mimeType: z.string().refine(
        (val) => ALLOWED_FILE_TYPES.all.includes(val as typeof ALLOWED_FILE_TYPES.all[number]),
        { message: 'Invalid file type' }
    ),
    sizeBytes: z.number().int().min(1).max(50 * 1024 * 1024), // Max 50MB
    context: z.enum(fileContextValues as [string, ...string[]]),
    contextId: z.string().uuid(),
});

export const confirmUploadSchema = z.object({
    key: z.string().min(1),
    confirmToken: z.string().min(1),
});

export type PresignUploadInput = z.infer<typeof presignUploadSchema>;
export type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>;
