/** Platform-neutral contracts for Qoovex. */
export type EntityId = string;

export const platformRoles = ["USER", "SUPPORT_AGENT", "PLATFORM_ADMIN"] as const;
export type PlatformRole = (typeof platformRoles)[number];
export const accountRoles = ["BUSINESS", "PROFESSIONAL", "CLIENT"] as const;
export type AccountRole = (typeof accountRoles)[number];
export const organizationRoles = ["OWNER", "COLLABORATOR"] as const;
export type OrganizationRole = (typeof organizationRoles)[number];
export const organizationAccessPresets = ["READ_ONLY", "OPERATIONAL_COLLABORATION", "SITE_MANAGER", "LIMITED_UPLOAD", "CUSTOM"] as const;
export type OrganizationAccessPreset = (typeof organizationAccessPresets)[number];
export const devWorkspaceViews = ["BUSINESS", "PROFESSIONAL", "CLIENT", "SUPPORT_AGENT", "PLATFORM_ADMIN"] as const;
export type DevWorkspaceView = (typeof devWorkspaceViews)[number];
export const organizationScopeModes = ["FULL", "ASSIGNED"] as const;
export type OrganizationScopeMode = (typeof organizationScopeModes)[number];
export const organizationResourceTypes = ["JOB_SITE", "WORKER"] as const;
export type OrganizationResourceType = (typeof organizationResourceTypes)[number];

export type SupportAuditAction = "READ" | "WRITE" | "SENSITIVE" | "EXPORT";
export type AuthCodePurpose = "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "EMAIL_CHANGE" | "MFA_ENROLLMENT" | "MFA_RECOVERY";
export type MfaRecoveryMode = "SELF_EMAIL" | "OWNER_APPROVAL";
export type MfaRecoveryStatus = "PENDING" | "APPROVED" | "DENIED" | "SETUP_STARTED" | "COMPLETED" | "EXPIRED";

export const organizationPermissions = [
  "organization:read", "organization:update", "organizationProfile:read", "organizationProfile:update",
  "members:read", "members:invite", "members:manage",
  "workers:read", "workers:create", "workers:update", "workers:archive",
  "jobSites:read", "jobSites:create", "jobSites:update", "jobSites:archive",
  "auditLog:read", "assignments:read", "assignments:manage", "settings:update",
  "jobSite:view", "jobSite:update", "jobSite:publish", "jobSite:manageParticipants", "jobSite:participants:manage",
  "jobSite:steps:read", "jobSite:steps:manage", "jobSite:steps:updateStatus",
  "jobSite:requests:create", "jobSite:requests:respond", "jobSite:changes:propose",
  "jobSite:commercial:grant", "jobSite:commercial:negotiate", "jobSite:commercial:accept",
  "jobSite:payments:read", "jobSite:payments:request", "jobSite:payments:declareTransfer", "jobSite:payments:confirmReceipt",
  "jobSite:disputes:create", "jobSite:disputes:respond",
  "jobSite:closure:propose", "jobSite:closure:confirm", "jobSite:archive", "jobSite:export",
] as const;
export type OrganizationPermission = (typeof organizationPermissions)[number];
export const permissions = organizationPermissions;
export type Permission = OrganizationPermission;

export const recordStatuses = ["ACTIVE", "ARCHIVED"] as const;
export type RecordStatus = (typeof recordStatuses)[number];
export const jobSiteStatuses = ["DRAFT", "WAITING_FOR_CLIENT", "PENDING_INITIAL_CONFIRMATION", "ACTIVE", "CLOSURE_PROPOSED", "CLOSED", "ARCHIVED"] as const;
export type JobSiteStatus = (typeof jobSiteStatuses)[number];
export const notificationTypes = ["SYSTEM", "JOB_SITE_ACTION_REQUIRED", "JOB_SITE_ACTIVITY", "PAYMENT_ACTIVITY", "DISPUTE_ACTIVITY", "EXPORT_READY"] as const;
export type NotificationType = (typeof notificationTypes)[number];
export const notificationSeverities = ["INFO", "ATTENTION", "WARNING"] as const;
export type NotificationSeverity = (typeof notificationSeverities)[number];
export const notificationSourceTypes = ["SYSTEM", "JOB_SITE", "CHANGE_PROPOSAL", "PAYMENT_REQUEST", "DISPUTE", "EXPORT"] as const;
export type NotificationSourceType = (typeof notificationSourceTypes)[number];
export const jobSiteParticipantKinds = ["ORGANIZATION_MEMBER", "CLIENT"] as const;
export type JobSiteParticipantKind = (typeof jobSiteParticipantKinds)[number];
export const jobSiteParticipantStatuses = ["INVITED", "PENDING", "ACTIVE", "SUSPENDED", "ENDED", "REVOKED"] as const;
export type JobSiteParticipantStatus = (typeof jobSiteParticipantStatuses)[number];
export const organizationContactKinds = ["GENERAL", "ADMINISTRATION", "SAFETY", "TECHNICAL"] as const;
export type OrganizationContactKind = (typeof organizationContactKinds)[number];
export const dataControlJobTypes = ["METADATA_EXPORT", "ORPHAN_BLOB_CLEANUP"] as const;
export type DataControlJobType = (typeof dataControlJobTypes)[number];
export const dataControlJobStatuses = ["PENDING", "RUNNING", "COMPLETED", "FAILED"] as const;
export type DataControlJobStatus = (typeof dataControlJobStatuses)[number];

