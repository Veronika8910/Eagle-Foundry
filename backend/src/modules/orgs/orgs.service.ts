import { UserRole, UserStatus, OrgStatus } from '@prisma/client';
import { db } from '../../connectors/db.js';
import * as orgsRepo from './orgs.repo.js';
import { AppError, NotFoundError, ForbiddenError } from '../../middlewares/errorHandler.js';
import { ErrorCode } from '../../utils/response.js';
import { hashPassword } from '../../utils/security.js';
import { isValidCompanyEmail, normalizeEmail } from '../../utils/emailRules.js';
import { UpdateOrgInput, AddMemberInput, ListOrgsQuery } from './orgs.validators.js';

/**
 * Get current user's org
 */
export async function getMyOrg(orgId: string) {
    const org = await orgsRepo.findById(orgId);

    if (!org) {
        throw new NotFoundError('Organization');
    }

    return org;
}

/**
 * Update current user's org
 */
export async function updateMyOrg(orgId: string, data: UpdateOrgInput) {
    const org = await orgsRepo.findById(orgId);

    if (!org) {
        throw new NotFoundError('Organization');
    }

    return orgsRepo.updateOrg(orgId, data);
}

/**
 * Get org members
 */
export async function getMembers(orgId: string) {
    const org = await orgsRepo.findById(orgId);

    if (!org) {
        throw new NotFoundError('Organization');
    }

    return orgsRepo.getMembers(orgId);
}

/**
 * Add member to org (admin only)
 */
export async function addMember(orgId: string, _inviterId: string, data: AddMemberInput) {
    const org = await orgsRepo.findById(orgId);

    if (!org) {
        throw new NotFoundError('Organization');
    }

    if (org.status !== OrgStatus.ACTIVE) {
        throw new AppError(ErrorCode.ORG_SUSPENDED, 'Organization is not active', 403);
    }

    const email = normalizeEmail(data.email);

    // Validate company email
    if (!isValidCompanyEmail(email)) {
        throw new AppError(
            ErrorCode.BLOCKED_EMAIL_DOMAIN,
            'Please use a company email address',
            400
        );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) {
        if (existingUser.orgId) {
            throw new AppError(ErrorCode.CONFLICT, 'User is already part of an organization', 409);
        }

        // Add existing user to org
        await orgsRepo.addMember(orgId, existingUser.id, data.role as 'COMPANY_ADMIN' | 'COMPANY_MEMBER');

        return { userId: existingUser.id, invited: false };
    }

    // Create new user with temporary password (they'll need to reset)
    const tempPassword = await hashPassword(crypto.randomUUID());

    const newUser = await db.user.create({
        data: {
            email,
            passwordHash: tempPassword,
            role: data.role as UserRole,
            status: UserStatus.PENDING_OTP,
            orgId,
        },
    });

    // TODO: Send invitation email via SQS event

    return { userId: newUser.id, invited: true };
}

/**
 * Remove member from org (admin only)
 */
export async function removeMember(orgId: string, removerId: string, memberId: string) {
    const org = await orgsRepo.findById(orgId);

    if (!org) {
        throw new NotFoundError('Organization');
    }

    // Can't remove yourself
    if (memberId === removerId) {
        throw new AppError(ErrorCode.CONFLICT, 'Cannot remove yourself', 400);
    }

    // Find the member
    const member = await db.user.findUnique({ where: { id: memberId } });

    if (!member) {
        throw new NotFoundError('Member');
    }

    if (member.orgId !== orgId) {
        throw new ForbiddenError('Member is not part of your organization');
    }

    // Check if this is the last admin
    if (member.role === UserRole.COMPANY_ADMIN) {
        const adminCount = await orgsRepo.countAdmins(orgId);
        if (adminCount <= 1) {
            throw new AppError(
                ErrorCode.CONFLICT,
                'Cannot remove the last admin. Transfer admin rights first.',
                400
            );
        }
    }

    await orgsRepo.removeMember(memberId);
}

/**
 * List active orgs (public)
 */
export async function listActiveOrgs(query: ListOrgsQuery) {
    return orgsRepo.listActiveOrgs(query.cursor, query.limit, query.search);
}

/**
 * Get org by ID (public profile)
 */
export async function getOrgById(orgId: string) {
    const org = await orgsRepo.findById(orgId);

    if (!org) {
        throw new NotFoundError('Organization');
    }

    if (org.status !== OrgStatus.ACTIVE) {
        throw new NotFoundError('Organization');
    }

    // Return limited public fields
    return {
        id: org.id,
        name: org.name,
        description: org.description,
        website: org.website,
        logoUrl: org.logoUrl,
        isVerifiedBadge: org.isVerifiedBadge,
    };
}
