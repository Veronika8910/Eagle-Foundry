import { db } from '../../connectors/db.js';

export interface OrgData {
    id: string;
    name: string;
    description: string | null;
    website: string | null;
    logoUrl: string | null;
    status: string;
    isVerifiedBadge: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrgMemberData {
    id: string;
    email: string;
    role: string;
    createdAt: Date;
}

/**
 * Find org by ID
 */
export async function findById(id: string): Promise<OrgData | null> {
    return db.org.findUnique({ where: { id } });
}

/**
 * Find org with members
 */
export async function findByIdWithMembers(id: string) {
    return db.org.findUnique({
        where: { id },
        include: {
            members: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
            },
        },
    });
}

/**
 * Update org
 */
export async function updateOrg(
    id: string,
    data: Partial<Omit<OrgData, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<OrgData> {
    return db.org.update({
        where: { id },
        data: data as any,
    });
}

/**
 * List active orgs with pagination
 */
export async function listActiveOrgs(
    cursor: string | undefined,
    limit: number,
    search?: string
) {
    const take = limit + 1;

    const where = {
        status: 'ACTIVE' as const,
        ...(search && {
            name: { contains: search, mode: 'insensitive' as const },
        }),
    };

    const orgs = await db.org.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
        select: {
            id: true,
            name: true,
            description: true,
            website: true,
            logoUrl: true,
            isVerifiedBadge: true,
            createdAt: true,
        },
    });

    const hasMore = orgs.length > limit;
    const items = hasMore ? orgs.slice(0, limit) : orgs;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
}

/**
 * Get org members
 */
export async function getMembers(orgId: string): Promise<OrgMemberData[]> {
    return db.user.findMany({
        where: { orgId },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
}

/**
 * Add member to org
 */
export async function addMember(
    orgId: string,
    userId: string,
    role: 'COMPANY_ADMIN' | 'COMPANY_MEMBER'
): Promise<void> {
    await db.user.update({
        where: { id: userId },
        data: { orgId, role },
    });
}

/**
 * Remove member from org
 */
export async function removeMember(userId: string): Promise<void> {
    await db.user.update({
        where: { id: userId },
        data: { orgId: null, role: 'COMPANY_MEMBER' },
    });
}

/**
 * Count members in org
 */
export async function countMembers(orgId: string): Promise<number> {
    return db.user.count({ where: { orgId } });
}

/**
 * Count admins in org
 */
export async function countAdmins(orgId: string): Promise<number> {
    return db.user.count({
        where: { orgId, role: 'COMPANY_ADMIN' },
    });
}
