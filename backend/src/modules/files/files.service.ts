import { db } from '../../connectors/db.js';
import { generatePresignedUploadUrl, generatePresignedDownloadUrl, generateS3Key, deleteFile } from '../../connectors/s3.js';
import { AppError, ForbiddenError } from '../../middlewares/errorHandler.js';
import { ErrorCode } from '../../utils/response.js';
import { FileContextType, FileContextTypeType } from '../../config/constants.js';
import { PresignUploadInput, ConfirmUploadInput } from './files.validators.js';

/**
 * Generate presigned URL for upload
 */
export async function getUploadUrl(userId: string, data: PresignUploadInput) {
    // Validate context access
    await validateContextAccess(userId, data.context as FileContextTypeType, data.contextId);

    const key = generateS3Key(data.context, data.contextId, data.filename);

    const result = await generatePresignedUploadUrl(key, data.mimeType, data.sizeBytes);

    return {
        uploadUrl: result.uploadUrl,
        key: result.key,
        expiresAt: result.expiresAt,
    };
}

/**
 * Confirm upload and create file record
 */
export async function confirmUpload(userId: string, data: ConfirmUploadInput) {
    // Create or update file record
    const existingFile = await db.file.findUnique({
        where: { s3Key: data.key },
    });

    if (existingFile) {
        return existingFile;
    }

    // Parse key to get context info
    const keyParts = data.key.split('/');
    if (keyParts.length < 3) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid file key', 400);
    }

    const context = keyParts[0];
    const contextId = keyParts[1];
    const filename = keyParts.slice(2).join('/');

    const file = await db.file.create({
        data: {
            s3Key: data.key,
            filename,
            mimeType: 'application/octet-stream', // Would need to be passed or detected
            sizeBytes: 0, // Would need to be updated by a Lambda function after upload
            context,
            contextId,
            uploadedBy: userId,
        },
    });

    return file;
}

/**
 * Get download URL for a file
 */
export async function getDownloadUrl(userId: string, fileId: string) {
    const file = await db.file.findUnique({
        where: { id: fileId },
    });

    if (!file) {
        throw new AppError(ErrorCode.NOT_FOUND, 'File not found', 404);
    }

    // Validate access if context is set
    if (file.context && file.contextId) {
        await validateContextAccess(userId, file.context as FileContextTypeType, file.contextId);
    }

    const url = await generatePresignedDownloadUrl(file.s3Key);

    return {
        url,
        filename: file.filename,
        mimeType: file.mimeType,
    };
}

/**
 * Delete a file
 */
export async function deleteUploadedFile(userId: string, fileId: string) {
    const file = await db.file.findUnique({
        where: { id: fileId },
    });

    if (!file) {
        throw new AppError(ErrorCode.NOT_FOUND, 'File not found', 404);
    }

    // Only uploader or admin can delete
    if (file.uploadedBy !== userId) {
        throw new ForbiddenError('Cannot delete this file');
    }

    // Delete from S3
    await deleteFile(file.s3Key);

    // Delete record
    await db.file.delete({ where: { id: fileId } });
}

/**
 * Validate user has access to the context
 */
async function validateContextAccess(
    userId: string,
    context: FileContextTypeType,
    contextId: string
): Promise<void> {
    const user = await db.user.findUnique({
        where: { id: userId },
        include: { studentProfile: true },
    });

    if (!user) {
        throw new ForbiddenError('User not found');
    }

    switch (context) {
        case FileContextType.RESUME:
        case FileContextType.PORTFOLIO:
            // Student can only upload to their own profile
            if (!user.studentProfile || user.studentProfile.id !== contextId) {
                throw new ForbiddenError('Cannot upload to this profile');
            }
            break;

        case FileContextType.STARTUP_LOGO:
        case FileContextType.STARTUP_MEDIA:
            // Must be a startup team member
            if (user.studentProfile) {
                const membership = await db.startupMember.findFirst({
                    where: { startupId: contextId, profileId: user.studentProfile.id },
                });
                if (!membership) {
                    throw new ForbiddenError('Not a member of this startup');
                }
            } else {
                throw new ForbiddenError('Only startup members can upload');
            }
            break;

        case FileContextType.ORG_LOGO:
            // Must be company admin
            if (user.orgId !== contextId || user.role !== 'COMPANY_ADMIN') {
                throw new ForbiddenError('Cannot upload to this organization');
            }
            break;

        case FileContextType.OPPORTUNITY: {
            // Must be from the org that owns the opportunity
            const opportunity = await db.opportunity.findUnique({
                where: { id: contextId },
            });
            if (!opportunity || opportunity.orgId !== user.orgId) {
                throw new ForbiddenError('Cannot upload to this opportunity');
            }
            break;
        }

        case FileContextType.APPLICATION: {
            // Student must own the application
            if (user.studentProfile) {
                const application = await db.application.findUnique({
                    where: { id: contextId },
                });
                if (!application || application.profileId !== user.studentProfile.id) {
                    throw new ForbiddenError('Cannot upload to this application');
                }
            } else {
                throw new ForbiddenError('Only applicants can upload');
            }
            break;
        }

        case FileContextType.MESSAGE: {
            // Must be participant in the thread - simplified check
            const message = await db.message.findUnique({
                where: { id: contextId },
            });
            if (!message || message.senderId !== userId) {
                throw new ForbiddenError('Cannot upload to this message');
            }
            break;
        }

        default:
            throw new ForbiddenError('Invalid upload context');
    }
}
