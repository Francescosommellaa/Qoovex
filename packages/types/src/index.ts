/** Platform-neutral contracts for the foundation-only Qoovex repository. */
export type EntityId = string;

export const platformRoles = ["USER", "SUPPORT_AGENT", "PLATFORM_ADMIN"] as const;
export type PlatformRole = (typeof platformRoles)[number];
export const organizationRoles = ["OWNER", "COLLABORATOR"] as const;
export type OrganizationRole = (typeof organizationRoles)[number];
export const organizationAccessPresets = ["READ_ONLY", "OPERATIONAL_COLLABORATION", "SITE_MANAGER", "DOCUMENT_REVIEWER", "LIMITED_UPLOAD", "CUSTOM"] as const;
export type OrganizationAccessPreset = (typeof organizationAccessPresets)[number];
export const devWorkspaceViews = ["OWNER", "SUPPORT_AGENT", "PLATFORM_ADMIN"] as const;
export type DevWorkspaceView = (typeof devWorkspaceViews)[number];
export const organizationScopeModes = ["FULL", "ASSIGNED"] as const;
export type OrganizationScopeMode = (typeof organizationScopeModes)[number];
export const organizationResourceTypes = ["JOB_SITE", "WORKER", "DOCUMENT", "EVIDENCE"] as const;
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
  "documents:read", "documents:file:read", "documents:upload", "documents:update", "documents:archive",
  "evidence:read", "evidence:file:read", "evidence:upload", "evidence:delete",
  "auditLog:read", "assignments:read", "assignments:manage", "settings:update",
] as const;
export type OrganizationPermission = (typeof organizationPermissions)[number];
export const permissions = organizationPermissions;
export type Permission = OrganizationPermission;

export const recordStatuses = ["ACTIVE", "ARCHIVED"] as const;
export type RecordStatus = (typeof recordStatuses)[number];
export const documentOwnerTypes = ["ORGANIZATION", "WORKER", "JOB_SITE"] as const;
export type DocumentOwnerType = (typeof documentOwnerTypes)[number];
export const evidenceTypes = ["PHOTO", "FILE", "NOTE"] as const;
export type EvidenceType = (typeof evidenceTypes)[number];
export const notificationTypes = ["SYSTEM"] as const;
export type NotificationType = (typeof notificationTypes)[number];
export const notificationSeverities = ["INFO", "ATTENTION", "WARNING"] as const;
export type NotificationSeverity = (typeof notificationSeverities)[number];
export const notificationSourceTypes = ["SYSTEM"] as const;
export type NotificationSourceType = (typeof notificationSourceTypes)[number];
export const jobSiteUserAssignmentRoles = ["SITE_MANAGER", "DOCUMENT_REVIEWER", "CONTRIBUTOR"] as const;
export type JobSiteUserAssignmentRole = (typeof jobSiteUserAssignmentRoles)[number];
export const organizationContactKinds = ["GENERAL", "ADMINISTRATION", "SAFETY", "TECHNICAL"] as const;
export type OrganizationContactKind = (typeof organizationContactKinds)[number];
export const dataControlJobTypes = ["METADATA_EXPORT", "ORGANIZATION_DELETE", "ORPHAN_BLOB_CLEANUP"] as const;
export type DataControlJobType = (typeof dataControlJobTypes)[number];
export const dataControlJobStatuses = ["PENDING", "RUNNING", "COMPLETED", "FAILED"] as const;
export type DataControlJobStatus = (typeof dataControlJobStatuses)[number];

