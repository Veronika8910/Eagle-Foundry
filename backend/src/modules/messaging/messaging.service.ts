import { db } from '../../connectors/db.js';
import * as messagingRepo from './messaging.repo.js';
import { ForbiddenError, NotFoundError } from '../../middlewares/errorHandler.js';
import { publish } from '../../events/publish.js';
import { buildMessageSentEvent } from '../../events/builders.js';
import { SendMessageInput, ListMessagesQuery, ListThreadsQuery } from './messaging.validators.js';

/**
 * Check if user can access thread
 */
async function canAccessThread(userId: string, threadId: string): Promise<boolean> {
    const thread = await messagingRepo.findThreadById(threadId);

    if (!thread) {
        return false;
    }

    const user = await db.user.findUnique({
        where: { id: userId },
        include: { studentProfile: { select: { id: true } } },
    });

    if (!user) {
        return false;
    }

    // Check via application (singular)
    if (thread.application) {
        // Student applicant
        if (user.studentProfile && thread.application.profileId === user.studentProfile.id) {
            return true;
        }
        // Company member
        if (user.orgId && thread.application.opportunity.orgId === user.orgId) {
            return true;
        }
    }

    // Check via join request (singular)
    if (thread.joinRequest) {
        // Student requester
        if (user.studentProfile && thread.joinRequest.profileId === user.studentProfile.id) {
            return true;
        }
        // Startup founder
        for (const member of thread.joinRequest.startup.members) {
            if (member.profile.userId === userId) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Send message to thread
 */
export async function sendMessage(
    userId: string,
    threadId: string,
    data: SendMessageInput
) {
    const canAccess = await canAccessThread(userId, threadId);
    if (!canAccess) {
        throw new ForbiddenError('Access denied to this thread');
    }

    const message = await messagingRepo.createMessage({
        threadId,
        senderId: userId,
        content: data.content,
    });

    // Update thread timestamp
    await db.messageThread.update({
        where: { id: threadId },
        data: { updatedAt: new Date() },
    });

    // Publish event for notifications
    const thread = await messagingRepo.findThreadById(threadId);
    if (thread) {
        const recipients: string[] = [];

        if (thread.application) {
            if (thread.application.profile.user.id !== userId) {
                recipients.push(thread.application.profile.user.id);
            }
        }

        if (thread.joinRequest) {
            if (thread.joinRequest.profile.user.id !== userId) {
                recipients.push(thread.joinRequest.profile.user.id);
            }
            for (const member of thread.joinRequest.startup.members) {
                if (member.profile.userId !== userId) {
                    recipients.push(member.profile.userId);
                }
            }
        }

        // Publish to first recipient
        if (recipients.length > 0) {
            const event = buildMessageSentEvent(
                message.id,
                threadId,
                userId,
                recipients[0],
                data.content.substring(0, 100)
            );
            await publish(event.type, event.payload);
        }
    }

    return message;
}

/**
 * Get messages for a thread
 */
export async function getMessages(
    userId: string,
    threadId: string,
    query: ListMessagesQuery
) {
    const canAccess = await canAccessThread(userId, threadId);
    if (!canAccess) {
        throw new ForbiddenError('Access denied to this thread');
    }

    return messagingRepo.getMessages(threadId, query.cursor, query.limit);
}

/**
 * Get my threads
 */
export async function getMyThreads(userId: string, query: ListThreadsQuery) {
    return messagingRepo.getThreadsForUser(userId, query.cursor, query.limit);
}

/**
 * Get thread by ID
 */
export async function getThread(userId: string, threadId: string) {
    const canAccess = await canAccessThread(userId, threadId);
    if (!canAccess) {
        throw new ForbiddenError('Access denied to this thread');
    }

    const thread = await messagingRepo.findThreadById(threadId);
    if (!thread) {
        throw new NotFoundError('Thread');
    }

    return thread;
}
