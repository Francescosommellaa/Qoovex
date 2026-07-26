/** Shared platform-neutral contracts for the Qoovex Organization domain. */
export type EntityId = string;

export const platformRoles = ["USER", "SUPER_ADMIN"] as const;
export type PlatformRole = (typeof platformRoles)[number];

export const organizationRoles = ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"] as const;
export type OrganizationRole = (typeof organizationRoles)[number];

export type SupportAuditAction = "READ" | "WRITE" | "SENSITIVE" | "EXPORT";
export type AuthCodePurpose = "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "EMAIL_CHANGE" | "MFA_ENROLLMENT" | "MFA_RECOVERY";
export type MfaRecoveryMode = "SELF_EMAIL" | "OWNER_APPROVAL";
export type MfaRecoveryStatus = "PENDING" | "APPROVED" | "DENIED" | "SETUP_STARTED" | "COMPLETED" | "EXPIRED";

export const organizationPermissions = [
  "organization:read",
  "organization:update",
  "members:read",
  "members:invite",
  "members:manage",
  "workers:read",
  "workers:create",
  "workers:update",
  "workers:archive",
  "jobSites:read",
  "jobSites:create",
  "jobSites:update",
  "jobSites:archive",
  "documents:read",
  "documents:upload",
  "documents:update",
  "documents:archive",
  "deadlines:read",
  "deadlines:manage",
  "calendar:read",
  "calendar:manage",
  "checklists:read",
  "checklists:manage",
  "checklists:complete",
  "evidence:read",
  "evidence:upload",
  "evidence:delete",
  "documentPackages:read",
  "documentPackages:create",
  "documentPackages:share",
  "auditLog:read",
  "assignments:read",
  "assignments:manage",
  "settings:update",
] as const;
export type OrganizationPermission = (typeof organizationPermissions)[number];

export const permissions = organizationPermissions;
export type Permission = OrganizationPermission;

export const recordStatuses = ["ACTIVE", "ARCHIVED"] as const;
export type RecordStatus = (typeof recordStatuses)[number];

export const jobSiteOperationalPhases = ["PREPARATION", "IN_PROGRESS", "PAUSED", "CLOSING", "COMPLETED"] as const;
export type JobSiteOperationalPhase = (typeof jobSiteOperationalPhases)[number];

export const jobSiteOperationalPhaseLabels: Record<JobSiteOperationalPhase, string> = {
  PREPARATION: "Preparazione",
  IN_PROGRESS: "In corso",
  PAUSED: "In pausa",
  CLOSING: "In chiusura",
  COMPLETED: "Completato",
};

export const legacyJobSiteOperationalPhaseLabel = "Fase da impostare";

export const documentStatuses = ["PRESENT", "MISSING", "EXPIRED", "EXPIRING_SOON", "TO_REVIEW", "ARCHIVED"] as const;
export type DocumentStatus = (typeof documentStatuses)[number];

export const deadlineStatuses = ["SCHEDULED", "EXPIRING_SOON", "EXPIRED", "DONE", "ARCHIVED"] as const;
export type DeadlineStatus = (typeof deadlineStatuses)[number];

export const calendarEventKinds = ["EVENT", "TASK"] as const;
export type CalendarEventKind = (typeof calendarEventKinds)[number];

export const calendarEventPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type CalendarEventPriority = (typeof calendarEventPriorities)[number];

export const calendarEventStatuses = ["PLANNED", "IN_PROGRESS", "DONE", "CANCELLED", "ARCHIVED"] as const;
export type CalendarEventStatus = (typeof calendarEventStatuses)[number];

export const calendarEventSources = ["QOOVEX", "ICALENDAR_IMPORT"] as const;
export type CalendarEventSource = (typeof calendarEventSources)[number];

export const checklistItemStatuses = ["OPEN", "DONE", "TO_REVIEW", "ARCHIVED"] as const;
export type ChecklistItemStatus = (typeof checklistItemStatuses)[number];

export const documentPackageStatuses = ["DRAFT", "READY_FOR_REVIEW", "SHARED", "ARCHIVED"] as const;
export type DocumentPackageStatus = (typeof documentPackageStatuses)[number];

export const documentOwnerTypes = ["ORGANIZATION", "WORKER", "JOB_SITE"] as const;
export type DocumentOwnerType = (typeof documentOwnerTypes)[number];

export const documentTypeAppliesToValues = ["ORGANIZATION", "WORKER", "JOB_SITE", "EVIDENCE", "OTHER"] as const;
export type DocumentTypeAppliesTo = (typeof documentTypeAppliesToValues)[number];

export const documentCategoryKeys = [
  "COMPANY_IDENTITY_REGISTRATIONS",
  "COMPANY_REGULARITY_QUALIFICATIONS",
  "COMPANY_SAFETY",
  "COMPANY_INSURANCE",
  "COMPANY_ROLES_ORGANIZATION",
  "WORKER_IDENTITY_ACCESS",
  "WORKER_TRAINING_QUALIFICATIONS",
  "WORKER_FITNESS_JUDGMENT",
  "WORKER_PPE_DELIVERIES",
  "WORKER_ROLES_ASSIGNMENTS",
  "WORKER_RESTRICTED_ADMINISTRATION",
  "SITE_START_AUTHORIZATIONS",
  "SITE_SAFETY_COORDINATION",
  "SITE_COMPANIES_SUBCONTRACTS",
  "SITE_WORKERS_ACCESS",
  "SITE_EQUIPMENT_SYSTEMS",
  "SITE_REPORTS_INSPECTIONS",
  "SITE_CLOSURE_HANDOVER",
  "UNCLASSIFIED",
] as const;
export type DocumentCategoryKey = (typeof documentCategoryKeys)[number];

export const documentSensitivities = ["STANDARD", "RESTRICTED", "HEALTH_JUDGMENT"] as const;
export type DocumentSensitivity = (typeof documentSensitivities)[number];

export interface DocumentCategoryDefinition {
  key: DocumentCategoryKey;
  label: string;
  description: string;
  appliesTo: DocumentOwnerType | null;
  availableForNewDocuments: boolean;
}

