import { db } from '../../connectors/db.js';

/**
 * Get thread by ID with participants
 */
export async function findThreadById(threadId: string) {
    return db.messageThread.findUnique({
        where: { id: threadId },
        include: {
            application: {
                include: {
                    profile: { include: { user: { select: { id: true } } } },
                    opportunity: { include: { org: { select: { id: true, members: { select: { id: true } } } } } },
                },
            },
            joinRequest: {
                include: {
                    profile: { include: { user: { select: { id: true } } } },
                    startup: {
                        include: {
                            members: { where: { role: 'founder' }, include: { profile: { select: { userId: true } } } },
                        },
                    },
                },
            },
        },
    });
}

/**
 * Create message
 */
export async function createMessage(data: {
    threadId: string;
    senderId: string;
    content: string;
}) {
    return db.message.create({
        data: {
            threadId: data.threadId,
            senderId: data.senderId,
            content: data.content,
        },
    });
}

/**
 * Get messages for a thread
 */
export async function getMessages(
    threadId: string,
    cursor: string | undefined,
    limit: number
) {
    const take = limit + 1;

    const messages = await db.message.findMany({
        where: { threadId },
        orderBy: { createdAt: 'desc' },
        take,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
    });

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items: items.reverse(), nextCursor, hasMore };
}

/**
 * Get threads for a user (via applications or join requests)
 */
export async function getThreadsForUser(userId: string, cursor: string | undefined, limit: number) {
    // Get profile ID for students
    const profile = await db.studentProfile.findUnique({
        where: { userId },
        select: { id: true },
    });

    // Get org ID for company users
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { orgId: true, role: true },
    });

    const take = limit + 1;

    // Build where conditions
    const orConditions: object[] = [];

    if (profile) {
        orConditions.push({ application: { profileId: profile.id } });
        orConditions.push({ joinRequest: { profileId: profile.id } });
    }

    if (user?.orgId) {
        orConditions.push({ application: { opportunity: { orgId: user.orgId } } });
    }

    if (orConditions.length === 0) {
        return { items: [], nextCursor: null, hasMore: false };
    }

    const threads = await db.messageThread.findMany({
        where: { OR: orConditions },
        orderBy: { updatedAt: 'desc' },
        take,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
        include: {
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
            },
            application: {
                include: {
                    profile: { select: { firstName: true, lastName: true } },
                    opportunity: { select: { title: true } },
                },
            },
            joinRequest: {
                include: {
                    profile: { select: { firstName: true, lastName: true } },
                    startup: { select: { name: true } },
                },
            },
        },
    });

    const hasMore = threads.length > limit;
    const items = hasMore ? threads.slice(0, limit) : threads;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
}
