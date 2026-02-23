export type UserRole = 'STUDENT' | 'COMPANY_ADMIN' | 'COMPANY_MEMBER' | 'UNIVERSITY_ADMIN';
export type UserStatus = 'PENDING_OTP' | 'ACTIVE' | 'SUSPENDED';
export type OrgStatus = 'PENDING_OTP' | 'ACTIVE' | 'SUSPENDED';
export type StartupStatus = 'DRAFT' | 'SUBMITTED' | 'NEEDS_CHANGES' | 'APPROVED' | 'ARCHIVED' | 'REJECTED';
export type OpportunityStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type ApplicationStatus = 'SUBMITTED' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN';
export type JoinRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
export type ReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';
export type BudgetType = 'paid' | 'unpaid' | 'equity';
export type FileContext = 'startup_logo' | 'startup_media' | 'resume' | 'portfolio' | 'opportunity' | 'org_logo' | 'application' | 'message';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  orgId: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  major: string | null;
  gradYear: number | null;
  bio: string | null;
  skills: string[];
  resumeUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  id: string;
  profileId: string;
  title: string;
  description: string | null;
  url: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Org {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  status: OrgStatus;
  isVerifiedBadge: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Startup {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  stage: string | null;
  tags: string[];
  logoUrl: string | null;
  status: StartupStatus;
  adminFeedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StartupMember {
  id: string;
  startupId: string;
  profileId: string;
  role: 'founder' | 'member';
  joinedAt: string;
  profile?: StudentProfile;
}

export interface JoinRequest {
  id: string;
  startupId: string;
  profileId: string;
  message: string | null;
  formAnswers?: Record<string, string>;
  status: JoinRequestStatus;
  threadId: string | null;
  createdAt: string;
  updatedAt: string;
  profile?: StudentProfile;
  startup?: Startup;
}

export interface Opportunity {
  id: string;
  orgId: string;
  title: string;
  description: string | null;
  requirements: string | null;
  budgetType: BudgetType | null;
  budgetRange: string | null;
  tags: string[];
  status: OpportunityStatus;
  publishedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  org?: Org;
}

export interface Application {
  id: string;
  opportunityId: string;
  profileId: string;
  coverLetter: string | null;
  resumeUrl: string | null;
  formAnswers?: Record<string, string>;
  status: ApplicationStatus;
  threadId: string | null;
  createdAt: string;
  updatedAt: string;
  opportunity?: Opportunity;
  profile?: StudentProfile;
  statusHistory?: ApplicationStatusHistoryEntry[];
}

export interface ApplicationStatusHistoryEntry {
  id: string;
  applicationId: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  changedBy: string;
  note: string | null;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  createdAt: string;
  updatedAt: string;
  joinRequest?: JoinRequest;
  application?: Application;
  messages?: Message[];
  lastMessage?: Message;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'startup' | 'opportunity' | 'user' | 'message';
  targetId: string;
  reporterReason: string;
  status: ReportStatus;
  resolution: string | null;
  adminNotes: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface FileRecord {
  id: string;
  s3Key: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  context: string;
  contextId: string;
  uploadedBy: string;
  createdAt: string;
}

// ----- Request payloads -----

export interface StudentSignupPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CompanySignupPayload {
  email: string;
  password: string;
  companyName: string;
  firstName: string;
  lastName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface UpdateStudentProfilePayload {
  firstName?: string;
  lastName?: string;
  major?: string | null;
  gradYear?: number | null;
  bio?: string | null;
  skills?: string[];
  linkedinUrl?: string | null;
  githubUrl?: string | null;
}

export interface CreatePortfolioItemPayload {
  title: string;
  description?: string | null;
  url?: string | null;
  imageUrl?: string | null;
}

export interface UpdatePortfolioItemPayload extends Partial<CreatePortfolioItemPayload> { }

export interface CreateStartupPayload {
  name: string;
  tagline?: string | null;
  description?: string | null;
  stage?: string | null;
  tags?: string[];
  logoUrl?: string | null;
}

export interface UpdateStartupPayload extends Partial<CreateStartupPayload> { }

export interface CreateOpportunityPayload {
  title: string;
  description?: string | null;
  requirements?: string | null;
  budgetType?: BudgetType | null;
  budgetRange?: string | null;
  tags?: string[];
}

export interface UpdateOpportunityPayload extends Partial<CreateOpportunityPayload> { }

export interface CreateApplicationPayload {
  coverLetter?: string | null;
  resumeUrl?: string | null;
}

export interface UpdateApplicationStatusPayload {
  status: 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';
  note?: string | null;
}

export interface CreateJoinRequestPayload {
  message?: string | null;
}

export interface UpdateJoinRequestPayload {
  status: 'ACCEPTED' | 'REJECTED';
}

export interface SendMessagePayload {
  content: string;
}

export interface UpdateOrgPayload {
  name?: string;
  description?: string | null;
  website?: string | null;
  logoUrl?: string | null;
}

export interface AddOrgMemberPayload {
  email: string;
  role: 'COMPANY_ADMIN' | 'COMPANY_MEMBER';
}

export interface PresignUploadPayload {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  context: FileContext;
  contextId: string;
}

export interface PresignResumePayload {
  filename: string;
  mimeType: 'application/pdf';
  sizeBytes: number;
}

export interface CreateReportPayload {
  targetType: 'startup' | 'opportunity' | 'user' | 'message';
  targetId: string;
  reporterReason: string;
}

export interface ReviewStartupPayload {
  decision: 'APPROVED' | 'NEEDS_CHANGES' | 'REJECTED';
  feedback?: string | null;
}

export interface UpdateUserStatusPayload {
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface UpdateOrgStatusPayload {
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface ResolveReportPayload {
  resolution: 'RESOLVED' | 'DISMISSED';
  adminNotes?: string | null;
}

// ----- Response wrappers -----

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn?: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn?: string;
}

export interface PresignResponse {
  uploadUrl: string;
  key: string;
  confirmToken: string;
  expiresAt: string;
}

export interface AdminDashboardStats {
  activeUsers: number;
  organizations: number;
  pendingStartups: number;
  openReports: number;
}

export interface SearchResult {
  type: 'startup' | 'opportunity' | 'student' | 'organization';
  id: string;
  title: string;
  subtitle: string | null;
}