export const documentCategoryRegistry: Record<DocumentCategoryKey, DocumentCategoryDefinition> = {
  COMPANY_IDENTITY_REGISTRATIONS: { key: "COMPANY_IDENTITY_REGISTRATIONS", label: "Identità e iscrizioni", description: "Dati identificativi e registrazioni dell'Azienda.", appliesTo: "ORGANIZATION", availableForNewDocuments: true },
  COMPANY_REGULARITY_QUALIFICATIONS: { key: "COMPANY_REGULARITY_QUALIFICATIONS", label: "Regolarità e qualifiche", description: "Documenti organizzativi relativi a regolarità e qualifiche registrate.", appliesTo: "ORGANIZATION", availableForNewDocuments: true },
  COMPANY_SAFETY: { key: "COMPANY_SAFETY", label: "Sicurezza aziendale", description: "Documenti di sicurezza configurati per l'Azienda.", appliesTo: "ORGANIZATION", availableForNewDocuments: true },
  COMPANY_INSURANCE: { key: "COMPANY_INSURANCE", label: "Assicurazioni", description: "Polizze e documenti assicurativi registrati dall'Azienda.", appliesTo: "ORGANIZATION", availableForNewDocuments: true },
  COMPANY_ROLES_ORGANIZATION: { key: "COMPANY_ROLES_ORGANIZATION", label: "Incarichi e organizzazione", description: "Incarichi, deleghe e organizzazione aziendale.", appliesTo: "ORGANIZATION", availableForNewDocuments: true },
  WORKER_IDENTITY_ACCESS: { key: "WORKER_IDENTITY_ACCESS", label: "Identità e accesso", description: "Documenti identificativi e di accesso collegati a una persona.", appliesTo: "WORKER", availableForNewDocuments: true },
  WORKER_TRAINING_QUALIFICATIONS: { key: "WORKER_TRAINING_QUALIFICATIONS", label: "Formazione e abilitazioni", description: "Attestati e qualifiche operative registrate per una persona.", appliesTo: "WORKER", availableForNewDocuments: true },
  WORKER_FITNESS_JUDGMENT: { key: "WORKER_FITNESS_JUDGMENT", label: "Idoneità alla mansione", description: "Solo il giudizio necessario a organizzare il lavoro, senza diagnosi o cartelle sanitarie.", appliesTo: "WORKER", availableForNewDocuments: true },
  WORKER_PPE_DELIVERIES: { key: "WORKER_PPE_DELIVERIES", label: "DPI e consegne", description: "Consegne e registrazioni operative collegate alla persona.", appliesTo: "WORKER", availableForNewDocuments: true },
  WORKER_ROLES_ASSIGNMENTS: { key: "WORKER_ROLES_ASSIGNMENTS", label: "Incarichi e ruoli", description: "Incarichi operativi registrati per la persona.", appliesTo: "WORKER", availableForNewDocuments: true },
  WORKER_RESTRICTED_ADMINISTRATION: { key: "WORKER_RESTRICTED_ADMINISTRATION", label: "Amministrazione riservata", description: "Area tecnica riservata, non abilitata finche non esistono permessi ed entitlement canonici.", appliesTo: "WORKER", availableForNewDocuments: false },
  SITE_START_AUTHORIZATIONS: { key: "SITE_START_AUTHORIZATIONS", label: "Avvio e autorizzazioni", description: "Documenti configurati per l'avvio del cantiere.", appliesTo: "JOB_SITE", availableForNewDocuments: true },
  SITE_SAFETY_COORDINATION: { key: "SITE_SAFETY_COORDINATION", label: "Sicurezza e coordinamento", description: "Documenti operativi di sicurezza e coordinamento del cantiere.", appliesTo: "JOB_SITE", availableForNewDocuments: true },
  SITE_COMPANIES_SUBCONTRACTS: { key: "SITE_COMPANIES_SUBCONTRACTS", label: "Imprese e subappalti", description: "Documenti delle imprese e relazioni operative registrate per il cantiere.", appliesTo: "JOB_SITE", availableForNewDocuments: true },
  SITE_WORKERS_ACCESS: { key: "SITE_WORKERS_ACCESS", label: "Lavoratori e accessi", description: "Documenti collegati all'accesso delle persone al cantiere.", appliesTo: "JOB_SITE", availableForNewDocuments: true },
  SITE_EQUIPMENT_SYSTEMS: { key: "SITE_EQUIPMENT_SYSTEMS", label: "Mezzi, attrezzature e impianti", description: "Documenti registrati per mezzi, attrezzature e impianti del cantiere.", appliesTo: "JOB_SITE", availableForNewDocuments: true },
  SITE_REPORTS_INSPECTIONS: { key: "SITE_REPORTS_INSPECTIONS", label: "Verbali e controlli", description: "Verbali, sopralluoghi e controlli registrati per il cantiere.", appliesTo: "JOB_SITE", availableForNewDocuments: true },
  SITE_CLOSURE_HANDOVER: { key: "SITE_CLOSURE_HANDOVER", label: "Chiusura e consegna", description: "Documenti configurati per chiusura e consegna del cantiere.", appliesTo: "JOB_SITE", availableForNewDocuments: true },
  UNCLASSIFIED: { key: "UNCLASSIFIED", label: "Da classificare", description: "Dato legacy mantenuto visibile finche OWNER o ADMIN non ne confermano la destinazione.", appliesTo: null, availableForNewDocuments: false },
};

export const documentSensitivityLabels: Record<DocumentSensitivity, string> = {
  STANDARD: "Standard",
  RESTRICTED: "Riservato",
  HEALTH_JUDGMENT: "Giudizio di idoneità",
};

export const requirementTargetTypes = ["ORGANIZATION", "WORKER", "JOB_SITE"] as const;
export type RequirementTargetType = (typeof requirementTargetTypes)[number];

export const deadlineSourceTypes = ["DOCUMENT", "CHECKLIST", "MANUAL", "OTHER"] as const;
export type DeadlineSourceType = (typeof deadlineSourceTypes)[number];

export const evidenceTypes = ["PHOTO", "FILE", "NOTE"] as const;
export type EvidenceType = (typeof evidenceTypes)[number];

export const documentPackageItemTypes = ["DOCUMENT", "DOCUMENT_VERSION", "EVIDENCE", "CHECKLIST", "NOTE"] as const;
export type DocumentPackageItemType = (typeof documentPackageItemTypes)[number];

export const notificationTypes = [
  "DEADLINE_OVERDUE",
  "DEADLINE_UPCOMING",
  "DOCUMENT_TO_REVIEW",
  "DOCUMENT_EXPIRED",
  "DOCUMENT_EXPIRING_SOON",
  "PACKAGE_READY_FOR_REVIEW",
  "SHARE_LINK_EXPIRING",
  "SHARE_LINK_REVOKED",
  "SYSTEM",
] as const;
export type NotificationType = (typeof notificationTypes)[number];

