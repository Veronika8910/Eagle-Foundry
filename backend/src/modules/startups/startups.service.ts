import { StartupStatus } from '@prisma/client';
import { db } from '../../connectors/db.js';
import * as startupsRepo from './startups.repo.js';
import { AppError, NotFoundError, ForbiddenError } from '../../middlewares/errorHandler.js';
import { ErrorCode } from '../../utils/response.js';
import { publish } from '../../events/publish.js';
import { buildStartupSubmittedEvent } from '../../events/builders.js';
import { CreateStartupInput, UpdateStartupInput, ListStartupsQuery } from './startups.validators.js';

/**
 * Create a new startup (as draft)
 */
export async function createStartup(userId: string, data: CreateStartupInput) {
    // Get user's student profile
    const profile = await db.studentProfile.findUnique({
        where: { userId },
        include: { user: { select: { email: true } } },
    });

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    const startup = await startupsRepo.createStartup(
        {
            name: data.name,
            tagline: data.tagline ?? null,
            description: data.description ?? null,
            stage: data.stage ?? null,
            tags: data.tags ?? [],
            logoUrl: data.logoUrl ?? null,
        },
        profile.id
    );

    return startup;
}

/**
 * Get startup by ID
 */
export async function getStartupById(id: string, userId?: string) {
    const startup = await startupsRepo.findByIdWithMembers(id);

    if (!startup) {
        throw new NotFoundError('Startup');
    }

    // Check visibility rules
    let profileId: string | undefined;
    if (userId) {
        const profile = await db.studentProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        profileId = profile?.id;
    }

    // If not approved, check if user is a member
    if (startup.status !== StartupStatus.APPROVED) {
        const isMember = profileId && startup.members.some((m) => m.profileId === profileId);

        if (!isMember) {
            throw new NotFoundError('Startup');
        }
    }

    return startup;
}

/**
 * Update startup (only draft or needs_changes status)
 */
export async function updateStartup(
    startupId: string,
    userId: string,
    data: UpdateStartupInput
) {
    const startup = await startupsRepo.findById(startupId);

    if (!startup) {
        throw new NotFoundError('Startup');
    }

    // Check ownership
    const profile = await db.studentProfile.findUnique({
        where: { userId },
        select: { id: true },
    });

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    const isFounder = await startupsRepo.isFounder(startupId, profile.id);
    if (!isFounder) {
        throw new ForbiddenError('Only founders can edit startups');
    }

    // Check status
    if (
        startup.status !== StartupStatus.DRAFT &&
        startup.status !== StartupStatus.NEEDS_CHANGES
    ) {
        throw new AppError(
            ErrorCode.CONFLICT,
            'Can only edit startups in draft or needs changes status',
            400
        );
    }

    return startupsRepo.updateStartup(startupId, data);
}

/**
 * Submit startup for review
 */
export async function submitStartup(startupId: string, userId: string) {
    const startup = await startupsRepo.findById(startupId);

    if (!startup) {
        throw new NotFoundError('Startup');
    }

    const profile = await db.studentProfile.findUnique({
        where: { userId },
        include: { user: { select: { email: true } } },
    });

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    const isFounder = await startupsRepo.isFounder(startupId, profile.id);
    if (!isFounder) {
        throw new ForbiddenError('Only founders can submit startups');
    }

    if (
        startup.status !== StartupStatus.DRAFT &&
        startup.status !== StartupStatus.NEEDS_CHANGES
    ) {
        throw new AppError(ErrorCode.CONFLICT, 'Startup is not in a submittable state', 400);
    }

    // Validate required fields
    if (!startup.name || !startup.description) {
        throw new AppError(
            ErrorCode.VALIDATION_ERROR,
            'Name and description are required before submitting',
            400
        );
    }

    const updated = await startupsRepo.updateStartup(startupId, {
        status: StartupStatus.SUBMITTED,
        adminFeedback: null,
    });

    // Publish event
    const event = buildStartupSubmittedEvent(
        startupId,
        startup.name,
        profile.userId,
        profile.user.email
    );
    await publish(event.type, event.payload);

    return updated;
}

/**
 * Archive startup
 */
export async function archiveStartup(startupId: string, userId: string) {
    const startup = await startupsRepo.findById(startupId);

    if (!startup) {
        throw new NotFoundError('Startup');
    }

    const profile = await db.studentProfile.findUnique({
        where: { userId },
        select: { id: true },
    });

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    const isFounder = await startupsRepo.isFounder(startupId, profile.id);
    if (!isFounder) {
        throw new ForbiddenError('Only founders can archive startups');
    }

    return startupsRepo.updateStartup(startupId, {
        status: StartupStatus.ARCHIVED,
    });
}

/**
 * List startups (students see approved + own)
 */
export async function listStartups(userId: string, query: ListStartupsQuery) {
    const profile = await db.studentProfile.findUnique({
        where: { userId },
        select: { id: true },
    });

    // Default to approved status for listing
    let status: StartupStatus | StartupStatus[] = StartupStatus.APPROVED;

    // If query has specific status and user is viewing their own, allow
    if (query.status) {
        status = query.status as StartupStatus;
    }

    return startupsRepo.listStartups({
        cursor: query.cursor,
        limit: query.limit,
        status,
        tags: query.tags,
        stage: query.stage,
        search: query.search,
        profileId: profile?.id, // Include own startups
    });
}

/**
 * Get startup team members
 */
export async function getTeamMembers(startupId: string, userId?: string) {
    const startup = await startupsRepo.findById(startupId);

    if (!startup) {
        throw new NotFoundError('Startup');
    }

    // Check visibility
    if (startup.status !== StartupStatus.APPROVED && userId) {
        const profile = await db.studentProfile.findUnique({
            where: { userId },
            select: { id: true },
        });

        if (profile) {
            const isMember = await startupsRepo.isMember(startupId, profile.id);
            if (!isMember) {
                throw new NotFoundError('Startup');
            }
        }
    }

    return startupsRepo.getTeamMembers(startupId);
}
