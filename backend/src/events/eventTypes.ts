// Event type constants for SQS publishing
export const EventType = {
    // Email events
    EMAIL_OTP_REQUESTED: 'email.otp_requested',
    EMAIL_PASSWORD_RESET_OTP_REQUESTED: 'email.password_reset_otp_requested',

    // Startup events
    STARTUP_SUBMITTED: 'startup.submitted',
    STARTUP_APPROVED: 'startup.approved',
    STARTUP_NEEDS_CHANGES: 'startup.needs_changes',
    STARTUP_REJECTED: 'startup.rejected',

    // Application events
    APPLICATION_SUBMITTED: 'application.submitted',
    APPLICATION_STATUS_CHANGED: 'application.status_changed',

    // Join request events
    JOIN_REQUEST_CREATED: 'join_request.created',
    JOIN_REQUEST_ACCEPTED: 'join_request.accepted',
    JOIN_REQUEST_REJECTED: 'join_request.rejected',

    // Message events
    MESSAGE_NEW: 'message.new',

    // Opportunity events
    OPPORTUNITY_PUBLISHED: 'opportunity.published',
    OPPORTUNITY_CLOSED: 'opportunity.closed',
} as const;

export type EventTypeType = (typeof EventType)[keyof typeof EventType];

// Event payload types
export interface OtpRequestedPayload {
    email: string;
    otp: string; // Plain OTP for sending via email
    purpose: 'signup' | 'password_reset';
    expiresAt: string;
}

export interface StartupEventPayload {
    startupId: string;
    startupName: string;
    founderId: string;
    founderEmail: string;
    feedback?: string;
}

export interface ApplicationEventPayload {
    applicationId: string;
    opportunityId: string;
    opportunityTitle: string;
    applicantId: string;
    applicantEmail: string;
    applicantName: string;
    companyEmail?: string;
    fromStatus?: string;
    toStatus?: string;
}

export interface JoinRequestEventPayload {
    joinRequestId: string;
    startupId: string;
    startupName: string;
    requesterId: string;
    requesterEmail: string;
    requesterName: string;
    founderId: string;
    founderEmail: string;
}

export interface MessageEventPayload {
    messageId: string;
    threadId: string;
    senderId: string;
    senderName: string;
    recipientId: string;
    recipientEmail: string;
    preview: string;
}

export interface OpportunityEventPayload {
    opportunityId: string;
    opportunityTitle: string;
    orgId: string;
    orgName: string;
}

// Union type for all event payloads
export type EventPayload =
    | OtpRequestedPayload
    | StartupEventPayload
    | ApplicationEventPayload
    | JoinRequestEventPayload
    | MessageEventPayload
    | OpportunityEventPayload;