export const notificationSeverities = ["INFO", "ATTENTION", "WARNING"] as const;
export type NotificationSeverity = (typeof notificationSeverities)[number];

export const notificationSourceTypes = [
  "DOCUMENT",
  "DEADLINE",
  "WORKER",
  "JOB_SITE",
  "CHECKLIST",
  "EVIDENCE",
  "DOCUMENT_PACKAGE",
  "SHARE_LINK",
  "SYSTEM",
] as const;
export type NotificationSourceType = (typeof notificationSourceTypes)[number];

export const emailDigestFrequencies = ["OFF", "DAILY", "WEEKLY"] as const;
export type EmailDigestFrequency = (typeof emailDigestFrequencies)[number];

export const notificationEmailDeliveryTypes = ["DIGEST", "SINGLE_NOTIFICATION"] as const;
export type NotificationEmailDeliveryType = (typeof notificationEmailDeliveryTypes)[number];

export const notificationEmailDeliveryStatuses = ["SENT", "FAILED", "SKIPPED"] as const;
export type NotificationEmailDeliveryStatus = (typeof notificationEmailDeliveryStatuses)[number];

export const jobSiteUserAssignmentRoles = ["SITE_MANAGER"] as const;
export type JobSiteUserAssignmentRole = (typeof jobSiteUserAssignmentRoles)[number];

export const dataControlJobTypes = ["METADATA_EXPORT", "ORGANIZATION_DELETE", "ORPHAN_BLOB_CLEANUP"] as const;
export type DataControlJobType = (typeof dataControlJobTypes)[number];

export const dataControlJobStatuses = ["PENDING", "RUNNING", "COMPLETED", "FAILED"] as const;
export type DataControlJobStatus = (typeof dataControlJobStatuses)[number];

export const auditActions = [
  "DOCUMENT_CREATED",
  "DOCUMENT_UPDATED",
  "DOCUMENT_ARCHIVED",
  "DOCUMENT_VERSION_UPLOADED",
  "DOCUMENT_VERSION_DOWNLOADED",
  "DOCUMENT_VERSION_ARCHIVED",
  "DEADLINE_CREATED",
  "DEADLINE_UPDATED",
  "DEADLINE_ARCHIVED",
  "CALENDAR_EVENT_CREATED",
  "CALENDAR_EVENT_UPDATED",
  "CALENDAR_EVENT_ARCHIVED",
  "WORKER_CREATED",
  "WORKER_UPDATED",
  "WORKER_ARCHIVED",
  "JOB_SITE_CREATED",
  "JOB_SITE_UPDATED",
  "JOB_SITE_ARCHIVED",
  "CHECKLIST_CREATED",
  "CHECKLIST_UPDATED",
  "CHECKLIST_ARCHIVED",
  "CHECKLIST_ITEM_COMPLETED",
  "EVIDENCE_CREATED",
  "EVIDENCE_DOWNLOADED",
  "EVIDENCE_ARCHIVED",
  "DOCUMENT_PACKAGE_CREATED",
  "DOCUMENT_PACKAGE_UPDATED",
  "DOCUMENT_PACKAGE_ARCHIVED",
  "DOCUMENT_PACKAGE_ITEM_ADDED",
  "DOCUMENT_PACKAGE_ITEM_REMOVED",
  "SHARE_LINK_CREATED",
  "SHARE_LINK_REVOKED",
  "SHARE_LINK_ACCESSED",
  "NOTIFICATION_READ",
  "NOTIFICATION_DISMISSED",
  "EMAIL_DIGEST_SENT",
  "EMAIL_DIGEST_FAILED",
  "NOTIFICATION_PREFERENCES_UPDATED",
  "SCHEDULED_EMAIL_DIGEST_RUN",
  "WORKER_USER_LINK_CREATED",
  "WORKER_USER_LINK_ARCHIVED",
  "JOB_SITE_USER_ASSIGNMENT_CREATED",
  "JOB_SITE_USER_ASSIGNMENT_ARCHIVED",
  "JOB_SITE_WORKER_ASSIGNMENT_CREATED",
  "JOB_SITE_WORKER_ASSIGNMENT_ARCHIVED",
  "ORGANIZATION_INVITATION_CREATED",
  "ORGANIZATION_INVITATION_REVOKED",
  "ORGANIZATION_INVITATION_ACCEPTED",
  "ORGANIZATION_MEMBERSHIP_REVOKED",
  "DATA_EXPORT_GENERATED",
  "DATA_EXPORT_FAILED",
  "DATA_CONTROL_JOB_CREATED",
  "DATA_CONTROL_JOB_RUN",
  "ORPHAN_BLOB_CLEANUP_RUN",
  "ORGANIZATION_DELETE_REQUESTED",
  "ORGANIZATION_DELETE_RUN",
  "DOCUMENT_REQUIREMENT_CREATED",
  "DOCUMENT_REQUIREMENT_UPDATED",
  "DOCUMENT_REQUIREMENT_ARCHIVED",
  "SECURITY_DENIED",
] as const;
export type AuditAction = (typeof auditActions)[number];

export const auditEntityTypes = [
  "DOCUMENT",
  "DOCUMENT_VERSION",
  "DEADLINE",
  "CALENDAR_EVENT",
  "WORKER",
  "JOB_SITE",
  "CHECKLIST",
  "CHECKLIST_ITEM",
  "EVIDENCE",
  "DOCUMENT_PACKAGE",
  "DOCUMENT_PACKAGE_ITEM",
  "SHARE_LINK",
  "NOTIFICATION",
  "EMAIL_DELIVERY",
  "NOTIFICATION_PREFERENCE",
  "DATA_CONTROL_JOB",
  "DOCUMENT_REQUIREMENT",
  "WORKER_USER_LINK",
  "JOB_SITE_USER_ASSIGNMENT",
  "JOB_SITE_WORKER_ASSIGNMENT",
  "ORGANIZATION_INVITATION",
  "ORGANIZATION_MEMBERSHIP",
  "ORGANIZATION",
  "USER",
  "SYSTEM",
] as const;
export type AuditEntityType = (typeof auditEntityTypes)[number];

export const auditOutcomes = ["SUCCESS", "DENIED", "FAILED"] as const;
export type AuditOutcome = (typeof auditOutcomes)[number];

export type AuditMetadataValue = string | number | boolean | null;
export type AuditMetadata = Record<string, AuditMetadataValue>;

export interface OrganizationSummary {
  id: EntityId;
  name: string;
  code: string;
}