export const auditActions = [
  "WORKER_CREATED", "WORKER_UPDATED", "WORKER_ARCHIVED", "JOB_SITE_CREATED", "JOB_SITE_UPDATED", "JOB_SITE_ARCHIVED",
  "NOTIFICATION_READ", "NOTIFICATION_DISMISSED",
  "WORKER_USER_LINK_CREATED", "WORKER_USER_LINK_ARCHIVED", "JOB_SITE_PARTICIPANT_CREATED", "JOB_SITE_PARTICIPANT_UPDATED", "JOB_SITE_PARTICIPANT_ENDED", "JOB_SITE_WORKER_ASSIGNMENT_CREATED", "JOB_SITE_WORKER_ASSIGNMENT_ARCHIVED",
  "ORGANIZATION_PROFILE_UPDATED", "ORGANIZATION_CONTACT_CREATED", "ORGANIZATION_CONTACT_UPDATED", "ORGANIZATION_CONTACT_ARCHIVED",
  "ORGANIZATION_INVITATION_CREATED", "ORGANIZATION_INVITATION_REVOKED", "ORGANIZATION_INVITATION_ACCEPTED", "ORGANIZATION_MEMBERSHIP_REVOKED",
  "DATA_EXPORT_GENERATED", "DATA_EXPORT_FAILED", "DATA_CONTROL_JOB_CREATED", "DATA_CONTROL_JOB_RUN", "ORPHAN_BLOB_CLEANUP_RUN", "JOB_SITE_ACTION_EXECUTED", "JOB_SITE_TIMELINE_APPENDED", "JOB_SITE_ATTACHMENT_DOWNLOADED", "JOB_SITE_ATTACHMENT_UPLOADED", "JOB_SITE_AUTHORITY_GRANTED", "JOB_SITE_AUTHORITY_REVOKED", "JOB_SITE_EXPORT_DOWNLOADED", "PAYMENT_PROFILE_UPDATED", "LEGAL_HOLD_PLACED", "LEGAL_HOLD_RELEASED", "SECURITY_DENIED",
] as const;
export type AuditAction = (typeof auditActions)[number];
export const auditEntityTypes = [
  "WORKER", "JOB_SITE", "NOTIFICATION", "DATA_CONTROL_JOB",
  "WORKER_USER_LINK", "JOB_SITE_PARTICIPANT", "JOB_SITE_WORKER_ASSIGNMENT", "JOB_SITE_ATTACHMENT", "JOB_SITE_TIMELINE_EVENT", "JOB_SITE_CHANGE_PROPOSAL", "JOB_SITE_PAYMENT_REQUEST", "JOB_SITE_DISPUTE", "JOB_SITE_CLOSURE", "JOB_SITE_EXPORT", "LEGAL_HOLD", "ORGANIZATION_PAYMENT_PROFILE", "ORGANIZATION_INVITATION", "ORGANIZATION_MEMBERSHIP",
  "ORGANIZATION", "ORGANIZATION_PROFILE", "ORGANIZATION_CONTACT", "USER", "SYSTEM",
] as const;
export type AuditEntityType = (typeof auditEntityTypes)[number];
export const auditOutcomes = ["SUCCESS", "DENIED", "FAILED"] as const;
export type AuditOutcome = (typeof auditOutcomes)[number];
export type AuditMetadataValue = string | number | boolean | null;
export type AuditMetadata = Record<string, AuditMetadataValue>;

export interface OrganizationSummary { id: EntityId; name: string; code: string }
export interface OrganizationProfileResponse { id: EntityId; organizationId: EntityId; legalName?: string | null; taxCode?: string | null; vatNumber?: string | null; registeredOfficeAddress?: string | null; operatingDescription?: string | null; specializations: string[]; createdAt: string; updatedAt: string }
export interface UpdateOrganizationProfileInput { legalName?: string | null; taxCode?: string | null; vatNumber?: string | null; registeredOfficeAddress?: string | null; operatingDescription?: string | null; specializations?: string[] }
export interface OrganizationContactResponse { id: EntityId; organizationId: EntityId; userId?: EntityId | null; kind: OrganizationContactKind; name: string; email?: string | null; phone?: string | null; position?: string | null; isPrimary: boolean; sortOrder?: number; createdAt: string; updatedAt: string; archivedAt?: string | null }

