import { JoinRequestStatus, StartupStatus } from '@prisma/client';
import { db } from '../../connectors/db.js';
import * as joinRequestsRepo from './joinRequests.repo.js';
import * as startupsRepo from '../startups/startups.repo.js';
import { AppError, NotFoundError, ForbiddenError } from '../../middlewares/errorHandler.js';
import { ErrorCode } from '../../utils/response.js';
import { StartupMemberRole } from '../../config/constants.js';
import { publish } from '../../events/publish.js';
import { buildJoinRequestCreatedEvent, buildJoinRequestAcceptedEvent } from '../../events/builders.js';
import { CreateJoinRequestInput, ListJoinRequestsQuery } from './joinRequests.validators.js';

/**
 * Create join request
 */
export async function createJoinRequest(
    userId: string,
    startupId: string,
    data: CreateJoinRequestInput
) {
    const profile = await db.studentProfile.findUnique({
        where: { userId },
        include: { user: { select: { email: true } } },
    });

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    const startup = await startupsRepo.findByIdWithMembers(startupId);

    if (!startup) {
        throw new NotFoundError('Startup');
    }

    if (startup.status !== StartupStatus.APPROVED) {
        throw new AppError(ErrorCode.CONFLICT, 'Can only join approved startups', 400);
    }

    // Check if already a member
    const isMember = await startupsRepo.isMember(startupId, profile.id);
    if (isMember) {
        throw new AppError(ErrorCode.CONFLICT, 'Already a member of this startup', 409);
    }

    // Check for existing pending request
    const existingRequest = await joinRequestsRepo.findExistingRequest(startupId, profile.id);
    if (existingRequest) {
        throw new AppError(ErrorCode.CONFLICT, 'You already have a pending join request', 409);
    }

    const joinRequest = await joinRequestsRepo.createJoinRequest({
        startupId,
        profileId: profile.id,
        message: data.message,
    });

    // Find founder for notification
    const founder = startup.members.find((m) => m.role === StartupMemberRole.FOUNDER);
    if (founder) {
        const event = buildJoinRequestCreatedEvent(
            joinRequest.id,
            startupId,
            startup.name,
            profile.userId,
            profile.user.email,
            `${profile.firstName} ${profile.lastName}`,
            founder.profile.userId,
            '' // Would need to fetch founder's email
        );
        await publish(event.type, event.payload);
    }

    return joinRequest;
}

/**
 * Get my join requests
 */
export async function getMyJoinRequests(userId: string, query: ListJoinRequestsQuery) {
    const profile = await db.studentProfile.findUnique({
        where: { userId },
        select: { id: true },
    });

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    return joinRequestsRepo.listByProfileId(
        profile.id,
        query.cursor,
        query.limit,
        query.status as JoinRequestStatus | undefined
    );
}

/**
 * Cancel join request
 */
export async function cancelJoinRequest(userId: string, requestId: string) {
    const profile = await db.studentProfile.findUnique({
        where: { userId },
        select: { id: true },
    });

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    const request = await joinRequestsRepo.findById(requestId);

    if (!request) {
        throw new NotFoundError('Join request');
    }

    if (request.profileId !== profile.id) {
        throw new ForbiddenError('Not your join request');
    }

    if (request.status !== JoinRequestStatus.PENDING) {
        throw new AppError(ErrorCode.CONFLICT, 'Can only cancel pending requests', 400);
    }

    return joinRequestsRepo.updateJoinRequest(requestId, {
        status: JoinRequestStatus.CANCELLED,
    });
}

/**
 * Get join requests for a startup (founder only)
 */
export async function getStartupJoinRequests(
    userId: string,
    startupId: string,
    query: ListJoinRequestsQuery
) {
    const profile = await db.studentProfile.findUnique({
        where: { userId },
        select: { id: true },
    });

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    const isFounder = await startupsRepo.isFounder(startupId, profile.id);
    if (!isFounder) {
        throw new ForbiddenError('Only founders can view join requests');
    }

    return joinRequestsRepo.listByStartupId(
        startupId,
        query.cursor,
        query.limit,
        query.status as JoinRequestStatus | undefined
    );
}

/**
 * Accept or reject join request (founder only)
 */
export async function updateJoinRequest(
    userId: string,
    requestId: string,
    status: 'ACCEPTED' | 'REJECTED'
) {
    const profile = await db.studentProfile.findUnique({
        where: { userId },
        include: { user: { select: { email: true } } },
    });

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    const request = await joinRequestsRepo.findById(requestId);

    if (!request) {
        throw new NotFoundError('Join request');
    }

    const isFounder = await startupsRepo.isFounder(request.startupId, profile.id);
    if (!isFounder) {
        throw new ForbiddenError('Only founders can manage join requests');
    }

    if (request.status !== JoinRequestStatus.PENDING) {
        throw new AppError(ErrorCode.CONFLICT, 'Request is no longer pending', 400);
    }

    const newStatus = status === 'ACCEPTED'
        ? JoinRequestStatus.ACCEPTED
        : JoinRequestStatus.REJECTED;

    // Use transaction for accept
    if (status === 'ACCEPTED') {
        const result = await db.$transaction(async (tx) => {
            // Create thread for messaging
            const thread = await tx.messageThread.create({ data: {} });

            // Update join request
            const updated = await tx.joinRequest.update({
                where: { id: requestId },
                data: { status: newStatus, threadId: thread.id },
            });

            // Add as team member
            await tx.startupMember.create({
                data: {
                    startupId: request.startupId,
                    profileId: request.profileId,
                    role: StartupMemberRole.MEMBER,
                },
            });

            return updated;
        });

        // Publish event
        const event = buildJoinRequestAcceptedEvent(
            requestId,
            request.startupId,
            request.startup.name,
            request.profile.userId,
            request.profile.user.email,
            `${request.profile.firstName} ${request.profile.lastName}`,
            profile.userId,
            profile.user.email
        );
        await publish(event.type, event.payload);

        return result;
    }

    return joinRequestsRepo.updateJoinRequest(requestId, { status: newStatus });
}
