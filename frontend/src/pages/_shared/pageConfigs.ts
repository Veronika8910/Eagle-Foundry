import type { PageConfig } from '@/pages/_shared/types';

const auth = (config: Omit<PageConfig, 'kind'>): PageConfig => ({ kind: 'auth', ...config });
const ws = (config: Omit<PageConfig, 'kind'>): PageConfig => ({ kind: 'workspace', ...config });
const system = (config: Omit<PageConfig, 'kind'>): PageConfig => ({ kind: 'system', ...config });
const role = (config: Omit<PageConfig, 'kind'>): PageConfig => ({ kind: 'role', ...config });

export const pageConfigs = {
  signupRole: role({
    eyebrow: '01-Public-Auth',
    title: 'Choose your role',
    subtitle: 'Start as a student builder, company partner, or university admin.',
    tags: ['Student', 'Company', 'University Admin'],
    links: [
      { label: 'Already have an account', to: '/login' },
      { label: 'Back to landing', to: '/' },
    ],
    ctaPrimary: 'Continue as Student',
    ctaPrimaryTo: '/sign-up/student',
    ctaSecondary: 'Continue as Company',
    ctaSecondaryTo: '/sign-up/company',
  }),

  studentSignup: auth({
    eyebrow: '01-Public-Auth',
    title: 'Student sign up',
    subtitle: 'Create your student account to launch startups and join teams.',
    fields: ['First name', 'Last name', 'University email', 'Password'],
    links: [
      { label: 'I already have an account', to: '/login' },
      { label: 'Choose a different role', to: '/sign-up' },
    ],
    ctaPrimary: 'Create account',
    ctaPrimaryTo: '/verify-otp',
    ctaSecondary: 'Back',
    ctaSecondaryTo: '/sign-up',
  }),

  companySignup: auth({
    eyebrow: '01-Public-Auth',
    title: 'Company sign up',
    subtitle: 'Create an organization account and start posting opportunities.',
    fields: ['Company name', 'Work email', 'Admin name', 'Password'],
    links: [
      { label: 'I already have an account', to: '/login' },
      { label: 'Choose a different role', to: '/sign-up' },
    ],
    ctaPrimary: 'Create account',
    ctaPrimaryTo: '/verify-otp',
    ctaSecondary: 'Back',
    ctaSecondaryTo: '/sign-up',
  }),

  verifyOtp: auth({
    eyebrow: '01-Public-Auth',
    title: 'Verify email',
    subtitle: 'Enter the one-time code sent to your inbox.',
    fields: ['OTP code'],
    links: [
      { label: 'Change email', to: '/sign-up' },
      { label: 'Need help signing in', to: '/forgot-password' },
    ],
    ctaPrimary: 'Verify',
    ctaPrimaryTo: '/login',
    ctaSecondary: 'Back to login',
    ctaSecondaryTo: '/login',
  }),

  login: auth({
    eyebrow: '01-Public-Auth',
    title: 'Welcome back',
    subtitle: 'Sign in to continue on Eagle-Foundry.',
    tabs: ['Student', 'Company', 'Admin'],
    fields: ['Email', 'Password'],
    links: [
      { label: 'Forgot password', to: '/forgot-password' },
      { label: 'Create account', to: '/sign-up' },
      { label: 'Continue as Student', to: '/student/dashboard' },
      { label: 'Continue as Company', to: '/company/org' },
      { label: 'Continue as Admin', to: '/admin' },
    ],
    ctaPrimary: 'Sign in',
    ctaPrimaryTo: '/student/dashboard',
    ctaSecondary: 'Create account',
    ctaSecondaryTo: '/sign-up',
  }),

  forgotPassword: auth({
    eyebrow: '01-Public-Auth',
    title: 'Forgot password',
    subtitle: 'Request a reset code and continue securely.',
    fields: ['Email'],
    links: [{ label: 'Back to login', to: '/login' }],
    ctaPrimary: 'Send reset code',
    ctaPrimaryTo: '/reset-password',
    ctaSecondary: 'Cancel',
    ctaSecondaryTo: '/login',
  }),

  resetPassword: auth({
    eyebrow: '01-Public-Auth',
    title: 'Reset password',
    subtitle: 'Use your reset code and set a new password.',
    fields: ['Email', 'Reset code', 'New password'],
    links: [{ label: 'Back to login', to: '/login' }],
    ctaPrimary: 'Update password',
    ctaPrimaryTo: '/login',
    ctaSecondary: 'Cancel',
    ctaSecondaryTo: '/login',
  }),

  startupsDiscovery: ws({
    eyebrow: 'Discovery',
    title: 'Startup discovery',
    subtitle: 'Explore student startups by stage, focus, and team needs.',
    filters: ['Search', 'Stage', 'Status'],
    table: {
      columns: ['Startup', 'Founder', 'Stage', 'Status'],
      rows: [
        ['CampusPay', 'A. Patel', 'MVP', 'Approved'],
        ['SkillForge', 'P. Nair', 'Prototype', 'Submitted'],
        ['DormLens', 'J. Ellis', 'Early', 'Needs changes'],
      ],
    },
    rail: {
      title: 'Next steps',
      lines: ['Open startup details', 'Request to join', 'Contact founder'],
      actions: [
        { label: 'Open startup', to: '/startups/detail' },
        { label: 'My join requests', to: '/student/join-requests' },
      ],
    },
    ctaPrimary: 'Open details',
    ctaPrimaryTo: '/startups/detail',
    ctaSecondary: 'View opportunities',
    ctaSecondaryTo: '/opportunities',
  }),

  startupDetail: ws({
    eyebrow: 'Discovery',
    title: 'Startup detail',
    subtitle: 'Overview, team, and collaboration details in one place.',
    tabs: ['Overview', 'Team', 'Join requests'],
    metrics: ['Members 4', 'Open requests 7', 'Status Approved'],
    table: {
      columns: ['Member', 'Role', 'Joined', 'State'],
      rows: [
        ['A. Chen', 'Founder', 'Dec 2025', 'Active'],
        ['R. Malik', 'Product', 'Jan 2026', 'Active'],
        ['J. Ellis', 'Design', 'Feb 2026', 'Active'],
      ],
    },
    ctaPrimary: 'Team workspace',
    ctaPrimaryTo: '/student/startups/team',
    ctaSecondary: 'Join requests',
    ctaSecondaryTo: '/student/startups/join-requests',
  }),

  opportunitiesDiscovery: ws({
    eyebrow: 'Discovery',
    title: 'Opportunity discovery',
    subtitle: 'Browse company opportunities and match by skill and budget.',
    filters: ['Search', 'Budget', 'Type'],
    table: {
      columns: ['Opportunity', 'Organization', 'Budget', 'Applications'],
      rows: [
        ['Backend Engineer Intern', 'Acme Robotics', 'Paid', '32'],
        ['Product Design Fellowship', 'Nova Health', 'Equity', '14'],
        ['Growth Analyst Sprint', 'Riverline', 'Paid', '22'],
      ],
    },
    ctaPrimary: 'Open opportunity',
    ctaPrimaryTo: '/opportunities/detail',
    ctaSecondary: 'My applications',
    ctaSecondaryTo: '/student/applications',
  }),

  opportunityDetail: ws({
    eyebrow: 'Discovery',
    title: 'Opportunity detail',
    subtitle: 'Review scope, requirements, and apply.',
    tabs: ['Overview', 'Requirements', 'Apply'],
    fields: ['Cover letter', 'Resume URL'],
    ctaPrimary: 'Submit application',
    ctaPrimaryTo: '/student/applications',
    ctaSecondary: 'Message company',
    ctaSecondaryTo: '/messages/thread',
  }),

  organizationsDiscovery: ws({
    eyebrow: 'Discovery',
    title: 'Organization discovery',
    subtitle: 'Explore companies and partners active on Eagle-Foundry.',
    filters: ['Search', 'Industry', 'Activity'],
    table: {
      columns: ['Organization', 'Focus', 'Members', 'Status'],
      rows: [
        ['CloudSparq', 'SaaS', '14', 'Active'],
        ['Aurora Labs', 'Robotics', '9', 'Active'],
        ['Riverline Ventures', 'Investment', '6', 'Active'],
      ],
    },
    ctaPrimary: 'Open organization',
    ctaPrimaryTo: '/organizations/detail',
    ctaSecondary: 'Open opportunities',
    ctaSecondaryTo: '/opportunities',
  }),

  organizationDetail: ws({
    eyebrow: 'Discovery',
    title: 'Organization detail',
    subtitle: 'View profile, open opportunities, and contact paths.',
    metrics: ['Open opportunities 17', 'Applications 246', 'Members 14'],
    table: {
      columns: ['Opportunity', 'Budget', 'Posted', 'Applicants'],
      rows: [
        ['Growth Analytics Build', 'Paid', '2d ago', '18'],
        ['Founding Engineer Search', 'Equity', '4d ago', '27'],
        ['UX Research Sprint', 'Paid', '1w ago', '12'],
      ],
    },
    ctaPrimary: 'Company opportunities',
    ctaPrimaryTo: '/company/opportunities',
    ctaSecondary: 'Message organization',
    ctaSecondaryTo: '/messages/thread',
  }),

  studentPublicProfile: ws({
    eyebrow: 'Discovery',
    title: 'Student public profile',
    subtitle: 'Review student profile, portfolio, and startup work.',
    tabs: ['Overview', 'Portfolio', 'Startups'],
    table: {
      columns: ['Project', 'Type', 'Updated', 'View'],
      rows: [
        ['CampusPay MVP', 'Startup', 'Mar 2026', 'Open'],
        ['DormLens Study', 'Research', 'Feb 2026', 'Open'],
        ['Growth Dashboard', 'Analytics', 'Jan 2026', 'Open'],
      ],
    },
    ctaPrimary: 'Message student',
    ctaPrimaryTo: '/messages/thread',
    ctaSecondary: 'Back to opportunities',
    ctaSecondaryTo: '/company/opportunities',
  }),

  studentDashboard: ws({
    eyebrow: '02-Student',
    title: 'Student dashboard',
    subtitle: 'Track startups, requests, applications, and notifications.',
    metrics: ['Startups 4', 'Join requests 7', 'Applications 11', 'Unread 5'],
    table: {
      columns: ['Activity', 'Area', 'Time'],
      rows: [
        ['Application moved to interview', 'Applications', '2h ago'],
        ['New startup join request', 'Startups', '5h ago'],
        ['Message from company', 'Messages', '1d ago'],
      ],
    },
    rail: {
      title: 'Quick links',
      lines: ['Create startup', 'Browse opportunities', 'Open messages'],
      actions: [
        { label: 'My startups', to: '/student/startups' },
        { label: 'Opportunities', to: '/opportunities' },
      ],
    },
    ctaPrimary: 'My startups',
    ctaPrimaryTo: '/student/startups',
    ctaSecondary: 'Browse opportunities',
    ctaSecondaryTo: '/opportunities',
  }),

  studentProfile: ws({
    eyebrow: '02-Student',
    title: 'Student profile',
    subtitle: 'Manage your profile details and public identity.',
    fields: ['First name', 'Last name', 'Major', 'Grad year', 'Bio', 'Skills'],
    ctaPrimary: 'Save profile',
    ctaPrimaryTo: '/student/dashboard',
    ctaSecondary: 'Portfolio manager',
    ctaSecondaryTo: '/student/portfolio',
  }),

  studentPortfolio: ws({
    eyebrow: '02-Student',
    title: 'Portfolio manager',
    subtitle: 'Add and organize portfolio entries.',
    fields: ['Title', 'Description', 'Project URL', 'Image URL'],
    table: {
      columns: ['Item', 'Category', 'Updated', 'Action'],
      rows: [
        ['CampusPay MVP', 'Startup', 'Mar 2026', 'Edit'],
        ['DormLens Research', 'Research', 'Feb 2026', 'Edit'],
        ['DataBoard', 'Analytics', 'Jan 2026', 'Edit'],
      ],
    },
    ctaPrimary: 'Back to profile',
    ctaPrimaryTo: '/student/profile',
    ctaSecondary: 'Back to dashboard',
    ctaSecondaryTo: '/student/dashboard',
  }),

  myStartups: ws({
    eyebrow: '02-Student',
    title: 'My startups',
    subtitle: 'Manage all startup drafts and submissions.',
    filters: ['Search', 'Status', 'Sort'],
    table: {
      columns: ['Startup', 'Stage', 'Status', 'Action'],
      rows: [
        ['CampusPay', 'MVP', 'Approved', 'Open'],
        ['SkillForge', 'Prototype', 'Submitted', 'Open'],
        ['DormLens', 'Early', 'Draft', 'Open'],
      ],
    },
    ctaPrimary: 'Startup editor',
    ctaPrimaryTo: '/student/startups/editor',
    ctaSecondary: 'Startup team',
    ctaSecondaryTo: '/student/startups/team',
  }),

  startupEditor: ws({
    eyebrow: '02-Student',
    title: 'Startup editor',
    subtitle: 'Create or update startup details before submission.',
    fields: ['Name', 'Tagline', 'Description', 'Stage', 'Tags', 'Logo URL'],
    ctaPrimary: 'Save and continue',
    ctaPrimaryTo: '/student/startups/team',
    ctaSecondary: 'Back to startups',
    ctaSecondaryTo: '/student/startups',
  }),

  startupTeam: ws({
    eyebrow: '02-Student',
    title: 'Startup team',
    subtitle: 'Manage startup members and roles.',
    table: {
      columns: ['Member', 'Role', 'Joined', 'Status'],
      rows: [
        ['A. Chen', 'Founder', 'Dec 2025', 'Active'],
        ['R. Malik', 'Product', 'Jan 2026', 'Active'],
        ['J. Ellis', 'Design', 'Feb 2026', 'Active'],
      ],
    },
    ctaPrimary: 'Join requests',
    ctaPrimaryTo: '/student/startups/join-requests',
    ctaSecondary: 'Back to startups',
    ctaSecondaryTo: '/student/startups',
  }),

  startupJoinRequests: ws({
    eyebrow: '02-Student',
    title: 'Startup join requests',
    subtitle: 'Review and manage inbound join requests.',
    table: {
      columns: ['Applicant', 'Requested role', 'Message', 'Decision'],
      rows: [
        ['M. Ali', 'Growth', 'Scaled clubs to 2k users', 'Review'],
        ['S. Roy', 'Frontend', 'Built two React apps', 'Review'],
        ['N. Park', 'Data', 'Can own analytics', 'Review'],
      ],
    },
    ctaPrimary: 'Back to team',
    ctaPrimaryTo: '/student/startups/team',
    ctaSecondary: 'Open messages',
    ctaSecondaryTo: '/messages',
  }),

  myJoinRequests: ws({
    eyebrow: '02-Student',
    title: 'My join requests',
    subtitle: 'Track requests sent to startup teams.',
    table: {
      columns: ['Startup', 'Role', 'Status', 'Updated'],
      rows: [
        ['CampusPay', 'Growth', 'Pending', '3h ago'],
        ['DormLens', 'Frontend', 'Accepted', '1d ago'],
        ['SkillForge', 'Data', 'Rejected', '2d ago'],
      ],
    },
    ctaPrimary: 'Discover startups',
    ctaPrimaryTo: '/startups',
    ctaSecondary: 'Back to dashboard',
    ctaSecondaryTo: '/student/dashboard',
  }),

  myApplications: ws({
    eyebrow: '02-Student',
    title: 'My applications',
    subtitle: 'Monitor your full opportunity application pipeline.',
    table: {
      columns: ['Opportunity', 'Organization', 'Status', 'Updated'],
      rows: [
        ['ML Prototype Sprint', 'NeuroByte', 'Interview', '4h ago'],
        ['Growth Analytics Build', 'CloudSparq', 'Shortlisted', '1d ago'],
        ['UX Revamp', 'Studio Nexus', 'Submitted', '2d ago'],
      ],
    },
    ctaPrimary: 'Open thread',
    ctaPrimaryTo: '/messages/thread',
    ctaSecondary: 'Browse opportunities',
    ctaSecondaryTo: '/opportunities',
  }),

  companyOrgProfile: ws({
    eyebrow: '03-Company',
    title: 'Organization profile',
    subtitle: 'Manage public company details and brand information.',
    fields: ['Organization name', 'Description', 'Website', 'Logo URL'],
    ctaPrimary: 'Save profile',
    ctaPrimaryTo: '/company/org/members',
    ctaSecondary: 'Opportunity board',
    ctaSecondaryTo: '/company/opportunities',
  }),

  companyOrgMembers: ws({
    eyebrow: '03-Company',
    title: 'Organization members',
    subtitle: 'Manage admins and team members.',
    fields: ['Member email', 'Role'],
    table: {
      columns: ['Name', 'Email', 'Role', 'Action'],
      rows: [
        ['Jamie Lin', 'jamie@cloudsparq.com', 'Company admin', 'Edit'],
        ['Mo Khan', 'mo@cloudsparq.com', 'Company member', 'Edit'],
        ['Priya Das', 'priya@cloudsparq.com', 'Company member', 'Edit'],
      ],
    },
    ctaPrimary: 'Opportunity board',
    ctaPrimaryTo: '/company/opportunities',
    ctaSecondary: 'Back to organization',
    ctaSecondaryTo: '/company/org',
  }),

  companyOpportunitiesBoard: ws({
    eyebrow: '03-Company',
    title: 'Company opportunities',
    subtitle: 'Create, publish, and manage all opportunities.',
    filters: ['Search', 'Status', 'Budget'],
    table: {
      columns: ['Opportunity', 'Budget', 'Applications', 'Action'],
      rows: [
        ['Backend Engineer Intern', 'Paid', '32', 'Open'],
        ['Product Design Fellowship', 'Equity', '14', 'Open'],
        ['Growth Analyst Sprint', 'Paid', '22', 'Open'],
      ],
    },
    ctaPrimary: 'New opportunity',
    ctaPrimaryTo: '/company/opportunities/editor',
    ctaSecondary: 'Applications',
    ctaSecondaryTo: '/company/opportunities/applications',
  }),

  companyOpportunityEditor: ws({
    eyebrow: '03-Company',
    title: 'Opportunity editor',
    subtitle: 'Define title, scope, requirements, and budget.',
    fields: ['Title', 'Description', 'Requirements', 'Budget type', 'Budget range', 'Tags'],
    ctaPrimary: 'Save and return',
    ctaPrimaryTo: '/company/opportunities',
    ctaSecondary: 'Applications',
    ctaSecondaryTo: '/company/opportunities/applications',
  }),

  companyOpportunityApplications: ws({
    eyebrow: '03-Company',
    title: 'Opportunity applications',
    subtitle: 'Review incoming applicants and progress them through stages.',
    table: {
      columns: ['Applicant', 'Submitted', 'Status', 'Action'],
      rows: [
        ['Nadia Park', '2d ago', 'Submitted', 'Review'],
        ['Ritvik Shah', '3d ago', 'Shortlisted', 'Review'],
        ['Aline Costa', '4d ago', 'Interview', 'Review'],
      ],
    },
    ctaPrimary: 'Application review',
    ctaPrimaryTo: '/company/opportunities/application-review',
    ctaSecondary: 'Back to opportunities',
    ctaSecondaryTo: '/company/opportunities',
  }),

  companyApplicationReview: ws({
    eyebrow: '03-Company',
    title: 'Application review',
    subtitle: 'Review profile, cover letter, and decision notes.',
    tabs: ['Profile', 'Cover letter', 'Resume', 'Status history'],
    fields: ['Application status', 'Decision note'],
    ctaPrimary: 'Save decision',
    ctaPrimaryTo: '/company/opportunities/applications',
    ctaSecondary: 'Open messages',
    ctaSecondaryTo: '/messages/thread',
  }),

  messagingInbox: ws({
    eyebrow: 'Shared',
    title: 'Messaging inbox',
    subtitle: 'View all direct and team conversations.',
    filters: ['Search', 'Unread', 'Sort'],
    table: {
      columns: ['Thread', 'Participants', 'Last message', 'Unread'],
      rows: [
        ['CampusPay Team', '3', '12m ago', '2'],
        ['NeuroByte Interview', '2', '1h ago', '0'],
        ['DormLens Join Request', '2', '3h ago', '1'],
      ],
    },
    ctaPrimary: 'Open thread',
    ctaPrimaryTo: '/messages/thread',
    ctaSecondary: 'Notifications',
    ctaSecondaryTo: '/notifications',
  }),

  messagingThread: ws({
    eyebrow: 'Shared',
    title: 'Message thread',
    subtitle: 'Conversation timeline and composer.',
    fields: ['Message'],
    table: {
      columns: ['Sender', 'Message', 'Time', 'Type'],
      rows: [
        ['Priya', 'Can you share the architecture draft?', '10:42', 'Text'],
        ['Aniket', 'Yes, uploading it now.', '10:43', 'Text'],
        ['System', 'Application moved to Interview', '10:45', 'Event'],
      ],
    },
    ctaPrimary: 'Back to inbox',
    ctaPrimaryTo: '/messages',
    ctaSecondary: 'Notifications',
    ctaSecondaryTo: '/notifications',
  }),

  notifications: ws({
    eyebrow: 'Shared',
    title: 'Notifications',
    subtitle: 'Track account, application, and team updates.',
    filters: ['Unread', 'Type', 'Sort'],
    table: {
      columns: ['Notification', 'Type', 'When', 'State'],
      rows: [
        ['Application moved to Interview', 'Application', '8m ago', 'Unread'],
        ['Join request accepted', 'Startup', '2h ago', 'Unread'],
        ['Member invited', 'Organization', '1d ago', 'Read'],
      ],
    },
    ctaPrimary: 'Open inbox',
    ctaPrimaryTo: '/messages',
    ctaSecondary: 'Back to dashboard',
    ctaSecondaryTo: '/dashboard',
  }),

  globalSearch: ws({
    eyebrow: 'Shared',
    title: 'Global search',
    subtitle: 'Search startups, opportunities, students, and organizations.',
    filters: ['Query', 'Type', 'Limit'],
    table: {
      columns: ['Result', 'Type', 'Match', 'Open'],
      rows: [
        ['CampusPay', 'Startup', 'High', 'Open'],
        ['Backend Engineer Intern', 'Opportunity', 'Medium', 'Open'],
        ['CloudSparq', 'Organization', 'Medium', 'Open'],
      ],
    },
    ctaPrimary: 'Open startups',
    ctaPrimaryTo: '/startups',
    ctaSecondary: 'Open opportunities',
    ctaSecondaryTo: '/opportunities',
  }),

  myReports: ws({
    eyebrow: 'Moderation',
    title: 'My reports',
    subtitle: 'Submit and monitor moderation reports.',
    fields: ['Target type', 'Target ID', 'Reason'],
    table: {
      columns: ['Target', 'Reason', 'Status', 'Updated'],
      rows: [
        ['startup_21', 'Spam behavior', 'Pending', '1d ago'],
        ['message_92', 'Abusive content', 'Resolved', '3d ago'],
        ['org_13', 'False claims', 'Dismissed', '6d ago'],
      ],
    },
    ctaPrimary: 'Stay on reports',
    ctaPrimaryTo: '/reports',
    ctaSecondary: 'Back to dashboard',
    ctaSecondaryTo: '/dashboard',
  }),

  adminDashboard: ws({
    eyebrow: '04-Admin',
    title: 'Admin dashboard',
    subtitle: 'Monitor platform activity and moderation queues.',
    metrics: ['Active users 18,094', 'Organizations 1,206', 'Pending startups 74', 'Open reports 93'],
    table: {
      columns: ['Area', 'Current', 'Target'],
      rows: [
        ['Startup review SLA', '27 today', '< 24h'],
        ['Report backlog', '93 open', '< 120'],
        ['Retention trend', 'Stable', 'Upward'],
      ],
    },
    ctaPrimary: 'Pending startup reviews',
    ctaPrimaryTo: '/admin/startups/reviews',
    ctaSecondary: 'Moderation reports',
    ctaSecondaryTo: '/admin/reports',
  }),

  adminStartupReviews: ws({
    eyebrow: '04-Admin',
    title: 'Pending startup reviews',
    subtitle: 'Review submitted startups and decide outcomes.',
    table: {
      columns: ['Startup', 'Founder', 'Submitted', 'Open'],
      rows: [
        ['CampusPay', 'A. Patel', '2h ago', 'Review'],
        ['SkillForge', 'P. Nair', '5h ago', 'Review'],
        ['DormLens', 'J. Ellis', '1d ago', 'Review'],
      ],
    },
    ctaPrimary: 'Open review detail',
    ctaPrimaryTo: '/admin/startups/reviews/detail',
    ctaSecondary: 'Back to dashboard',
    ctaSecondaryTo: '/admin',
  }),

  adminStartupReviewDetail: ws({
    eyebrow: '04-Admin',
    title: 'Startup review detail',
    subtitle: 'Inspect submission and record decision.',
    tabs: ['Overview', 'Team', 'History', 'Audit'],
    fields: ['Decision', 'Feedback'],
    ctaPrimary: 'Back to review queue',
    ctaPrimaryTo: '/admin/startups/reviews',
    ctaSecondary: 'Audit logs',
    ctaSecondaryTo: '/admin/audit-logs',
  }),

  adminUserManagement: ws({
    eyebrow: '04-Admin',
    title: 'User management',
    subtitle: 'Search and manage user states.',
    filters: ['Search', 'Role', 'Status'],
    table: {
      columns: ['User', 'Role', 'Status', 'Action'],
      rows: [
        ['student_21@uni.edu', 'Student', 'Active', 'Manage'],
        ['admin@cloudsparq.com', 'Company admin', 'Active', 'Manage'],
        ['staff@uni.edu', 'University admin', 'Active', 'Manage'],
      ],
    },
    ctaPrimary: 'Organization management',
    ctaPrimaryTo: '/admin/orgs',
    ctaSecondary: 'Back to dashboard',
    ctaSecondaryTo: '/admin',
  }),

  adminOrgManagement: ws({
    eyebrow: '04-Admin',
    title: 'Organization management',
    subtitle: 'Review and manage organization status.',
    filters: ['Search', 'Status'],
    table: {
      columns: ['Organization', 'Members', 'Status', 'Action'],
      rows: [
        ['CloudSparq', '14', 'Active', 'Manage'],
        ['Aurora Labs', '9', 'Active', 'Manage'],
        ['Nexus Forge', '5', 'Suspended', 'Manage'],
      ],
    },
    ctaPrimary: 'User management',
    ctaPrimaryTo: '/admin/users',
    ctaSecondary: 'Back to dashboard',
    ctaSecondaryTo: '/admin',
  }),

  adminAuditLogs: ws({
    eyebrow: '04-Admin',
    title: 'Audit logs',
    subtitle: 'Review immutable admin action history.',
    filters: ['Date range', 'Action type', 'Target'],
    table: {
      columns: ['Action', 'Actor', 'Target', 'Timestamp'],
      rows: [
        ['UPDATE_USER_STATUS', 'Admin A', 'user_102', '2026-02-18 09:22'],
        ['REVIEW_STARTUP', 'Admin B', 'startup_17', '2026-02-18 10:01'],
        ['RESOLVE_REPORT', 'Admin C', 'report_77', '2026-02-18 11:36'],
      ],
    },
    ctaPrimary: 'Back to dashboard',
    ctaPrimaryTo: '/admin',
    ctaSecondary: 'Moderation reports',
    ctaSecondaryTo: '/admin/reports',
  }),

  adminModerationReports: ws({
    eyebrow: '04-Admin',
    title: 'Moderation reports',
    subtitle: 'Review open reports and record resolution.',
    table: {
      columns: ['Report', 'Target', 'Status', 'Action'],
      rows: [
        ['report_73', 'startup_21', 'Pending', 'Review'],
        ['report_74', 'message_92', 'Pending', 'Review'],
        ['report_75', 'org_13', 'Reviewing', 'Review'],
      ],
    },
    fields: ['Resolution', 'Admin note'],
    ctaPrimary: 'Stay on moderation',
    ctaPrimaryTo: '/admin/reports',
    ctaSecondary: 'Audit logs',
    ctaSecondaryTo: '/admin/audit-logs',
  }),

  unauthorized: system({
    eyebrow: 'System',
    title: 'Unauthorized',
    subtitle: 'You do not have access to this route.',
    ctaPrimary: 'Go to login',
    ctaPrimaryTo: '/login',
    ctaSecondary: 'Back to landing',
    ctaSecondaryTo: '/',
  }),

  notFound: system({
    eyebrow: 'System',
    title: 'Page not found',
    subtitle: 'This route does not exist yet.',
    ctaPrimary: 'Go to landing',
    ctaPrimaryTo: '/',
    ctaSecondary: 'Open search',
    ctaSecondaryTo: '/search',
  }),
} satisfies Record<string, PageConfig>;

export type PageConfigKey = keyof typeof pageConfigs;