export interface CompanyContext { role: OrganizationRole; preset?: OrganizationAccessPreset | null; scopeMode?: OrganizationScopeMode; expiresAt?: string | null; organization: OrganizationSummary }
export interface OrganizationContext extends CompanyContext { membershipId: EntityId; accessVersion: number; permissions: OrganizationPermission[] }
export interface ClientJobSiteContext { participantId: EntityId; jobSiteId: EntityId; jobSiteName: string; organization: OrganizationSummary; status: JobSiteParticipantStatus }
export interface SupportContext { sessionId: EntityId; reason: string; expiresAt: string; sensitiveConfirmedUntil?: string | null; organization: OrganizationSummary }
export interface WorkspaceAccessContext { userId: EntityId; platformRole: PlatformRole; devView?: DevWorkspaceView | null; company: CompanyContext | null; support: SupportContext | null; permissions: OrganizationPermission[] }

export interface OrganizationResourceGrantInput { resourceType: OrganizationResourceType; resourceId: EntityId }

export interface WorkerUserLinkResponse { id: EntityId; workerId: EntityId; userId: EntityId; linkedById: EntityId; workerDisplayName: string; userLabel: string; userEmail: string; createdAt: string; updatedAt: string; archivedAt: string | null }
export interface CreateWorkerUserLinkInput { workerId: EntityId; userId: EntityId }
export interface ArchiveWorkerUserLinkResponse { link: WorkerUserLinkResponse; archived: true }
export type AssignmentStatus = "SCHEDULED" | "ACTIVE" | "ENDED" | "CANCELLED";
export interface JobSiteParticipantResponse { id: EntityId; organizationId: EntityId; jobSiteId: EntityId; userId: EntityId; membershipId: EntityId | null; kind: JobSiteParticipantKind; status: JobSiteParticipantStatus; publicRoleLabel: string | null; jobSiteName: string; displayName: string; createdAt: string; updatedAt: string }
export interface CreateOrganizationParticipantInput { jobSiteId: EntityId; membershipId: EntityId; publicRoleLabel?: string | null }
export interface EndJobSiteParticipantResponse { participant: JobSiteParticipantResponse; ended: true }
export interface JobSiteWorkerAssignmentResponse { id: EntityId; jobSiteId: EntityId; workerId: EntityId; assignedById: EntityId; assignmentStatus: AssignmentStatus; jobSiteName: string; workerDisplayName: string; workerRoleLabel: string | null; operationalRoleLabel: string | null; taskLabel: string | null; startsAt: string; endsAt: string | null; endedById: string | null; endReason: string | null; createdAt: string; updatedAt: string; archivedAt: string | null }
export interface CreateJobSiteWorkerAssignmentInput { jobSiteId: EntityId; workerId: EntityId; operationalRoleLabel?: string | null; taskLabel?: string | null; startsAt?: string | null; endsAt?: string | null }
export interface ArchiveJobSiteWorkerAssignmentResponse { assignment: JobSiteWorkerAssignmentResponse; archived: true }
export interface MyResourceScopeResponse { role: OrganizationRole; worker: { id: EntityId; displayName: string } | null; jobSites: Array<{ id: EntityId; name: string; status: JobSiteStatus }>; generatedAt: string }