export const auditActions = [
  "DOCUMENT_CREATED", "DOCUMENT_UPDATED", "DOCUMENT_ARCHIVED", "DOCUMENT_VERSION_UPLOADED", "DOCUMENT_VERSION_DOWNLOADED", "DOCUMENT_VERSION_ARCHIVED",
  "WORKER_CREATED", "WORKER_UPDATED", "WORKER_ARCHIVED", "JOB_SITE_CREATED", "JOB_SITE_UPDATED", "JOB_SITE_ARCHIVED",
  "EVIDENCE_CREATED", "EVIDENCE_UPDATED", "EVIDENCE_DOWNLOADED", "EVIDENCE_ARCHIVED",
  "NOTIFICATION_READ", "NOTIFICATION_DISMISSED",
  "WORKER_USER_LINK_CREATED", "WORKER_USER_LINK_ARCHIVED", "JOB_SITE_USER_ASSIGNMENT_CREATED", "JOB_SITE_USER_ASSIGNMENT_ARCHIVED", "JOB_SITE_WORKER_ASSIGNMENT_CREATED", "JOB_SITE_WORKER_ASSIGNMENT_ARCHIVED",
  "ORGANIZATION_PROFILE_UPDATED", "ORGANIZATION_CONTACT_CREATED", "ORGANIZATION_CONTACT_UPDATED", "ORGANIZATION_CONTACT_ARCHIVED",
  "DOCUMENT_JOB_SITE_LINK_CREATED", "DOCUMENT_JOB_SITE_LINK_ARCHIVED",
  "ORGANIZATION_INVITATION_CREATED", "ORGANIZATION_INVITATION_REVOKED", "ORGANIZATION_INVITATION_ACCEPTED", "ORGANIZATION_MEMBERSHIP_REVOKED",
  "DATA_EXPORT_GENERATED", "DATA_EXPORT_FAILED", "DATA_CONTROL_JOB_CREATED", "DATA_CONTROL_JOB_RUN", "ORPHAN_BLOB_CLEANUP_RUN", "ORGANIZATION_DELETE_REQUESTED", "ORGANIZATION_DELETE_RUN", "SECURITY_DENIED",
] as const;
export type AuditAction = (typeof auditActions)[number];
export const auditEntityTypes = [
  "DOCUMENT", "DOCUMENT_VERSION", "WORKER", "JOB_SITE", "EVIDENCE", "NOTIFICATION", "DATA_CONTROL_JOB",
  "WORKER_USER_LINK", "JOB_SITE_USER_ASSIGNMENT", "JOB_SITE_WORKER_ASSIGNMENT", "ORGANIZATION_INVITATION", "ORGANIZATION_MEMBERSHIP",
  "ORGANIZATION", "ORGANIZATION_PROFILE", "ORGANIZATION_CONTACT", "DOCUMENT_JOB_SITE_LINK", "EVIDENCE_REVISION", "USER", "SYSTEM",
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
export interface SupportContext { sessionId: EntityId; reason: string; expiresAt: string; sensitiveConfirmedUntil?: string | null; organization: OrganizationSummary }
export interface WorkspaceAccessContext { userId: EntityId; platformRole: PlatformRole; devView?: DevWorkspaceView | null; company: CompanyContext | null; support: SupportContext | null; permissions: OrganizationPermission[] }

export interface OrganizationResourceGrantInput { resourceType: OrganizationResourceType; resourceId: EntityId }

export interface WorkerUserLinkResponse { id: EntityId; workerId: EntityId; userId: EntityId; linkedById: EntityId; workerDisplayName: string; userLabel: string; userEmail: string; createdAt: string; updatedAt: string; archivedAt: string | null }
export interface CreateWorkerUserLinkInput { workerId: EntityId; userId: EntityId }
export interface ArchiveWorkerUserLinkResponse { link: WorkerUserLinkResponse; archived: true }
export type AssignmentStatus = "SCHEDULED" | "ACTIVE" | "ENDED" | "CANCELLED";
export interface JobSiteUserAssignmentResponse { id: EntityId; jobSiteId: EntityId; userId: EntityId; assignmentRole: JobSiteUserAssignmentRole; assignmentStatus: AssignmentStatus; operationalRoleLabel: string | null; taskLabel: string | null; startsAt: string; endsAt: string | null; endedById: string | null; endReason: string | null; assignedById: EntityId; jobSiteName: string; userLabel: string; userEmail: string; createdAt: string; updatedAt: string; archivedAt: string | null }
export interface CreateJobSiteUserAssignmentInput { jobSiteId: EntityId; userId: EntityId; assignmentRole?: JobSiteUserAssignmentRole; operationalRoleLabel?: string | null; taskLabel?: string | null; startsAt?: string | null; endsAt?: string | null }
export interface ArchiveJobSiteUserAssignmentResponse { assignment: JobSiteUserAssignmentResponse; archived: true }
export interface JobSiteWorkerAssignmentResponse { id: EntityId; jobSiteId: EntityId; workerId: EntityId; assignedById: EntityId; assignmentStatus: AssignmentStatus; jobSiteName: string; workerDisplayName: string; workerRoleLabel: string | null; operationalRoleLabel: string | null; taskLabel: string | null; startsAt: string; endsAt: string | null; endedById: string | null; endReason: string | null; createdAt: string; updatedAt: string; archivedAt: string | null }
export interface CreateJobSiteWorkerAssignmentInput { jobSiteId: EntityId; workerId: EntityId; operationalRoleLabel?: string | null; taskLabel?: string | null; startsAt?: string | null; endsAt?: string | null }
export interface ArchiveJobSiteWorkerAssignmentResponse { assignment: JobSiteWorkerAssignmentResponse; archived: true }
export interface MyResourceScopeResponse { role: OrganizationRole; worker: { id: EntityId; displayName: string } | null; jobSites: Array<{ id: EntityId; name: string; status: RecordStatus }>; generatedAt: string }

export interface NotificationResponse { id: EntityId; userId: EntityId | null; type: NotificationType; severity: NotificationSeverity; title: string; message: string; actionHref: string | null; sourceType: NotificationSourceType; sourceId: string | null; createdAt: string; updatedAt: string; readAt: string | null; dismissedAt: string | null }
export interface NotificationListResponse { notifications: NotificationResponse[]; unreadCount: number; generatedAt: string }

export interface AuditLogEventResponse { id: EntityId; actorUserId: EntityId | null; actorRole: OrganizationRole | null; action: AuditAction; entityType: AuditEntityType; entityId: EntityId | null; outcome: AuditOutcome; metadata: AuditMetadata | null; requestId: string | null; supportSessionId: EntityId | null; createdAt: string }
export interface AuditLogFilters { action?: AuditAction; entityType?: AuditEntityType; outcome?: AuditOutcome; actorUserId?: EntityId; entityId?: EntityId; from?: string; to?: string; cursor?: string; limit?: number }
export interface AuditLogListResponse { events: AuditLogEventResponse[]; nextCursor: string | null; generatedAt: string }

export interface DataRecordCount { total: number; active?: number; archived?: number }
export type FoundationDataInventoryCounts = Record<"workers" | "jobSites" | "documents" | "documentVersions" | "evidence" | "evidenceRevisions" | "documentJobSiteLinks" | "notifications" | "auditEvents" | "workerUserLinks" | "jobSiteUserAssignments" | "jobSiteWorkerAssignments" | "memberProfiles" | "memberships" | "invitations" | "dataControlJobs" | "supportSessions" | "supportEvents" | "authProviders" | "authSessions" | "authCredentials" | "authCodes" | "mfaRecoveryRequests" | "authDevices" | "mfaBackupCodes" | "securityAuditEvents" | "authRateLimits", DataRecordCount>;
export interface DataInventoryResponse { generatedAt: string; counts: FoundationDataInventoryCounts }
export interface DataExportResponse { organization: Record<string, unknown>; members: Array<Record<string, unknown>>; workers: Array<Record<string, unknown>>; jobSites: Array<Record<string, unknown>>; documents: Array<Record<string, unknown>>; documentVersions: Array<Record<string, unknown>>; evidence: Array<Record<string, unknown>>; evidenceRevisions: Array<Record<string, unknown>>; documentJobSiteLinks: Array<Record<string, unknown>>; workerUserLinks: Array<Record<string, unknown>>; jobSiteUserAssignments: Array<Record<string, unknown>>; jobSiteWorkerAssignments: Array<Record<string, unknown>>; invitations: Array<Record<string, unknown>>; notifications: Array<Record<string, unknown>>; auditEvents: Array<Record<string, unknown>>; exportedAt: string }
export interface DataRetentionCandidate { key: string; title: string; description: string; count: number }
export interface DataRetentionOverviewResponse { generatedAt: string; notice: string; thresholds: Record<string, never>; candidates: DataRetentionCandidate[] }

export interface DataControlJobResponse { id: EntityId; organizationId: EntityId; requestedById: EntityId; type: DataControlJobType; status: DataControlJobStatus; resultSummary: Record<string, unknown> | null; errorCode: string | null; createdAt: string; startedAt: string | null; completedAt: string | null }
export interface DataControlJobListResponse { jobs: DataControlJobResponse[]; generatedAt: string }
export interface CreateDataExportJobResponse { job: DataControlJobResponse; created: boolean }
export interface CreateOrganizationDeletionJobInput { organizationCode: unknown; confirmation: unknown }
export interface CreateOrganizationDeletionJobResponse { job: DataControlJobResponse; created: boolean }
export interface BlobOrphanDryRunResponse { scanned: number; referenced: number; orphanCount: number; deletableCount: number; generatedAt: string }
export interface BlobOrphanCleanupResponse { job: DataControlJobResponse; created: boolean }
export interface RunDataControlJobsResponse { scanned: number; completed: number; failed: number; skipped: number; generatedAt: string }
