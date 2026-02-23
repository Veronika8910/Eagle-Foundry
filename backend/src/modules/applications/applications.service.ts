import { ApplicationStatus, OpportunityStatus, OrgStatus } from '@prisma/client';
import { db } from '../../connectors/db.js';
import * as applicationsRepo from './applications.repo.js';
import * as opportunitiesRepo from '../opportunities/opportunities.repo.js';
import { AppError, NotFoundError, ForbiddenError } from '../../middlewares/errorHandler.js';
import { ErrorCode } from '../../utils/response.js';
import { publish } from '../../events/publish.js';
import { buildApplicationSubmittedEvent, buildApplicationStatusChangedEvent } from '../../events/builders.js';
import { CreateApplicationInput, UpdateApplicationStatusInput, ListApplicationsQuery } from './applications.validators.js';

/**
 * Create application (student only)
 */
export async function createApplication(
    userId: string,
    opportunityId: string,
    data: CreateApplicationInput
) {
    const profile = await db.studentProfile.findUnique({
        where: { userId },
        include: { user: { select: { email: true } } },
    });

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    const opportunity = await opportunitiesRepo.findById(opportunityId);

    if (!opportunity) {
        throw new NotFoundError('Opportunity');
    }

    if (opportunity.status !== OpportunityStatus.PUBLISHED) {
        throw new AppError(ErrorCode.CONFLICT, 'Opportunity is not accepting applications', 400);
    }

    if (opportunity.org.status !== OrgStatus.ACTIVE) {
        throw new AppError(ErrorCode.CONFLICT, 'Organization is not active', 400);
    }

    // Check for existing application
    const existing = await applicationsRepo.findExistingApplication(opportunityId, profile.id);
    if (existing) {
        throw new AppError(ErrorCode.CONFLICT, 'You have already applied to this opportunity', 409);
    }

    let coverLetter = data.coverLetter;
    let resumeUrl = data.resumeUrl;
    let sanitizedFormAnswers: Record<string, unknown> | undefined;

    if (data.formAnswers && typeof data.formAnswers === 'object') {
        const { coverLetter: faCover, resumeUrl: faResume, ...rest } = data.formAnswers;
        if (!coverLetter && faCover) coverLetter = faCover;
        if (!resumeUrl && faResume) resumeUrl = faResume;
        sanitizedFormAnswers = rest;
    }

    const application = await applicationsRepo.createApplication({
        opportunityId,
        profileId: profile.id,
        coverLetter,
        resumeUrl,
        formAnswers: sanitizedFormAnswers,
    });

    // Publish event
    const event = buildApplicationSubmittedEvent(
        application.id,
        opportunityId,
        opportunity.title,
        profile.userId,
        profile.user.email,
        `${profile.firstName} ${profile.lastName}`,
        '' // Company email would need to be fetched
    );
    await publish(event.type, event.payload);

    return application;
}

/**
 * Get my applications
 */
export async function getMyApplications(userId: string, query: ListApplicationsQuery) {
    const profile = await db.studentProfile.findUnique({
        where: { userId },
        select: { id: true },
    });

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    return applicationsRepo.listByProfileId(
        profile.id,
        query.cursor,
        query.limit,
        query.status as ApplicationStatus | undefined
    );
}

/**
 * Withdraw application
 */
export async function withdrawApplication(userId: string, applicationId: string) {
    const profile = await db.studentProfile.findUnique({
        where: { userId },
        select: { id: true },
    });

    if (!profile) {
        throw new NotFoundError('Student profile');
    }

    const application = await applicationsRepo.findById(applicationId);

    if (!application) {
        throw new NotFoundError('Application');
    }

    if (application.profileId !== profile.id) {
        throw new ForbiddenError('Not your application');
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
        throw new AppError(ErrorCode.CONFLICT, 'Application already withdrawn', 400);
    }

    await applicationsRepo.addStatusHistory({
        applicationId,
        fromStatus: application.status,
        toStatus: ApplicationStatus.WITHDRAWN,
        changedBy: userId,
    });

    return applicationsRepo.updateApplication(applicationId, {
        status: ApplicationStatus.WITHDRAWN,
    });
}

/**
 * Get applications for an opportunity (company member)
 */
export async function getOpportunityApplications(
    orgId: string,
    opportunityId: string,
    query: ListApplicationsQuery
) {
    const opportunity = await opportunitiesRepo.findById(opportunityId);

    if (!opportunity) {
        throw new NotFoundError('Opportunity');
    }

    if (opportunity.orgId !== orgId) {
        throw new ForbiddenError('Access denied');
    }

    return applicationsRepo.listByOpportunityId(
        opportunityId,
        query.cursor,
        query.limit,
        query.status as ApplicationStatus | undefined
    );
}

/**
 * Get application by ID (company member)
 */
export async function getApplicationById(orgId: string, applicationId: string) {
    const application = await applicationsRepo.findById(applicationId);

    if (!application) {
        throw new NotFoundError('Application');
    }

    if (application.opportunity.orgId !== orgId) {
        throw new ForbiddenError('Access denied');
    }

    return application;
}

/**
 * Update application status (company admin)
 */
export async function updateApplicationStatus(
    userId: string,
    orgId: string,
    applicationId: string,
    data: UpdateApplicationStatusInput
) {
    const application = await applicationsRepo.findById(applicationId);

    if (!application) {
        throw new NotFoundError('Application');
    }

    if (application.opportunity.orgId !== orgId) {
        throw new ForbiddenError('Access denied');
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
        throw new AppError(ErrorCode.CONFLICT, 'Cannot update withdrawn applications', 400);
    }

    const newStatus = data.status as ApplicationStatus;

    // Create thread if accepting/shortlisting and no thread exists
    let threadId = application.threadId;
    if (!threadId && (newStatus === ApplicationStatus.SHORTLISTED || newStatus === ApplicationStatus.SELECTED)) {
        const thread = await db.messageThread.create({ data: {} });
        threadId = thread.id;
    }

    // Add status history
    await applicationsRepo.addStatusHistory({
        applicationId,
        fromStatus: application.status,
        toStatus: newStatus,
        changedBy: userId,
        note: data.note,
    });

    const updated = await applicationsRepo.updateApplication(applicationId, {
        status: newStatus,
        ...(threadId && { threadId }),
    });

    // Publish event
    const event = buildApplicationStatusChangedEvent(
        applicationId,
        application.opportunity.id,
        application.opportunity.title,
        application.profile.userId,
        application.profile.user.email,
        `${application.profile.firstName} ${application.profile.lastName}`,
        application.status,
        newStatus
    );
    await publish(event.type, event.payload);

    return updated;
}