export type TimelineAudience = "INTERNAL" | "SHARED";
export type TimelineDisclosure = "GENERAL" | "COMMERCIAL" | "RESTRICTED_COMMERCIAL";
export type JobSiteStepStatus = "NOT_STARTED" | "IN_PROGRESS" | "WAITING" | "WORK_COMPLETED" | "CHANGES_REQUESTED" | "CONFIRMED" | "CANCELLED";
export type ChangeProposalStatus = "DRAFT" | "PROPOSED" | "COUNTERED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | "SUPERSEDED" | "EXPIRED";
export type PaymentRequestStatus = "DRAFT" | "REQUESTED" | "TRANSFER_DECLARED" | "UNDER_REVIEW" | "CONFIRMED" | "DISPUTED" | "CANCELLED";
export type DisputeStatus = "OPEN" | "IN_DISCUSSION" | "RESOLVED_BY_AGREEMENT" | "WITHDRAWN" | "CLOSED_WITHOUT_AGREEMENT";
export interface ApiErrorResponse { error: { code: string; message: string; fieldErrors?: Record<string, string[]>; currentRevision?: number } }
export interface CursorListResponse<T> { items: T[]; nextCursor: string | null }
export interface JobSiteSummaryResponse { id: EntityId; organizationId: EntityId; name: string; address: string | null; description: string | null; status: JobSiteStatus; revision: number; estimatedCompletionAt: string | null; createdAt: string; updatedAt: string }
export interface TimelineEventResponse { id: EntityId; jobSiteId: EntityId; sequence: string; type: string; audience: TimelineAudience; disclosure: TimelineDisclosure; actorKind: string; stepId: EntityId | null; payload: Record<string, unknown>; createdAt: string }
export interface JobSiteStepResponse { id: EntityId; jobSiteId: EntityId; title: string; description: string | null; expectedOutcome: string | null; sortOrder: number; status: JobSiteStepStatus; revision: number; economicValueMinor: string | null; estimatedCompletionAt: string | null; createdAt: string; updatedAt: string }
export interface ChangeProposalResponse { id: EntityId; jobSiteId: EntityId; status: ChangeProposalStatus; currentVersion: number | null; representedSide: JobSiteParticipantKind; expiresAt: string | null; createdAt: string; updatedAt: string }
export interface PaymentRequestResponse { id: EntityId; jobSiteId: EntityId; status: PaymentRequestStatus; revision: number; amountMinor: string; reason: string; dueAt: string | null; createdAt: string; updatedAt: string }
export interface DisputeResponse { id: EntityId; jobSiteId: EntityId; title: string; description: string; status: DisputeStatus; revision: number; openedAt: string; updatedAt: string }

export interface NotificationResponse { id: EntityId; userId: EntityId | null; type: NotificationType; severity: NotificationSeverity; title: string; message: string; actionHref: string | null; sourceType: NotificationSourceType; sourceId: string | null; createdAt: string; updatedAt: string; readAt: string | null; dismissedAt: string | null }
export interface NotificationListResponse { notifications: NotificationResponse[]; unreadCount: number; generatedAt: string }

export interface AuditLogEventResponse { id: EntityId; actorUserId: EntityId | null; actorRole: OrganizationRole | null; action: AuditAction; entityType: AuditEntityType; entityId: EntityId | null; outcome: AuditOutcome; metadata: AuditMetadata | null; requestId: string | null; supportSessionId: EntityId | null; createdAt: string }
export interface AuditLogFilters { action?: AuditAction; entityType?: AuditEntityType; outcome?: AuditOutcome; actorUserId?: EntityId; entityId?: EntityId; from?: string; to?: string; cursor?: string; limit?: number }
export interface AuditLogListResponse { events: AuditLogEventResponse[]; nextCursor: string | null; generatedAt: string }

export interface DataRecordCount { total: number; active?: number; archived?: number }
export type FoundationDataInventoryCounts = Record<string, DataRecordCount>;
export interface DataInventoryResponse { generatedAt: string; counts: FoundationDataInventoryCounts }
export interface DataExportResponse { organization: Record<string, unknown>; members: Array<Record<string, unknown>>; workers: Array<Record<string, unknown>>; jobSites: Array<Record<string, unknown>>; workerUserLinks: Array<Record<string, unknown>>; jobSiteParticipants: Array<Record<string, unknown>>; jobSiteWorkerAssignments: Array<Record<string, unknown>>; invitations: Array<Record<string, unknown>>; notifications: Array<Record<string, unknown>>; auditEvents: Array<Record<string, unknown>>; jobSite?: Record<string, Array<Record<string, unknown>>>; exportedAt: string }
export interface DataRetentionCandidate { key: string; title: string; description: string; count: number }
export interface DataRetentionOverviewResponse { generatedAt: string; notice: string; thresholds: Record<string, never>; candidates: DataRetentionCandidate[] }

export interface DataControlJobResponse { id: EntityId; organizationId: EntityId; requestedById: EntityId; type: DataControlJobType; status: DataControlJobStatus; resultSummary: Record<string, unknown> | null; errorCode: string | null; createdAt: string; startedAt: string | null; completedAt: string | null }
export interface DataControlJobListResponse { jobs: DataControlJobResponse[]; generatedAt: string }
export interface CreateDataExportJobResponse { job: DataControlJobResponse; created: boolean }
export interface BlobOrphanDryRunResponse { scanned: number; referenced: number; orphanCount: number; deletableCount: number; generatedAt: string }
export interface BlobOrphanCleanupResponse { job: DataControlJobResponse; created: boolean }
export interface RunDataControlJobsResponse { scanned: number; completed: number; failed: number; skipped: number; generatedAt: string }
