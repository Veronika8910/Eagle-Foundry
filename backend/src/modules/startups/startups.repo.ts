import { db } from '../../connectors/db.js';
import { StartupMemberRole } from '../../config/constants.js';

export interface StartupData {
    id: string;
    name: string;
    tagline: string | null;
    description: string | null;
    stage: string | null;
    tags: string[];
    logoUrl: string | null;
    status: string;
    adminFeedback: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface StartupMemberData {
    id: string;
    profileId: string;
    role: string;
    joinedAt: Date;
    profile: {
        id: string;
        firstName: string;
        lastName: string;
        userId: string;
    };
}

type StartupStatus = 'DRAFT' | 'SUBMITTED' | 'NEEDS_CHANGES' | 'APPROVED' | 'ARCHIVED';

/**
 * Find startup by ID
 */
export async function findById(id: string): Promise<StartupData | null> {
    return db.startup.findUnique({ where: { id } });
}

/**
 * Find startup with members
 */
export async function findByIdWithMembers(id: string) {
    return db.startup.findUnique({
        where: { id },
        include: {
            members: {
                include: {
                    profile: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            userId: true,
                        },
                    },
                },
            },
        },
    });
}

/**
 * Create startup with founder
 */
export async function createStartup(
    data: Omit<StartupData, 'id' | 'status' | 'adminFeedback' | 'createdAt' | 'updatedAt'>,
    founderProfileId: string
) {
    return db.startup.create({
        data: {
            ...data,
            status: 'DRAFT',
            members: {
                create: {
                    profileId: founderProfileId,
                    role: StartupMemberRole.FOUNDER,
                },
            },
        },
        include: {
            members: {
                include: {
                    profile: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            userId: true,
                        },
                    },
                },
            },
        },
    });
}

/**
 * Update startup
 */
export async function updateStartup(
    id: string,
    data: Partial<Omit<StartupData, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<StartupData> {
    return db.startup.update({
        where: { id },
        data: data as any,
    });
}

/**
 * List startups with filters
 */
export async function listStartups(options: {
    cursor?: string;
    limit: number;
    status?: StartupStatus | StartupStatus[];
    tags?: string[];
    stage?: string;
    search?: string;
    profileId?: string;
}) {
    const take = options.limit + 1;

    const statusFilter = Array.isArray(options.status)
        ? { in: options.status }
        : options.status;

    // Build where condition
    const where: Record<string, unknown> = {
        ...(statusFilter && { status: statusFilter }),
        ...(options.tags?.length && { tags: { hasSome: options.tags } }),
        ...(options.stage && { stage: options.stage }),
        ...(options.search && {
            OR: [
                { name: { contains: options.search, mode: 'insensitive' } },
                { tagline: { contains: options.search, mode: 'insensitive' } },
            ],
        }),
    };

    // If profileId is provided, include their own startups regardless of status
    if (options.profileId) {
        const membershipWhere = {
            members: {
                some: { profileId: options.profileId },
            },
        };

        const combinedWhere = {
            OR: [where, membershipWhere],
        };

        const startups = await db.startup.findMany({
            where: combinedWhere,
            orderBy: { createdAt: 'desc' },
            take,
            ...(options.cursor && {
                cursor: { id: options.cursor },
                skip: 1,
            }),
            include: {
                members: {
                    where: { role: StartupMemberRole.FOUNDER },
                    include: {
                        profile: {
                            select: { firstName: true, lastName: true },
                        },
                    },
                },
                _count: { select: { members: true } },
            },
        });

        const hasMore = startups.length > options.limit;
        const items = hasMore ? startups.slice(0, options.limit) : startups;
        const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

        return { items, nextCursor, hasMore };
    }

    const startups = await db.startup.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        ...(options.cursor && {
            cursor: { id: options.cursor },
            skip: 1,
        }),
        include: {
            members: {
                where: { role: StartupMemberRole.FOUNDER },
                include: {
                    profile: {
                        select: { firstName: true, lastName: true },
                    },
                },
            },
            _count: { select: { members: true } },
        },
    });

    const hasMore = startups.length > options.limit;
    const items = hasMore ? startups.slice(0, options.limit) : startups;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
}

/**
 * Get startup team members
 */
export async function getTeamMembers(startupId: string): Promise<StartupMemberData[]> {
    return db.startupMember.findMany({
        where: { startupId },
        include: {
            profile: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    userId: true,
                },
            },
        },
        orderBy: [
            { role: 'asc' },
            { joinedAt: 'asc' },
        ],
    });
}

/**
 * Check if user is a founder of startup
 */
export async function isFounder(startupId: string, profileId: string): Promise<boolean> {
    const membership = await db.startupMember.findFirst({
        where: {
            startupId,
            profileId,
            role: StartupMemberRole.FOUNDER,
        },
    });
    return !!membership;
}

/**
 * Check if user is a member of startup
 */
export async function isMember(startupId: string, profileId: string): Promise<boolean> {
    const membership = await db.startupMember.findFirst({
        where: {
            startupId,
            profileId,
        },
    });
    return !!membership;
}

/**
 * Add member to startup
 */
export async function addMember(
    startupId: string,
    profileId: string,
    role: string = StartupMemberRole.MEMBER
): Promise<void> {
    await db.startupMember.create({
        data: {
            startupId,
            profileId,
            role,
        },
    });
}
