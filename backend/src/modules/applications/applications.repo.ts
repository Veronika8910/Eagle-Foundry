import { db } from '../../connectors/db.js';

// Using const values that match Prisma enum values
const ApplicationStatusValues = {
    SUBMITTED: 'SUBMITTED',
    SHORTLISTED: 'SHORTLISTED',
    INTERVIEW: 'INTERVIEW',
    SELECTED: 'SELECTED',
    REJECTED: 'REJECTED',
    WITHDRAWN: 'WITHDRAWN',
} as const;

type ApplicationStatusType = (typeof ApplicationStatusValues)[keyof typeof ApplicationStatusValues];

/**
 * Create application
 */
export async function createApplication(data: {
    opportunityId: string;
    profileId: string;
    coverLetter?: string | null;
    resumeUrl?: string | null;
}) {
    return db.application.create({
        data: {
            opportunityId: data.opportunityId,
            profileId: data.profileId,
            coverLetter: data.coverLetter,
            resumeUrl: data.resumeUrl,
            status: 'SUBMITTED',
            statusHistory: {
                create: {
                    toStatus: 'SUBMITTED',
                    changedBy: data.profileId,
                },
            },
        },
        include: {
            opportunity: { select: { id: true, title: true } },
            profile: { select: { id: true, firstName: true, lastName: true } },
        },
    });
}

/**
 * Find application by ID
 */
export async function findById(id: string) {
    return db.application.findUnique({
        where: { id },
        include: {
            opportunity: {
                include: {
                    org: { select: { id: true, name: true } },
                },
            },
            profile: {
                include: {
                    user: { select: { id: true, email: true } },
                },
            },
            statusHistory: {
                orderBy: { createdAt: 'desc' },
            },
        },
    });
}

/**
 * Find existing application
 */
export async function findExistingApplication(opportunityId: string, profileId: string) {
    return db.application.findFirst({
        where: {
            opportunityId,
            profileId,
            status: { not: 'WITHDRAWN' },
        },
    });
}

/**
 * Update application
 */
export async function updateApplication(
    id: string,
    data: {
        status?: ApplicationStatusType;
        threadId?: string;
    }
) {
    return db.application.update({
        where: { id },
        data,
    });
}

/**
 * Add status history entry
 */
export async function addStatusHistory(data: {
    applicationId: string;
    fromStatus: ApplicationStatusType | null;
    toStatus: ApplicationStatusType;
    changedBy: string;
    note?: string | null;
}) {
    return db.applicationStatusHistory.create({ data });
}

/**
 * List applications for a profile
 */
export async function listByProfileId(
    profileId: string,
    cursor: string | undefined,
    limit: number,
    status?: ApplicationStatusType
) {
    const take = limit + 1;

    const applications = await db.application.findMany({
        where: {
            profileId,
            ...(status && { status }),
        },
        orderBy: { createdAt: 'desc' },
        take,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
        include: {
            opportunity: {
                select: { id: true, title: true, status: true },
            },
        },
    });

    const hasMore = applications.length > limit;
    const items = hasMore ? applications.slice(0, limit) : applications;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
}

/**
 * List applications for an opportunity
 */
export async function listByOpportunityId(
    opportunityId: string,
    cursor: string | undefined,
    limit: number,
    status?: ApplicationStatusType
) {
    const take = limit + 1;

    const applications = await db.application.findMany({
        where: {
            opportunityId,
            ...(status && { status }),
        },
        orderBy: { createdAt: 'desc' },
        take,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
        include: {
            profile: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    major: true,
                    skills: true,
                    resumeUrl: true,
                },
            },
        },
    });

    const hasMore = applications.length > limit;
    const items = hasMore ? applications.slice(0, limit) : applications;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
}
