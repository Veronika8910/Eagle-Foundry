import * as studentsRepo from './students.repo.js';
import { generatePresignedUploadUrl, generateS3Key } from '../../connectors/s3.js';
import { AppError, NotFoundError, ForbiddenError } from '../../middlewares/errorHandler.js';
import { ErrorCode } from '../../utils/response.js';
import { FileContextType } from '../../config/constants.js';
import {
    UpdateProfileInput,
    CreatePortfolioItemInput,
    UpdatePortfolioItemInput,
    PresignResumeInput,
} from './students.validators.js';

const MAX_PORTFOLIO_ITEMS = 10;

/**
 * Get student profile by user ID
 */
export async function getProfile(userId: string) {
    const profile = await studentsRepo.findByUserId(userId);

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    return profile;
}

/**
 * Update student profile
 */
export async function updateProfile(userId: string, data: UpdateProfileInput) {
    const profile = await studentsRepo.findByUserId(userId);

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    return studentsRepo.updateProfile(userId, data);
}

/**
 * Get public profile (for companies/admins)
 */
export async function getPublicProfile(profileId: string) {
    const profile = await studentsRepo.findByIdWithUser(profileId);

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    // Return limited public fields
    return {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        major: profile.major,
        gradYear: profile.gradYear,
        bio: profile.bio,
        skills: profile.skills,
        linkedinUrl: profile.linkedinUrl,
        githubUrl: profile.githubUrl,
    };
}

/**
 * Get portfolio items for current user
 */
export async function getPortfolioItems(userId: string) {
    const profile = await studentsRepo.findByUserId(userId);

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    return studentsRepo.getPortfolioItems(profile.id);
}

/**
 * Create portfolio item
 */
export async function createPortfolioItem(userId: string, data: CreatePortfolioItemInput) {
    const profile = await studentsRepo.findByUserId(userId);

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    // Check limit
    const count = await studentsRepo.countPortfolioItems(profile.id);
    if (count >= MAX_PORTFOLIO_ITEMS) {
        throw new AppError(
            ErrorCode.CONFLICT,
            `Maximum of ${MAX_PORTFOLIO_ITEMS} portfolio items allowed`,
            400
        );
    }

    return studentsRepo.createPortfolioItem(profile.id, {
        title: data.title,
        description: data.description ?? null,
        url: data.url ?? null,
        imageUrl: data.imageUrl ?? null
    });
}

/**
 * Update portfolio item
 */
export async function updatePortfolioItem(
    userId: string,
    itemId: string,
    data: UpdatePortfolioItemInput
) {
    const profile = await studentsRepo.findByUserId(userId);

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    const item = await studentsRepo.findPortfolioItemById(itemId);

    if (!item) {
        throw new NotFoundError('Portfolio item');
    }

    if (item.profileId !== profile.id) {
        throw new ForbiddenError('Not your portfolio item');
    }

    return studentsRepo.updatePortfolioItem(itemId, data);
}

/**
 * Delete portfolio item
 */
export async function deletePortfolioItem(userId: string, itemId: string) {
    const profile = await studentsRepo.findByUserId(userId);

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    const item = await studentsRepo.findPortfolioItemById(itemId);

    if (!item) {
        throw new NotFoundError('Portfolio item');
    }

    if (item.profileId !== profile.id) {
        throw new ForbiddenError('Not your portfolio item');
    }

    await studentsRepo.deletePortfolioItem(itemId);
}

/**
 * Generate presigned URL for resume upload
 */
export async function getResumeUploadUrl(userId: string, data: PresignResumeInput) {
    const profile = await studentsRepo.findByUserId(userId);

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    const key = generateS3Key(FileContextType.RESUME, profile.id, data.filename);

    const presignResult = await generatePresignedUploadUrl(key, data.mimeType, data.sizeBytes);

    return {
        uploadUrl: presignResult.uploadUrl,
        key: presignResult.key,
        expiresAt: presignResult.expiresAt,
    };
}

/**
 * Update resume URL after successful upload
 */
export async function updateResumeUrl(userId: string, resumeUrl: string) {
    return studentsRepo.updateProfile(userId, { resumeUrl });
}
