import { StartupStatus, UserStatus, OrgStatus, ReportStatus, Prisma } from '@prisma/client';
import { db } from '../../connectors/db.js';
import { NotFoundError } from '../../middlewares/errorHandler.js';
import { publish } from '../../events/publish.js';
import { buildStartupApprovedEvent, buildStartupRejectedEvent } from '../../events/builders.js';
import {
    ReviewStartupInput,
    UpdateUserStatusInput,
    UpdateOrgStatusInput,
    ListAdminQuery,
} from './admin.validators.js';

/**
 * Get pending startups for review
 */
export async function getPendingStartups(query: ListAdminQuery) {
    const take = query.limit + 1;

    const startups = await db.startup.findMany({
        where: { status: StartupStatus.SUBMITTED },
        orderBy: { createdAt: 'asc' },
        take,
        ...(query.cursor && {
            cursor: { id: query.cursor },
            skip: 1,
        }),
        include: {
            members: {
                where: { role: 'founder' },
                include: {
                    profile: {
                        select: { firstName: true, lastName: true },
                    },
                },
            },
        },
    });

    const hasMore = startups.length > query.limit;
    const items = hasMore ? startups.slice(0, query.limit) : startups;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
}

/**
 * Review a startup
 */
export async function reviewStartup(
    adminUserId: string,
    startupId: string,
    data: ReviewStartupInput
) {
    const startup = await db.startup.findUnique({
        where: { id: startupId },
        include: {
            members: {
                where: { role: 'founder' },
                include: {
                    profile: {
                        include: { user: { select: { id: true, email: true } } },
                    },
                },
            },
        },
    });

    if (!startup) {
        throw new NotFoundError('Startup');
    }

    let newStatus: StartupStatus;
    switch (data.action) {
        case 'APPROVE':
            newStatus = StartupStatus.APPROVED;
            break;
        case 'REJECT':
            newStatus = StartupStatus.ARCHIVED;
            break;
        case 'REQUEST_CHANGES':
            newStatus = StartupStatus.NEEDS_CHANGES;
            break;
    }

    const updated = await db.startup.update({
        where: { id: startupId },
        data: {
            status: newStatus,
            adminFeedback: data.feedback,
        },
    });

    // Create audit log
    await db.auditLog.create({
        data: {
            userId: adminUserId,
            action: `STARTUP_${data.action}`,
            targetType: 'STARTUP',
            targetId: startupId,
            details: { feedback: data.feedback } as Prisma.JsonObject,
        },
    });

    // Publish event
    const founder = startup.members[0]?.profile;
    if (founder) {
        if (data.action === 'APPROVE') {
            const event = buildStartupApprovedEvent(
                startupId,
                startup.name,
                founder.user.id,
                founder.user.email
            );
            await publish(event.type, event.payload);
        } else if (data.action === 'REJECT' || data.action === 'REQUEST_CHANGES') {
            const event = buildStartupRejectedEvent(
                startupId,
                startup.name,
                founder.user.id,
                founder.user.email,
                data.feedback || ''
            );
            await publish(event.type, event.payload);
        }
    }

    return updated;
}

/**
 * List all users (admin only)
 */
export async function listUsers(query: ListAdminQuery) {
    const take = query.limit + 1;

    const users = await db.user.findMany({
        where: query.status ? { status: query.status as UserStatus } : undefined,
        orderBy: { createdAt: 'desc' },
        take,
        ...(query.cursor && {
            cursor: { id: query.cursor },
            skip: 1,
        }),
        select: {
            id: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            studentProfile: { select: { firstName: true, lastName: true } },
            org: { select: { id: true, name: true } },
        },
    });

    const hasMore = users.length > query.limit;
    const items = hasMore ? users.slice(0, query.limit) : users;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
}

/**
 * Update user status
 */
export async function updateUserStatus(
    adminUserId: string,
    userId: string,
    data: UpdateUserStatusInput
) {
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new NotFoundError('User');
    }

    const updated = await db.user.update({
        where: { id: userId },
        data: { status: data.status as UserStatus },
    });

    // Create audit log
    await db.auditLog.create({
        data: {
            userId: adminUserId,
            action: `USER_${data.status}`,
            targetType: 'USER',
            targetId: userId,
            details: { reason: data.reason } as Prisma.JsonObject,
        },
    });

    return updated;
}

/**
 * List all orgs (admin only)
 */
export async function listOrgs(query: ListAdminQuery) {
    const take = query.limit + 1;

    const orgs = await db.org.findMany({
        where: query.status ? { status: query.status as OrgStatus } : undefined,
        orderBy: { createdAt: 'desc' },
        take,
        ...(query.cursor && {
            cursor: { id: query.cursor },
            skip: 1,
        }),
        include: {
            _count: { select: { members: true, opportunities: true } },
        },
    });

    const hasMore = orgs.length > query.limit;
    const items = hasMore ? orgs.slice(0, query.limit) : orgs;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
}

/**
 * Update org status
 */
export async function updateOrgStatus(
    adminUserId: string,
    orgId: string,
    data: UpdateOrgStatusInput
) {
    const org = await db.org.findUnique({ where: { id: orgId } });

    if (!org) {
        throw new NotFoundError('Organization');
    }

    const updated = await db.org.update({
        where: { id: orgId },
        data: { status: data.status as OrgStatus },
    });

    // If suspending, also suspend all members
    if (data.status === 'SUSPENDED') {
        await db.user.updateMany({
            where: { orgId },
            data: { status: UserStatus.SUSPENDED },
        });
    }

    // Create audit log
    await db.auditLog.create({
        data: {
            userId: adminUserId,
            action: `ORG_${data.status}`,
            targetType: 'ORG',
            targetId: orgId,
            details: { reason: data.reason } as Prisma.JsonObject,
        },
    });

    return updated;
}

/**
 * Get dashboard stats
 */
export async function getDashboardStats() {
    const [
        totalUsers,
        activeUsers,
        pendingUsers,
        totalOrgs,
        activeOrgs,
        totalStartups,
        approvedStartups,
        pendingStartups,
        totalOpportunities,
        publishedOpportunities,
        totalApplications,
        pendingReports,
    ] = await Promise.all([
        db.user.count(),
        db.user.count({ where: { status: UserStatus.ACTIVE } }),
        db.user.count({ where: { status: UserStatus.PENDING_OTP } }),
        db.org.count(),
        db.org.count({ where: { status: OrgStatus.ACTIVE } }),
        db.startup.count(),
        db.startup.count({ where: { status: StartupStatus.APPROVED } }),
        db.startup.count({ where: { status: StartupStatus.SUBMITTED } }),
        db.opportunity.count(),
        db.opportunity.count({ where: { status: 'PUBLISHED' } }),
        db.application.count(),
        db.report.count({ where: { status: ReportStatus.PENDING } }),
    ]);

    return {
        users: { total: totalUsers, active: activeUsers, pending: pendingUsers },
        orgs: { total: totalOrgs, active: activeOrgs },
        startups: { total: totalStartups, approved: approvedStartups, pending: pendingStartups },
        opportunities: { total: totalOpportunities, published: publishedOpportunities },
        applications: { total: totalApplications },
        reports: { pending: pendingReports },
    };
}

/**
 * Get audit logs
 */
export async function getAuditLogs(query: ListAdminQuery) {
    const take = query.limit + 1;

    const logs = await db.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take,
        ...(query.cursor && {
            cursor: { id: query.cursor },
            skip: 1,
        }),
    });

    const hasMore = logs.length > query.limit;
    const items = hasMore ? logs.slice(0, query.limit) : logs;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
}