export interface WorkspaceCompanyContext {
  role: OrganizationRole;
  organization: OrganizationSummary;
}

export interface SupportContext {
  sessionId: EntityId;
  reason: string;
  expiresAt: string;
  sensitiveConfirmedUntil: string | null;
  organization: OrganizationSummary;
}

export interface WorkspaceAccessContext {
  userId: EntityId;
  platformRole: PlatformRole;
  company: WorkspaceCompanyContext | null;
  support: SupportContext | null;
  permissions: Permission[];
}

export interface CreateOrganizationInput { name: string }
export interface CreateInvitationInput { email: string; role: Exclude<OrganizationRole, "OWNER"> }
export interface AcceptInvitationInput { token: string }
export interface OpenSupportSessionInput { organizationCode: string; reason: string }

export interface BlobMetadata {
  originalFileName: string;
  mimeType: string;
  size: number;
  checksum?: string | null;
}

export interface WorkerSummary {
  id: EntityId;
  organizationId: EntityId;
  displayName: string;
  email?: string | null;
  phone?: string | null;
  roleLabel?: string | null;
  status: RecordStatus;
}

export interface WorkerResponse {
  id: EntityId;
  organizationId: EntityId;
  displayName: string;
  email?: string | null;
  phone?: string | null;
  roleLabel?: string | null;
  status: RecordStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface CreateWorkerInput {
  displayName: string;
  email?: string | null;
  phone?: string | null;
  roleLabel?: string | null;
  status?: RecordStatus;
  notes?: string | null;
}

export interface UpdateWorkerInput {
  displayName?: string;
  email?: string | null;
  phone?: string | null;
  roleLabel?: string | null;
  status?: RecordStatus;
  notes?: string | null;
}

export interface ArchiveWorkerResponse {
  worker: WorkerResponse;
  archived: true;
}

export interface JobSiteSummary {
  id: EntityId;
  organizationId: EntityId;
  name: string;
  address?: string | null;
  clientName?: string | null;
  status: RecordStatus;
  operationalPhase?: JobSiteOperationalPhase | null;
}

export interface JobSiteResponse {
  id: EntityId;
  organizationId: EntityId;
  name: string;
  address?: string | null;
  clientName?: string | null;
  status: RecordStatus;
  operationalPhase?: JobSiteOperationalPhase | null;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface CreateJobSiteInput {
  name: string;
  address?: string | null;
  clientName?: string | null;
  status?: RecordStatus;
  operationalPhase: JobSiteOperationalPhase;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  managerUserIds?: EntityId[];
  workerIds?: EntityId[];
  continueAfterDuplicateWarning?: boolean;
}

export interface UpdateJobSiteInput {
  name?: string;
  address?: string | null;
  clientName?: string | null;
  status?: RecordStatus;
  operationalPhase?: JobSiteOperationalPhase | null;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
}

export interface ArchiveJobSiteResponse {
  jobSite: JobSiteResponse;
  archived: true;
}

export interface WorkerUserLinkResponse {
  id: EntityId;
  workerId: EntityId;
  userId: EntityId;
  linkedById: EntityId;
  workerDisplayName: string;
  userLabel: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface CreateWorkerUserLinkInput {
  workerId: EntityId;
  userId: EntityId;
}

export interface ArchiveWorkerUserLinkResponse {
  link: WorkerUserLinkResponse;
  archived: true;
}

export interface JobSiteUserAssignmentResponse {
  id: EntityId;
  jobSiteId: EntityId;
  userId: EntityId;
  assignmentRole: JobSiteUserAssignmentRole;
  assignedById: EntityId;
  jobSiteName: string;
  userLabel: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface CreateJobSiteUserAssignmentInput {
  jobSiteId: EntityId;
  userId: EntityId;
}

export interface ArchiveJobSiteUserAssignmentResponse {
  assignment: JobSiteUserAssignmentResponse;
  archived: true;
}

export interface JobSiteWorkerAssignmentResponse {
  id: EntityId;
  jobSiteId: EntityId;
  workerId: EntityId;
  assignedById: EntityId;
  jobSiteName: string;
  workerDisplayName: string;
  workerRoleLabel?: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface CreateJobSiteWorkerAssignmentInput {
  jobSiteId: EntityId;
  workerId: EntityId;
}

export interface ArchiveJobSiteWorkerAssignmentResponse {
  assignment: JobSiteWorkerAssignmentResponse;
  archived: true;
}

export interface MyResourceScopeResponse {
  role: OrganizationRole;
  worker?: {
    id: EntityId;
    displayName: string;
    roleLabel?: string | null;
    status: RecordStatus;
  } | null;
  jobSites: Array<{
    id: EntityId;
    name: string;
    status: RecordStatus;
  }>;
  generatedAt: string;
}

export interface DocumentTypeSummary {
  id: EntityId;
  organizationId: EntityId;
  name: string;
  appliesTo: DocumentTypeAppliesTo;
  categoryKey: DocumentCategoryKey;
  categoryLabel: string;
  sensitivity: DocumentSensitivity;
  requiresExpiryDate: boolean;
}

export const jobSiteAttentionStates = [
  "MISSING_DOCUMENTS",
  "EXPIRED_DOCUMENTS",
  "DOCUMENTS_TO_REVIEW",
  "OPEN_CHECKLIST_ITEMS",
  "OVERDUE_DEADLINES",
  "UPCOMING_DEADLINES",
  "NO_MANAGER",
  "NO_WORKERS",
  "READY_PACKAGES",
] as const;
export type JobSiteAttentionState = (typeof jobSiteAttentionStates)[number];

export interface JobSiteOperationalSummary {
  missingDocuments: number;
  expiredDocuments: number;
  documentsToReview: number;
  openChecklistItems: number;
  checklistItemsToReview: number;
  overdueDeadlines: number;
  upcomingDeadlines: number;
  managerCount: number;
  workerCount: number;
  readyPackages: number;
  attentionScore: number;
  attentionStates: JobSiteAttentionState[];
  nextDeadline: { title: string; dueDate: string } | null;
}

export interface JobSiteOperationalListItem extends JobSiteResponse {
  summary: JobSiteOperationalSummary;
}

export interface JobSiteListResponse {
  items: JobSiteOperationalListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  generatedAt: string;
}

export interface JobSiteRecentActivity {
  id: EntityId;
  jobSiteId: EntityId;
  jobSiteName: string;
  kind: "DOCUMENT" | "CHECKLIST" | "EVIDENCE" | "DOCUMENT_PACKAGE";
  label: string;
  updatedAt: string;
  href: string;
}

export interface JobSiteOverviewResponse {
  phaseCounts: Record<JobSiteOperationalPhase | "UNSET", number>;
  totals: JobSiteOperationalSummary & { activeJobSites: number };
  attentionQueue: JobSiteOperationalListItem[];
  recentActivity: JobSiteRecentActivity[];
  generatedAt: string;
}

export const jobSiteDetailSections = ["overview", "documents", "people", "activities", "evidence", "sharing", "settings"] as const;
export type JobSiteDetailSection = (typeof jobSiteDetailSections)[number];

export interface DocumentSummary {
  id: EntityId;
  organizationId: EntityId;
  documentTypeId?: EntityId | null;
  documentTypeName?: string | null;
  categoryKey: DocumentCategoryKey;
  categoryLabel: string;
  sensitivity: DocumentSensitivity;
  ownerType: DocumentOwnerType;
  workerId?: EntityId | null;
  jobSiteId?: EntityId | null;
  title: string;
  status: DocumentStatus;
  expiryDate?: string | null;
  worker?: { id: EntityId; displayName: string } | null;
  jobSite?: { id: EntityId; name: string } | null;
}

export interface DocumentVersionSummary extends BlobMetadata {
  id: EntityId;
  organizationId: EntityId;
  documentId: EntityId;
  uploadedById: EntityId;
  createdAt: string;
}

export interface DocumentVersionResponse {
  id: EntityId;
  organizationId: EntityId;
  documentId: EntityId;
  originalFileName: string;
  mimeType: string;
  size: number;
  checksum?: string | null;
  uploadedById: EntityId;
  createdAt: string;
  archivedAt?: string | null;
}

export interface UploadDocumentVersionResponse {
  version: DocumentVersionResponse;
}

export interface ArchiveDocumentVersionResponse {
  version: DocumentVersionResponse;
  archived: true;
}

export interface DocumentRequirementSummary {
  id: EntityId;
  organizationId: EntityId;
  name: string;
  description?: string | null;
  targetType: RequirementTargetType;
  documentTypeId?: EntityId | null;
  documentTypeName?: string | null;
  jobSiteId?: EntityId | null;
  jobSiteName?: string | null;
  isRequired: boolean;
  createdAt?: string;
  updatedAt?: string;
  archivedAt?: string | null;
}

export interface CreateDocumentRequirementInput {
  name: string;
  description?: string | null;
  targetType: RequirementTargetType;
  documentTypeId: EntityId;
  jobSiteId?: EntityId | null;
  isRequired?: boolean;
}

export interface UpdateDocumentRequirementInput {
  name?: string;
  description?: string | null;
  targetType?: RequirementTargetType;
  documentTypeId?: EntityId;
  jobSiteId?: EntityId | null;
  isRequired?: boolean;
}

export interface ArchiveDocumentRequirementResponse {
  requirement: DocumentRequirementSummary;
  archived: true;
}

export interface MissingDocumentRequirementItem {
  id: string;
  requirementId: EntityId;
  requirementName: string;
  documentTypeId: EntityId;
  documentTypeName: string;
  categoryKey: DocumentCategoryKey;
  categoryLabel: string;
  targetType: RequirementTargetType;
  ownerType: DocumentOwnerType;
  workerId?: EntityId | null;
  workerName?: string | null;
  jobSiteId?: EntityId | null;
  jobSiteName?: string | null;
  ownerLabel: string;
}

export interface MissingDocumentRequirementsResponse {
  items: MissingDocumentRequirementItem[];
  generatedAt: string;
}

export interface DeadlineSummary {
  id: EntityId;
  organizationId: EntityId;
  title: string;
  dueDate: string;
  sourceType: DeadlineSourceType;
  status: DeadlineStatus;
  documentId?: EntityId | null;
  workerId?: EntityId | null;
  jobSiteId?: EntityId | null;
  remindAt?: string | null;
}

export interface ChecklistSummary {
  id: EntityId;
  organizationId: EntityId;
  jobSiteId?: EntityId | null;
  name: string;
  status: RecordStatus;
}

export interface ChecklistResponse {
  id: EntityId;
  organizationId: EntityId;
  jobSiteId?: EntityId | null;
  name: string;
  description?: string | null;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  items?: ChecklistItemResponse[];
}

export interface CreateChecklistInput {
  name: string;
  description?: string | null;
  jobSiteId?: EntityId | null;
  status?: RecordStatus;
}

export interface UpdateChecklistInput {
  name?: string;
  description?: string | null;
  jobSiteId?: EntityId | null;
  status?: RecordStatus;
}

export interface ArchiveChecklistResponse {
  checklist: ChecklistResponse;
  archived: true;
}

export interface ChecklistItemSummary {
  id: EntityId;
  organizationId: EntityId;
  checklistId: EntityId;
  label: string;
  status: ChecklistItemStatus;
  completedAt?: string | null;
  completedById?: EntityId | null;
}

export interface ChecklistItemResponse {
  id: EntityId;
  organizationId: EntityId;
  checklistId: EntityId;
  label: string;
  description?: string | null;
  status: ChecklistItemStatus;
  completedAt?: string | null;
  completedById?: EntityId | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChecklistItemInput {
  label: string;
  description?: string | null;
  status?: ChecklistItemStatus;
}

export interface UpdateChecklistItemInput {
  label?: string;
  description?: string | null;
  status?: ChecklistItemStatus;
}

export interface CompleteChecklistItemInput {
  status: Extract<ChecklistItemStatus, "DONE" | "OPEN" | "TO_REVIEW">;
}

export interface ArchiveChecklistItemResponse {
  item: ChecklistItemResponse;
  archived: true;
}

export interface EvidenceSummary {
  id: EntityId;
  organizationId: EntityId;
  type: EvidenceType;
  title: string;
  jobSiteId?: EntityId | null;
  workerId?: EntityId | null;
  checklistItemId?: EntityId | null;
  hasFile: boolean;
  createdById: EntityId;
  createdAt: string;
}

export interface EvidenceResponse {
  id: EntityId;
  organizationId: EntityId;
  jobSiteId?: EntityId | null;
  workerId?: EntityId | null;
  checklistItemId?: EntityId | null;
  type: EvidenceType;
  title: string;
  description?: string | null;
  hasFile: boolean;
  originalFileName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  createdById: EntityId;
  createdAt: string;
  archivedAt?: string | null;
}

export interface CreateEvidenceInput {
  type: EvidenceType;
  title: string;
  description?: string | null;
  jobSiteId?: EntityId | null;
  workerId?: EntityId | null;
  checklistItemId?: EntityId | null;
}

export interface UpdateEvidenceInput {
  title?: string;
  description?: string | null;
}

export interface UploadEvidenceResponse {
  evidence: EvidenceResponse;
}

export interface ArchiveEvidenceResponse {
  evidence: EvidenceResponse;
  archived: true;
}

export interface DocumentPackageSummary {
  id: EntityId;
  organizationId: EntityId;
  jobSiteId?: EntityId | null;
  title: string;
  status: DocumentPackageStatus;
  createdById: EntityId;
}

export interface DocumentPackageItemSummary {
  id: EntityId;
  organizationId: EntityId;
  documentPackageId: EntityId;
  itemType: DocumentPackageItemType;
  documentId?: EntityId | null;
  documentVersionId?: EntityId | null;
  evidenceId?: EntityId | null;
  checklistId?: EntityId | null;
  note?: string | null;
  position: number;
}

export interface ShareLinkSummary {
  id: EntityId;
  organizationId: EntityId;
  documentPackageId: EntityId;
  expiresAt?: string | null;
  revokedAt?: string | null;
  lastAccessedAt?: string | null;
}

export interface DocumentPackageResponse {
  id: EntityId;
  organizationId: EntityId;
  jobSiteId?: EntityId | null;
  title: string;
  description?: string | null;
  status: DocumentPackageStatus;
  createdById: EntityId;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  items?: DocumentPackageItemResponse[];
}

export interface CreateDocumentPackageInput {
  title: string;
  description?: string | null;
  jobSiteId?: EntityId | null;
  status?: DocumentPackageStatus;
}

export interface UpdateDocumentPackageInput {
  title?: string;
  description?: string | null;
  jobSiteId?: EntityId | null;
  status?: DocumentPackageStatus;
}

export interface ArchiveDocumentPackageResponse {
  package: DocumentPackageResponse;
  archived: true;
}

export interface DocumentPackageItemResponse {
  id: EntityId;
  organizationId: EntityId;
  documentPackageId: EntityId;
  itemType: DocumentPackageItemType;
  documentId?: EntityId | null;
  documentVersionId?: EntityId | null;
  evidenceId?: EntityId | null;
  checklistId?: EntityId | null;
  note?: string | null;
  position: number;
  createdAt: string;
}

export interface AddDocumentPackageItemInput {
  itemType: DocumentPackageItemType;
  documentId?: EntityId | null;
  documentVersionId?: EntityId | null;
  evidenceId?: EntityId | null;
  checklistId?: EntityId | null;
  note?: string | null;
  position?: number | null;
}

export interface UpdateDocumentPackageItemInput {
  position?: number;
}

export interface RemoveDocumentPackageItemResponse {
  item: DocumentPackageItemResponse;
  removed: true;
}

export interface ShareLinkResponse {
  id: EntityId;
  organizationId: EntityId;
  documentPackageId: EntityId;
  expiresAt?: string | null;
  revokedAt?: string | null;
  createdById: EntityId;
  createdAt: string;
  lastAccessedAt?: string | null;
}

export interface CreateShareLinkInput {
  expiresAt?: string | null;
}

export interface CreateShareLinkResponse {
  shareLink: ShareLinkResponse;
  token: string;
}

export interface RevokeShareLinkResponse {
  shareLink: ShareLinkResponse;
  revoked: true;
}

export interface SharedDocumentPackageResponse {
  id: EntityId;
  title: string;
  description?: string | null;
  status: DocumentPackageStatus;
  updatedAt: string;
  items: SharedDocumentPackageItemResponse[];
}

export interface SharedDocumentPackageItemResponse {
  id: EntityId;
  itemType: DocumentPackageItemType;
  position: number;
  title?: string | null;
  status?: string | null;
  note?: string | null;
  hasFile: boolean;
  originalFileName?: string | null;
  mimeType?: string | null;
  size?: number | null;
}

export interface NotificationResponse {
  id: EntityId;
  userId?: EntityId | null;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  sourceType: NotificationSourceType;
  sourceId?: EntityId | null;
  actionHref?: string | null;
  readAt?: string | null;
  dismissedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  unreadCount: number;
  generatedAt: string;
}

export interface MarkNotificationReadResponse {
  notification: NotificationResponse;
  read: true;
}

export interface DismissNotificationResponse {
  notification: NotificationResponse;
  dismissed: true;
}

export interface ReminderSyncResponse {
  created: number;
  updated: number;
  skipped: number;
  generatedAt: string;
}

export interface EmailDigestPreviewItem {
  id: EntityId;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  actionHref?: string | null;
  createdAt: string;
}

export interface EmailDigestPreviewResponse {
  subject: string;
  intro: string;
  unreadCount: number;
  items: EmailDigestPreviewItem[];
  workspaceHref: string;
  footer: string;
  generatedAt: string;
}

export interface SendEmailDigestResponse {
  sent: true;
  notificationCount: number;
  generatedAt: string;
}

export interface SendNotificationEmailResponse {
  sent: true;
  notification: NotificationResponse;
  generatedAt: string;
}

export interface NotificationPreferenceResponse {
  id: EntityId;
  emailDigestEnabled: boolean;
  emailDigestFrequency: EmailDigestFrequency;
  emailDigestHour: number;
  deadlineNotificationsEnabled: boolean;
  documentNotificationsEnabled: boolean;
  packageNotificationsEnabled: boolean;
  systemNotificationsEnabled: boolean;
  lastDigestSentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationPreferenceInput {
  emailDigestEnabled?: boolean;
  emailDigestFrequency?: EmailDigestFrequency;
  emailDigestHour?: number;
  deadlineNotificationsEnabled?: boolean;
  documentNotificationsEnabled?: boolean;
  packageNotificationsEnabled?: boolean;
  systemNotificationsEnabled?: boolean;
}

export interface UpdateNotificationPreferenceResponse {
  preference: NotificationPreferenceResponse;
  updated: true;
}

export interface NotificationEmailDeliveryResponse {
  id: EntityId;
  type: NotificationEmailDeliveryType;
  notificationId?: EntityId | null;
  notificationCount: number;
  status: NotificationEmailDeliveryStatus;
  errorCode?: string | null;
  sentAt?: string | null;
  createdAt: string;
}

export interface NotificationEmailDeliveryListResponse {
  deliveries: NotificationEmailDeliveryResponse[];
  generatedAt: string;
}

export interface ScheduledEmailDigestRunResponse {
  scanned: number;
  sent: number;
  failed: number;
  skipped: number;
  generatedAt: string;
}

export interface AuditLogEventResponse {
  id: EntityId;
  actorUserId?: EntityId | null;
  actorRole?: OrganizationRole | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: EntityId | null;
  outcome: AuditOutcome;
  metadata?: AuditMetadata | null;
  requestId?: string | null;
  supportSessionId?: EntityId | null;
  createdAt: string;
}

export interface AuditLogFilters {
  action?: AuditAction;
  entityType?: AuditEntityType;
  outcome?: AuditOutcome;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}

export interface AuditLogListResponse {
  events: AuditLogEventResponse[];
  nextCursor?: string | null;
  generatedAt: string;
}

export interface DataRecordCount {
  total: number;
  active?: number;
  archived?: number;
}

export interface DataShareLinkCounts {
  total: number;
  active: number;
  expired: number;
  revoked: number;
}

export interface DataNotificationCounts {
  total: number;
  unread: number;
  read: number;
  dismissed: number;
}

export interface DataInventoryResponse {
  generatedAt: string;
  counts: {
    workers: DataRecordCount;
    jobSites: DataRecordCount;
    documentTypes: DataRecordCount;
    documentRequirements: DataRecordCount;
    documents: DataRecordCount;
    documentVersions: DataRecordCount;
    deadlines: DataRecordCount;
    calendarEvents: DataRecordCount;
    checklists: DataRecordCount;
    checklistItems: DataRecordCount;
    evidence: DataRecordCount;
    documentPackages: DataRecordCount;
    documentPackageItems: DataRecordCount;
    shareLinks: DataShareLinkCounts;
    notifications: DataNotificationCounts;
    notificationPreferences: DataRecordCount;
    emailDeliveries: DataRecordCount;
    auditEvents: DataRecordCount;
    workerUserLinks: DataRecordCount;
    jobSiteUserAssignments: DataRecordCount;
    jobSiteWorkerAssignments: DataRecordCount;
    memberProfiles: DataRecordCount;
    memberships: DataRecordCount;
    invitations: DataRecordCount;
    dataControlJobs: DataRecordCount;
    supportSessions: DataRecordCount;
    supportEvents: DataRecordCount;
    authProviders: DataRecordCount;
    authSessions: DataRecordCount;
    authCredentials: DataRecordCount;
    authCodes: DataRecordCount;
    mfaRecoveryRequests: DataRecordCount;
    authDevices: DataRecordCount;
    mfaBackupCodes: DataRecordCount;
    securityAuditEvents: DataRecordCount;
    authRateLimits: DataRecordCount;
  };
}

export interface DataExportMemberProfile {
  id: EntityId;
  name?: string | null;
  email: string;
  emailVerified?: string | null;
  firstName: string;
  lastName?: string | null;
  username: string;
  usernameOnboarded: boolean;
  profileOnboarded: boolean;
  phoneNumber?: string | null;
  platformRole: PlatformRole;
  authVersion: number;
  suspendedAt?: string | null;
  suspensionReason?: string | null;
  mfaEnabled: boolean;
  totpPendingCreatedAt?: string | null;
  totpVerifiedAt?: string | null;
  usernameChangedAt?: string | null;
  hasAvatar: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DataExportOrganizationMembership {
  id: EntityId;
  userId: EntityId;
  role: OrganizationRole;
  createdAt: string;
  updatedAt: string;
  revokedAt?: string | null;
}

export interface DataExportOrganizationInvitation {
  id: EntityId;
  workerId?: EntityId | null;
  email: string;
  role: OrganizationRole;
  invitedById: EntityId;
  expiresAt: string;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
}

export interface DataExportDocumentType extends DocumentTypeSummary {
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface DataExportDocumentRequirement extends Omit<DocumentRequirementSummary, "documentTypeName" | "jobSiteName"> {
  createdAt: string;
  updatedAt: string;
}

export interface DataExportDataControlJob extends DataControlJobResponse {
  attemptCount: number;
  nextAttemptAt: string;
}

export interface DataExportCalendarEvent {
  id: EntityId;
  organizationId: EntityId;
  title: string;
  description?: string | null;
  startAt: string;
  endAt: string;
  allDay: boolean;
  kind: CalendarEventKind;
  priority: CalendarEventPriority;
  status: CalendarEventStatus;
  source: CalendarEventSource;
  externalUid?: string | null;
  assignedToId?: EntityId | null;
  jobSiteId?: EntityId | null;
  createdById: EntityId;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface DataExportSupportSession {
  id: EntityId;
  actorId: EntityId;
  reason: string;
  expiresAt: string;
  sensitiveConfirmedUntil?: string | null;
  endedAt?: string | null;
  createdAt: string;
}

export interface DataExportSupportEvent {
  id: EntityId;
  supportSessionId: EntityId;
  actorId: EntityId;
  action: SupportAuditAction;
  resourceType: string;
  resourceId?: EntityId | null;
  metadata?: AuditMetadata | null;
  createdAt: string;
}

export interface DataExportAuthData {
  providers: Array<{ userId: EntityId; type: string; provider: string }>;
  sessions: Array<{ userId: EntityId; expiresAt: string }>;
  credentials: Array<{ userId: EntityId; passwordUpdatedAt: string; passwordResetRequired: boolean; createdAt: string; updatedAt: string }>;
  codes: Array<{ id: EntityId; userId?: EntityId | null; email: string; purpose: AuthCodePurpose; attempts: number; maxAttempts: number; expiresAt: string; consumedAt?: string | null; metadata?: AuditMetadata | null; createdAt: string }>;
  mfaRecoveryRequests: Array<{ id: EntityId; userId: EntityId; mode: MfaRecoveryMode; status: MfaRecoveryStatus; emailVerifiedAt: string; expiresAt: string; approvedById?: EntityId | null; approvedAt?: string | null; deniedById?: EntityId | null; deniedAt?: string | null; setupStartedAt?: string | null; completedAt?: string | null; createdAt: string; updatedAt: string }>;
  devices: Array<{ id: EntityId; userId: EntityId; label?: string | null; firstSeenAt: string; lastSeenAt: string; createdAt: string; updatedAt: string }>;
  backupCodes: Array<{ id: EntityId; userId: EntityId; usedAt?: string | null; createdAt: string }>;
  securityEvents: Array<{ id: EntityId; userId?: EntityId | null; email?: string | null; type: string; metadata?: AuditMetadata | null; createdAt: string }>;
  rateLimits: Array<{ userId: EntityId; bucket: string; count: number; resetAt: string; createdAt: string; updatedAt: string }>;
}

export interface DataExportResponse {
  exportedAt: string;
  organization: {
    id: EntityId;
    name: string;
    code: string;
    createdById?: EntityId | null;
    createdAt: string;
    updatedAt: string;
  };
  counts: DataInventoryResponse["counts"];
  memberProfiles: DataExportMemberProfile[];
  memberships: DataExportOrganizationMembership[];
  invitations: DataExportOrganizationInvitation[];
  documentTypes: DataExportDocumentType[];
  documentRequirements: DataExportDocumentRequirement[];
  workers: WorkerResponse[];
  jobSites: JobSiteResponse[];
  documents: Array<DocumentSummary & { notes?: string | null; reviewedAt?: string | null; reviewedById?: EntityId | null; createdAt: string; updatedAt: string; archivedAt?: string | null }>;
  documentVersions: DocumentVersionResponse[];
  deadlines: Array<DeadlineSummary & { notes?: string | null; createdAt: string; updatedAt: string; archivedAt?: string | null }>;
  calendarEvents: DataExportCalendarEvent[];
  checklists: ChecklistResponse[];
  checklistItems: ChecklistItemResponse[];
  evidence: EvidenceResponse[];
  documentPackages: DocumentPackageResponse[];
  documentPackageItems: DocumentPackageItemResponse[];
  shareLinks: ShareLinkResponse[];
  notifications: NotificationResponse[];
  notificationPreferences: Array<NotificationPreferenceResponse & { userId: EntityId }>;
  emailDeliveries: Array<NotificationEmailDeliveryResponse & { userId: EntityId; recipientEmail: string }>;
  auditEvents: AuditLogEventResponse[];
  dataControlJobs: DataExportDataControlJob[];
  supportSessions: DataExportSupportSession[];
  supportEvents: DataExportSupportEvent[];
  auth: DataExportAuthData;
  assignments: {
    workerUserLinks: Array<{ id: EntityId; workerId: EntityId; userId: EntityId; linkedById: EntityId; createdAt: string; updatedAt: string; archivedAt?: string | null }>;
    jobSiteUserAssignments: Array<{ id: EntityId; jobSiteId: EntityId; userId: EntityId; assignmentRole: JobSiteUserAssignmentRole; assignedById: EntityId; createdAt: string; updatedAt: string; archivedAt?: string | null }>;
    jobSiteWorkerAssignments: Array<{ id: EntityId; jobSiteId: EntityId; workerId: EntityId; assignedById: EntityId; createdAt: string; updatedAt: string; archivedAt?: string | null }>;
  };
}

export interface DataControlJobResponse {
  id: EntityId;
  organizationId: EntityId;
  requestedById: EntityId;
  type: DataControlJobType;
  status: DataControlJobStatus;
  resultSummary?: Record<string, unknown> | null;
  errorCode?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface DataControlJobListResponse {
  jobs: DataControlJobResponse[];
  generatedAt: string;
}

export interface CreateDataExportJobResponse {
  job: DataControlJobResponse;
  created: boolean;
}

export interface RunDataControlJobsResponse {
  scanned: number;
  completed: number;
  failed: number;
  skipped: number;
  generatedAt: string;
}

export interface CreateOrganizationDeletionJobInput {
  organizationCode: string;
  confirmation: string;
}

export interface CreateOrganizationDeletionJobResponse {
  job: DataControlJobResponse;
  created: boolean;
}

export interface BlobOrphanDryRunResponse {
  scanned: number;
  referenced: number;
  orphanCount: number;
  deletableCount: number;
  generatedAt: string;
}

export interface BlobOrphanCleanupResponse {
  job: DataControlJobResponse;
  created: boolean;
}

export interface DataRetentionCandidate {
  key: string;
  title: string;
  description: string;
  count: number;
}

export interface DataRetentionOverviewResponse {
  generatedAt: string;
  notice: string;
  thresholds: {
    readNotificationDays: number;
    emailDeliveryDays: number;
    auditReviewDays: number;
  };
  candidates: DataRetentionCandidate[];
}

export interface DashboardOrganizationSummary {
  name: string;
  role: OrganizationRole;
  roleLabel: string;
  viewLabel: string;
}

export interface DashboardAttentionCounts {
  missing: number;
  expired: number;
  expiringSoon: number;
  toReview: number;
}

export type DashboardSituationKind = "EXPIRED" | "EXPIRING_SOON" | "MISSING" | "TO_REVIEW";
export type DashboardContextKind = "ORGANIZATION" | "WORKER" | "JOB_SITE" | "DEADLINE";
export type DashboardSection = "attention" | "sharing" | "deadlines" | "contexts";

export interface DashboardAction {
  label: string;
  href: string;
}

export interface DashboardResponsibility {
  label: string;
  assignmentHref?: string | null;
}

export interface DashboardSituation {
  id: EntityId;
  kind: DashboardSituationKind;
  statusLabel: string;
  title: string;
  reason: string;
  consequence: string;
  contextKind: DashboardContextKind;
  contextId?: EntityId | null;
  contextLabel: string;
  responsibility: DashboardResponsibility;
  action: DashboardAction;
  date?: string | null;
  updatedAt: string;
}

export interface DashboardDeadlineItem {
  id: EntityId;
  title: string;
  dueDate: string;
  timingLabel: string;
  contextLabel: string;
  action: DashboardAction;
}

export interface DashboardPackageItem {
  id: EntityId;
  title: string;
  statusLabel: string;
  itemCount: number;
  hasActiveShareLink: boolean;
  shareLabel: string;
  updatedAt: string;
  action: DashboardAction;
}

export interface DashboardContextItem {
  id: EntityId;
  kind: Exclude<DashboardContextKind, "DEADLINE">;
  label: string;
  situationCount: number;
  action: DashboardAction;
}

export interface DashboardSectionError {
  section: DashboardSection;
  message: string;
}

export interface DashboardResponse {
  generatedAt: string;
  organization: DashboardOrganizationSummary;
  attention: {
    total: number;
    counts: DashboardAttentionCounts;
    situations: DashboardSituation[];
  };
  readyPackages: DashboardPackageItem[];
  upcomingDeadlines: DashboardDeadlineItem[];
  contexts: DashboardContextItem[];
  availability: {
    sharing: boolean;
    contexts: boolean;
  };
  firstUse: boolean;
  errors: DashboardSectionError[];
}
