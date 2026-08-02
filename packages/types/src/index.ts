/** Shared platform-neutral contracts for the Qoovex Organization domain. */
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
export const organizationResourceTypes = ["JOB_SITE", "WORKER", "DOCUMENT", "DOCUMENT_TYPE", "DOCUMENT_PACKAGE", "OPERATIONAL_PROCESS", "OPERATIONAL_DECISION", "OPERATIONAL_EXCEPTION", "EVIDENCE", "CHECKLIST", "SHARE_LINK"] as const;
export type OrganizationResourceType = (typeof organizationResourceTypes)[number];

export type SupportAuditAction = "READ" | "WRITE" | "SENSITIVE" | "EXPORT";
export type AuthCodePurpose = "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "EMAIL_CHANGE" | "MFA_ENROLLMENT" | "MFA_RECOVERY";
export type MfaRecoveryMode = "SELF_EMAIL" | "OWNER_APPROVAL";
export type MfaRecoveryStatus = "PENDING" | "APPROVED" | "DENIED" | "SETUP_STARTED" | "COMPLETED" | "EXPIRED";

export const organizationPermissions = [
  "organization:read",
  "organization:update",
  "organizationProfile:read",
  "organizationProfile:update",
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
  "documents:file:read",
  "documents:upload",
  "documents:update",
  "documents:verify",
  "documents:expiry:manage",
  "documents:packages:add",
  "documents:sensitive:read",
  "documents:archive",
  "deadlines:read",
  "deadlines:manage",
  "calendar:read",
  "calendar:manage",
  "checklists:read",
  "checklists:manage",
  "checklists:complete",
  "evidence:read",
  "evidence:file:read",
  "evidence:sensitive:read",
  "evidence:review",
  "evidence:upload",
  "evidence:delete",
  "documentPackages:read",
  "documentPackages:create",
  "documentPackages:update",
  "documentPackages:review",
  "documentPackages:approve",
  "documentPackages:share",
  "documentPackages:revoke",
  "documentPackages:access:read",
  "processes:read",
  "processes:timeline:read",
  "processes:decide",
  "processes:exceptions:resolve",
  "processes:retry",
  "auditLog:read",
  "assignments:read",
  "assignments:manage",
  "requests:read",
  "requests:create",
  "requests:manage",
  "contextMessages:read",
  "contextMessages:create",
  "documentSources:read",
  "documentSources:manage",
  "documentSources:check",
  "settings:update",
] as const;
export type OrganizationPermission = (typeof organizationPermissions)[number];

export const permissions = organizationPermissions;
export type Permission = OrganizationPermission;

export const recordStatuses = ["ACTIVE", "ARCHIVED"] as const;
export type RecordStatus = (typeof recordStatuses)[number];

export const jobSiteOperationalPhases = ["DRAFT", "PREPARATION", "IN_PROGRESS", "PAUSED", "CLOSING", "COMPLETED"] as const;
export type JobSiteOperationalPhase = (typeof jobSiteOperationalPhases)[number];

export const jobSiteOperationalPhaseLabels: Record<JobSiteOperationalPhase, string> = {
  DRAFT: "Bozza",
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

export const documentPackageEffectiveStates = ["DRAFT", "PREPARING", "INCOMPLETE", "TO_VERIFY", "READY_FOR_REVIEW", "APPROVED", "SHARED", "UPDATED_AFTER_SHARING", "EXPIRED", "REVOKED", "ARCHIVED"] as const;
export type DocumentPackageEffectiveState = (typeof documentPackageEffectiveStates)[number];
export type DocumentPackageRevisionOrigin = "AUTOMATED_PREPARATION" | "LEGACY_BACKFILL";
export type DocumentPackageRevisionStatus = "PREPARED" | "APPROVED";
export type DocumentPackageShareProposalTarget = "NAMED_RECIPIENT" | "LINK_PURPOSE";
export type DocumentPackageShareProposalStatus = "PREPARING" | "READY_FOR_REVIEW" | "BLOCKED" | "APPROVED" | "PUBLISHED";

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
  UNCLASSIFIED: { key: "UNCLASSIFIED", label: "Da classificare", description: "Dato preesistente mantenuto visibile finche un utente con il permesso richiesto non ne conferma la destinazione.", appliesTo: null, availableForNewDocuments: false },
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

export const evidenceSensitivities = ["INTERNAL", "SHAREABLE", "RESTRICTED"] as const;
export type EvidenceSensitivity = (typeof evidenceSensitivities)[number];

export const evidenceReviewStatuses = ["RECORDED", "TO_REVIEW", "ACCEPTED", "REJECTED"] as const;
export type EvidenceReviewStatus = (typeof evidenceReviewStatuses)[number];

export const evidenceOrigins = ["DIRECT_UPLOAD", "GUIDED_MANUAL", "AUTHORIZED_INTEGRATION"] as const;
export type EvidenceOrigin = (typeof evidenceOrigins)[number];

export const documentVersionReviewStatuses = ["TO_REVIEW", "CURRENT", "SUPERSEDED", "REJECTED"] as const;
export type DocumentVersionReviewStatus = (typeof documentVersionReviewStatuses)[number];

export const documentPackageItemTypes = ["DOCUMENT", "DOCUMENT_VERSION", "EVIDENCE", "CHECKLIST", "NOTE", "WORKER", "JOB_SITE_USER_ASSIGNMENT", "JOB_SITE_WORKER_ASSIGNMENT", "OPERATIONAL_REQUEST", "CONTEXT_MESSAGE", "CONTEXT_TIMELINE_EVENT"] as const;
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

export const jobSiteUserAssignmentRoles = ["SITE_MANAGER", "DOCUMENT_REVIEWER", "CONTRIBUTOR"] as const;
export type JobSiteUserAssignmentRole = (typeof jobSiteUserAssignmentRoles)[number];

export const organizationContactKinds = ["GENERAL", "ADMINISTRATION", "SAFETY", "TECHNICAL"] as const;
export type OrganizationContactKind = (typeof organizationContactKinds)[number];

export const operationalRequestStatuses = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export type OperationalRequestStatus = (typeof operationalRequestStatuses)[number];

export const documentSourceTypes = ["DIRECT_UPLOAD", "GUIDED_MANUAL", "AUTHORIZED_INTEGRATION"] as const;
export type DocumentSourceType = (typeof documentSourceTypes)[number];

export const documentSourceCheckStatuses = ["PENDING", "COMPLETED", "FAILED", "NEEDS_ACTION"] as const;
export type DocumentSourceCheckStatus = (typeof documentSourceCheckStatuses)[number];

export const documentAcquisitionStatuses = ["PENDING_REVIEW", "COMPLETED", "FAILED"] as const;
export type DocumentAcquisitionStatus = (typeof documentAcquisitionStatuses)[number];

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
  "ORGANIZATION_PROFILE_UPDATED",
  "ORGANIZATION_CONTACT_CREATED",
  "ORGANIZATION_CONTACT_UPDATED",
  "ORGANIZATION_CONTACT_ARCHIVED",
  "DOCUMENT_JOB_SITE_LINK_CREATED",
  "DOCUMENT_JOB_SITE_LINK_ARCHIVED",
  "DOCUMENT_VERSION_REVIEWED",
  "EVIDENCE_UPDATED",
  "EVIDENCE_REVIEWED",
  "OPERATIONAL_REQUEST_CREATED",
  "OPERATIONAL_REQUEST_UPDATED",
  "CONTEXT_MESSAGE_CREATED",
  "DOCUMENT_SOURCE_POLICY_CREATED",
  "DOCUMENT_SOURCE_POLICY_UPDATED",
  "DOCUMENT_SOURCE_CHECK_CREATED",
  "DOCUMENT_SOURCE_CHECK_UPDATED",
  "DOCUMENT_ACQUISITION_CREATED",
  "JOB_SITE_PHASE_CHANGED",
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
  "OPERATIONAL_PROCESS_CREATED",
  "OPERATIONAL_PROCESS_DEDUPLICATED",
  "OPERATIONAL_STEP_CLAIMED",
  "OPERATIONAL_STEP_COMPLETED",
  "OPERATIONAL_RETRY_SCHEDULED",
  "OPERATIONAL_PROCESS_BLOCKED",
  "OPERATIONAL_PROCESS_COMPLETED",
  "OPERATIONAL_DECISION_CREATED",
  "OPERATIONAL_DECISION_RESOLVED",
  "OPERATIONAL_EXCEPTION_OPENED",
  "OPERATIONAL_EXCEPTION_RESOLVED",
  "OPERATIONAL_CONTROL_RUN",
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
  "OPERATIONAL_PROCESS",
  "OPERATIONAL_STEP",
  "OPERATIONAL_DECISION",
  "OPERATIONAL_EXCEPTION",
  "WORKER_USER_LINK",
  "JOB_SITE_USER_ASSIGNMENT",
  "JOB_SITE_WORKER_ASSIGNMENT",
  "ORGANIZATION_INVITATION",
  "ORGANIZATION_MEMBERSHIP",
  "ORGANIZATION",
  "ORGANIZATION_PROFILE",
  "ORGANIZATION_CONTACT",
  "DOCUMENT_JOB_SITE_LINK",
  "EVIDENCE_REVISION",
  "OPERATIONAL_REQUEST",
  "CONTEXT_MESSAGE",
  "CONTEXT_TIMELINE_EVENT",
  "DOCUMENT_SOURCE_POLICY",
  "DOCUMENT_SOURCE_CHECK",
  "DOCUMENT_ACQUISITION",
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

export interface OrganizationProfileResponse {
  id: EntityId;
  organizationId: EntityId;
  legalName?: string | null;
  taxCode?: string | null;
  vatNumber?: string | null;
  registeredOfficeAddress?: string | null;
  operatingDescription?: string | null;
  specializations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganizationProfileInput {
  legalName?: string | null;
  taxCode?: string | null;
  vatNumber?: string | null;
  registeredOfficeAddress?: string | null;
  operatingDescription?: string | null;
  specializations?: string[];
}

export interface OrganizationContactResponse {
  id: EntityId;
  organizationId: EntityId;
  userId?: EntityId | null;
  kind: OrganizationContactKind;
  name: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface UpsertOrganizationContactInput {
  userId?: EntityId | null;
  kind: OrganizationContactKind;
  name: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface WorkspaceCompanyContext {
  role: OrganizationRole;
  preset?: OrganizationAccessPreset | null;
  scopeMode?: OrganizationScopeMode;
  expiresAt?: string | null;
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
  devView?: DevWorkspaceView | null;
  company: WorkspaceCompanyContext | null;
  support: SupportContext | null;
  permissions: Permission[];
}

export interface CreateOrganizationInput { name: string }
export interface OrganizationResourceGrantInput { resourceType: OrganizationResourceType; resourceId: EntityId }
export interface CreateInvitationInput {
  recipientName?: string | null;
  email: string;
  message?: string | null;
  role: "COLLABORATOR";
  preset: OrganizationAccessPreset | null;
  permissions: OrganizationPermission[];
  scopeMode: OrganizationScopeMode;
  expiresAt?: string | null;
  grants?: OrganizationResourceGrantInput[];
}
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
  assignmentStatus: "SCHEDULED" | "ACTIVE" | "ENDED" | "CANCELLED";
  operationalRoleLabel?: string | null;
  taskLabel?: string | null;
  startsAt: string;
  endsAt?: string | null;
  endedById?: EntityId | null;
  endReason?: string | null;
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
  assignmentRole?: JobSiteUserAssignmentRole;
  operationalRoleLabel?: string | null;
  taskLabel?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
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
  assignmentStatus: "SCHEDULED" | "ACTIVE" | "ENDED" | "CANCELLED";
  jobSiteName: string;
  workerDisplayName: string;
  workerRoleLabel?: string | null;
  operationalRoleLabel?: string | null;
  taskLabel?: string | null;
  startsAt: string;
  endsAt?: string | null;
  endedById?: EntityId | null;
  endReason?: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface CreateJobSiteWorkerAssignmentInput {
  jobSiteId: EntityId;
  workerId: EntityId;
  operationalRoleLabel?: string | null;
  taskLabel?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
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

export const jobSiteDetailSections = ["overview", "updates", "documents", "people", "activities", "evidence", "sharing", "settings"] as const;
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
  reviewStatus: DocumentVersionReviewStatus;
  reviewedById?: EntityId | null;
  reviewedAt?: string | null;
  reviewReason?: string | null;
  createdAt: string;
  archivedAt?: string | null;
}

export interface ReviewDocumentVersionInput {
  decision: "APPROVE" | "REJECT";
  reason?: string | null;
}

export interface DocumentJobSiteLinkResponse {
  id: EntityId;
  organizationId: EntityId;
  documentId: EntityId;
  jobSiteId: EntityId;
  purpose?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
  linkedById: EntityId;
  unlinkedAt?: string | null;
  unlinkedById?: EntityId | null;
  unlinkReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentJobSiteLinkInput {
  jobSiteId: EntityId;
  purpose?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
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
  sensitivity: EvidenceSensitivity;
  reviewStatus: EvidenceReviewStatus;
  origin: EvidenceOrigin;
  capturedAt?: string | null;
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
  sensitivity: EvidenceSensitivity;
  reviewStatus: EvidenceReviewStatus;
  origin: EvidenceOrigin;
  capturedAt?: string | null;
  reviewedById?: EntityId | null;
  reviewedAt?: string | null;
  reviewReason?: string | null;
  hasFile: boolean;
  originalFileName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  createdById: EntityId;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface CreateEvidenceInput {
  type: EvidenceType;
  title: string;
  description?: string | null;
  sensitivity?: EvidenceSensitivity;
  capturedAt?: string | null;
  origin?: Extract<EvidenceOrigin, "DIRECT_UPLOAD" | "GUIDED_MANUAL">;
  jobSiteId?: EntityId | null;
  workerId?: EntityId | null;
  checklistItemId?: EntityId | null;
}

export interface UpdateEvidenceInput {
  title?: string;
  description?: string | null;
  sensitivity?: EvidenceSensitivity;
  capturedAt?: string | null;
  reason?: string | null;
}

export interface ReviewEvidenceInput {
  decision: "REQUEST_REVIEW" | "ACCEPT" | "REJECT";
  reason?: string | null;
  sensitivity?: EvidenceSensitivity;
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
  workerId?: EntityId | null;
  jobSiteUserAssignmentId?: EntityId | null;
  jobSiteWorkerAssignmentId?: EntityId | null;
  operationalRequestId?: EntityId | null;
  contextMessageId?: EntityId | null;
  contextTimelineEventId?: EntityId | null;
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
  effectiveState?: DocumentPackageEffectiveState;
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
  workerId?: EntityId | null;
  jobSiteUserAssignmentId?: EntityId | null;
  jobSiteWorkerAssignmentId?: EntityId | null;
  operationalRequestId?: EntityId | null;
  contextMessageId?: EntityId | null;
  contextTimelineEventId?: EntityId | null;
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
  workerId?: EntityId | null;
  jobSiteUserAssignmentId?: EntityId | null;
  jobSiteWorkerAssignmentId?: EntityId | null;
  operationalRequestId?: EntityId | null;
  contextMessageId?: EntityId | null;
  contextTimelineEventId?: EntityId | null;
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
  revisionId: EntityId;
  proposalId?: EntityId | null;
  purpose?: string | null;
  recipientLabel?: string | null;
  allowDownload: boolean;
  expiresAt?: string | null;
  expiredAt?: string | null;
  revokedAt?: string | null;
  createdById: EntityId;
  createdAt: string;
  lastAccessedAt?: string | null;
}

export interface CreateShareLinkInput {
  proposalId: EntityId;
  confirmation: "APPROVE_AND_CREATE";
}

export interface CreateShareLinkResponse {
  shareLink: ShareLinkResponse;
  token: string;
}

export interface RevokeShareLinkResponse {
  shareLink: ShareLinkResponse;
  revoked: true;
  alreadyRevoked: boolean;
}

export interface SharedDocumentPackageResponse {
  id: EntityId;
  title: string;
  description?: string | null;
  status: DocumentPackageStatus;
  updatedAt: string;
  expiresAt?: string | null;
  allowDownload: boolean;
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

export interface DocumentPackageRevisionIssueDto {
  code: "MISSING_REFERENCE" | "ARCHIVED_REFERENCE" | "UNCLASSIFIED_DOCUMENT" | "SENSITIVE_DOCUMENT" | "EXPIRED_DOCUMENT" | "DOCUMENT_TO_VERIFY" | "DOCUMENT_VERSION_NOT_CURRENT" | "EVIDENCE_NOT_APPROVED" | "EVIDENCE_NOT_SHAREABLE";
  severity: "ATTENTION" | "BLOCKING";
  title: string;
  sourceItemId?: EntityId | null;
}

export interface DocumentPackageRevisionItemDto extends SharedDocumentPackageItemResponse {
  sourceItemId: EntityId;
  documentId?: EntityId | null;
  documentVersionId?: EntityId | null;
  evidenceId?: EntityId | null;
  checklistId?: EntityId | null;
  workerId?: EntityId | null;
  jobSiteUserAssignmentId?: EntityId | null;
  jobSiteWorkerAssignmentId?: EntityId | null;
  operationalRequestId?: EntityId | null;
  contextMessageId?: EntityId | null;
  contextTimelineEventId?: EntityId | null;
  included: boolean;
  exclusionReason?: string | null;
}

export interface DocumentPackageRevisionDto {
  id: EntityId;
  documentPackageId: EntityId;
  revisionNumber: number;
  origin: DocumentPackageRevisionOrigin;
  status: DocumentPackageRevisionStatus;
  fingerprint: string;
  packageTitle: string;
  packageDescription?: string | null;
  items: DocumentPackageRevisionItemDto[];
  issues: DocumentPackageRevisionIssueDto[];
  preparedAt: string;
  approvedAt?: string | null;
}

export interface DocumentPackageShareProposalDto {
  id: EntityId;
  documentPackageId: EntityId;
  processId: EntityId;
  decisionId?: EntityId | null;
  targetKind: DocumentPackageShareProposalTarget;
  recipientLabel?: string | null;
  purpose?: string | null;
  expiresAt: string;
  allowDownload: boolean;
  status: DocumentPackageShareProposalStatus;
  revision: DocumentPackageRevisionDto;
  createdAt: string;
  approvedAt?: string | null;
  publishedAt?: string | null;
  canConfirm: boolean;
}

export type PrepareDocumentPackageShareProposalInput =
  | { targetKind: "NAMED_RECIPIENT"; recipientLabel: string; purpose?: string | null; expiresAt: string; allowDownload?: boolean }
  | { targetKind: "LINK_PURPOSE"; purpose: string; recipientLabel?: never; expiresAt: string; allowDownload?: boolean };

export interface ConfirmDocumentPackageShareProposalInput {
  confirmation: "APPROVE_AND_CREATE";
  fingerprint: string;
}

export interface ConfirmDocumentPackageShareProposalResponse extends CreateShareLinkResponse {
  proposal: DocumentPackageShareProposalDto;
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

export const operationalProcessTypes = ["DOCUMENT_RECEIVED", "WORKER_CREATED", "JOB_SITE_CREATED", "CONTINUOUS_CONTROL", "DOCUMENT_PACKAGE_SHARING"] as const;
export type OperationalProcessType = (typeof operationalProcessTypes)[number];

export const operationalProcessStatuses = ["RECEIVED", "READY", "RUNNING", "WAITING_FOR_DECISION", "BLOCKED", "RETRY_SCHEDULED", "COMPLETED", "COMPLETED_WITH_EXCEPTIONS", "TECHNICAL_FAILURE"] as const;
export type OperationalProcessStatus = (typeof operationalProcessStatuses)[number];

export const operationalStepStatuses = ["WAITING", "READY", "RUNNING", "COMPLETED", "BLOCKED", "RETRY_SCHEDULED", "TECHNICAL_FAILURE", "SKIPPED"] as const;
export type OperationalStepStatus = (typeof operationalStepStatuses)[number];

export const operationalEventKinds = ["INPUT", "DOMAIN", "TEMPORAL", "DECISION", "TECHNICAL", "RETRY", "COMPLETION", "BLOCKED", "RECONCILIATION"] as const;
export type OperationalEventKind = (typeof operationalEventKinds)[number];

export const operationalEventTypes = ["LEGACY_EVENT", "PROCESS_STARTED", "STEP_STARTED", "RULE_APPLIED", "PROPOSAL_PREPARED", "AUTOMATION_COMPLETED", "DOCUMENT_LINKED", "DOCUMENT_VERSION_ADDED", "REQUIREMENT_SATISFIED", "EXCEPTION_OPENED", "EXCEPTION_RESOLVED", "DECISION_REQUESTED", "DECISION_RESOLVED", "VALUE_CORRECTED", "RETRY_SCHEDULED", "PROCESS_BLOCKED", "PROCESS_RESUMED", "RESULT_CREATED", "PACKAGE_PREPARED", "PACKAGE_UPDATED", "SHARE_APPROVED", "SHARE_LINK_CREATED", "SHARE_LINK_OPENED", "SHARE_DOWNLOAD_REQUESTED", "SHARE_LINK_REVOKED", "SHARE_LINK_EXPIRED", "PROCESS_COMPLETED", "PROCESS_COMPLETED_WITH_EXCEPTIONS", "PROCESS_TECHNICAL_FAILURE", "JOB_SITE_PHASE_CHANGED", "ASSIGNMENT_STARTED", "ASSIGNMENT_ENDED", "EVIDENCE_RECORDED", "EVIDENCE_REVIEWED", "REQUEST_CREATED", "REQUEST_UPDATED", "CONTEXT_MESSAGE_ADDED", "DOCUMENT_SOURCE_CHECKED", "DOCUMENT_LINKED_TO_JOB_SITE", "DOCUMENT_UNLINKED_FROM_JOB_SITE", "DOCUMENT_VERSION_REVIEWED"] as const;
export type OperationalEventType = (typeof operationalEventTypes)[number];
export type OperationalActorType = "SYSTEM" | "USER" | "SUPPORT" | "EXTERNAL";
export type OperationalEventSourceType = "ENGINE" | "DOMAIN" | "USER_ACTION" | "SHARING_ACCESS" | "CONTINUOUS_CONTROL";

export const operationalDecisionTypes = ["CONFIRM_DOCUMENT_TYPE", "CONFIRM_DOCUMENT_OWNER", "CONFIRM_EXPIRY_DATE", "RESOLVE_CONFLICT", "APPROVE_DOCUMENT_PACKAGE_SHARE"] as const;
export type OperationalDecisionType = (typeof operationalDecisionTypes)[number];
export type OperationalDecisionStatus = "OPEN" | "RESOLVED" | "SUPERSEDED";

export const operationalExceptionTypes = ["MISSING_INFORMATION", "DATA_TO_VERIFY", "CONFLICT", "REQUIREMENT_NOT_SATISFIED", "DOCUMENT_MISSING", "DOCUMENT_EXPIRED", "DOCUMENT_EXPIRING", "PROCESS_BLOCKED", "PERSISTENT_TECHNICAL_ERROR", "ACCESS_NOT_ALLOWED", "SENSITIVE_ACTION_REQUIRED", "PARTIAL_RESULT", "INVALID_ARTIFACT_REFERENCE"] as const;
export type OperationalExceptionType = (typeof operationalExceptionTypes)[number];
export type OperationalExceptionSeverity = "INFO" | "ATTENTION" | "WARNING" | "BLOCKING";
export type OperationalExceptionStatus = "OPEN" | "RESOLVED";

export const operationalArtifactTypes = ["ORGANIZATION", "DOCUMENT", "DOCUMENT_VERSION", "DOCUMENT_REQUIREMENT", "WORKER", "JOB_SITE", "DEADLINE", "CHECKLIST", "EVIDENCE", "DOCUMENT_PACKAGE", "SHARE_LINK", "OPERATIONAL_REQUEST", "CONTEXT_MESSAGE", "DOCUMENT_SOURCE"] as const;
export type OperationalArtifactType = (typeof operationalArtifactTypes)[number];
export type OperationalReliability = "VERIFIED" | "HIGH" | "MEDIUM" | "LOW" | "CONFLICT";
export type OperationalImpact = "LOW" | "CONTROLLED" | "SENSITIVE" | "IRREVERSIBLE";

export interface OperationalRequestResponse {
  id: EntityId;
  organizationId: EntityId;
  targetType: OperationalArtifactType;
  targetId: EntityId;
  title: string;
  description?: string | null;
  status: OperationalRequestStatus;
  assigneeUserId?: EntityId | null;
  dueAt?: string | null;
  outcome?: string | null;
  createdById: EntityId;
  completedById?: EntityId | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOperationalRequestInput {
  targetType: OperationalArtifactType;
  targetId: EntityId;
  title: string;
  description?: string | null;
  assigneeUserId?: EntityId | null;
  dueAt?: string | null;
}

export interface UpdateOperationalRequestInput {
  status?: OperationalRequestStatus;
  assigneeUserId?: EntityId | null;
  dueAt?: string | null;
  outcome?: string | null;
}

export interface ContextMessageResponse {
  id: EntityId;
  organizationId: EntityId;
  requestId?: EntityId | null;
  targetType: OperationalArtifactType;
  targetId: EntityId;
  visibility: "INTERNAL";
  body: string;
  authorId: EntityId;
  createdAt: string;
}

export interface CreateContextMessageInput {
  requestId?: EntityId | null;
  targetType: OperationalArtifactType;
  targetId: EntityId;
  body: string;
}

export interface ContextTimelineEventResponse {
  id: EntityId;
  targetType: OperationalArtifactType;
  targetId: EntityId;
  eventType: OperationalEventType;
  title: string;
  summary?: string | null;
  actorType: OperationalActorType;
  occurredAt: string;
}

export interface DocumentSourcePolicyResponse {
  id: EntityId;
  organizationId: EntityId;
  documentTypeId?: EntityId | null;
  categoryKey: DocumentCategoryKey;
  sourceType: DocumentSourceType;
  responsibleUserId?: EntityId | null;
  label: string;
  triggerKinds: string[];
  allowSharing: boolean;
  allowAi: false;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface UpsertDocumentSourcePolicyInput {
  documentTypeId?: EntityId | null;
  categoryKey: DocumentCategoryKey;
  sourceType: Extract<DocumentSourceType, "DIRECT_UPLOAD" | "GUIDED_MANUAL">;
  responsibleUserId?: EntityId | null;
  label: string;
  triggerKinds?: string[];
  allowSharing?: boolean;
  enabled?: boolean;
}

export interface DocumentSourceCheckResponse {
  id: EntityId;
  organizationId: EntityId;
  policyId: EntityId;
  documentId?: EntityId | null;
  status: DocumentSourceCheckStatus;
  triggerKind: string;
  summary?: string | null;
  errorCode?: string | null;
  nextCheckAt?: string | null;
  requestedById?: EntityId | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface CreateDocumentSourceCheckInput {
  policyId: EntityId;
  documentId?: EntityId | null;
  triggerKind: string;
}

export interface OperationalArtifactReferenceDto {
  type: OperationalArtifactType;
  id: EntityId;
  label: string | null;
  href: string | null;
}

export interface OperationalStepDto {
  id: EntityId;
  key: string;
  label: string;
  position: number;
  status: OperationalStepStatus;
  attemptCount: number;
  nextAttemptAt: string;
  startedAt: string | null;
  completedAt: string | null;
  canRetry: boolean;
}

export interface OperationalEventDto {
  id: EntityId;
  kind: OperationalEventKind;
  eventType: OperationalEventType;
  title: string;
  summary: string | null;
  actorType: OperationalActorType;
  actorRole: OrganizationRole | null;
  sourceType: OperationalEventSourceType;
  sourceId: string | null;
  reliability: OperationalReliability;
  impact: OperationalImpact;
  artifacts: OperationalArtifactReferenceDto[];
  reason: string | null;
  previousState: string | null;
  nextState: string | null;
  result: string | null;
  nextStep: string | null;
  occurredAt: string;
}

export interface OperationalTimelinePage {
  items: OperationalEventDto[];
  nextCursor: string | null;
}

export interface OperationalDecisionOptionDto {
  key: string;
  label: string;
  description?: string | null;
}

export interface OperationalDecisionDto {
  id: EntityId;
  processId: EntityId;
  type: OperationalDecisionType;
  status: OperationalDecisionStatus;
  question: string;
  explanation: string | null;
  options: OperationalDecisionOptionDto[];
  proposedOptionKey: string | null;
  selectedOptionKey: string | null;
  selectedValue: string | null;
  impact: OperationalImpact;
  createdAt: string;
  decidedAt: string | null;
  canResolve: boolean;
}

export type ResolveOperationalDecisionInput =
  | { kind: "SELECT_OPTION"; optionKey: string; reason?: string | null; value?: never }
  | { kind: "CONFIRM_DATE"; optionKey: "enter-date"; value: string; reason?: string | null };

export interface OperationalExceptionDto {
  id: EntityId;
  processId: EntityId;
  type: OperationalExceptionType;
  severity: OperationalExceptionSeverity;
  status: OperationalExceptionStatus;
  title: string;
  explanation: string;
  nextStep: string;
  dueAt: string | null;
  createdAt: string;
  resolvedAt: string | null;
  canResolve: boolean;
}

export interface ResolveOperationalExceptionInput {
  kind: "MANUAL_EXCEPTION_RESOLUTION";
  reason: string;
}

export interface RetryOperationalStepInput {
  kind: "RETRY_TECHNICAL_STEP";
}

export interface OperationalProcessSummary {
  id: EntityId;
  type: OperationalProcessType;
  definitionVersion: number;
  status: OperationalProcessStatus;
  title: string;
  summary: string | null;
  reliability: OperationalReliability;
  impact: OperationalImpact;
  openDecisionCount: number;
  openExceptionCount: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  href: string;
}

export interface OperationalProcessPage {
  items: OperationalProcessSummary[];
  nextCursor: string | null;
}

export interface OperationalProcessDetail extends OperationalProcessSummary {
  artifacts: OperationalArtifactReferenceDto[];
  steps: OperationalStepDto[];
  decisions: OperationalDecisionDto[];
  exceptions: OperationalExceptionDto[];
  timeline: OperationalTimelinePage;
}

export type DashboardInterventionKind = "DECISION" | "EXCEPTION" | "SHARING";
export type DashboardOverviewSection = "INTERVENTIONS" | "HANDLED_RESULTS";

export interface DashboardOverviewOrganization {
  name: string;
  role: OrganizationRole | null;
  scopeLabel: string;
  accessMode: "MEMBER" | "SUPPORT";
}

export interface DashboardIntervention {
  id: EntityId;
  processId: EntityId;
  kind: DashboardInterventionKind;
  title: string;
  handledSummary: string;
  missingSummary: string;
  context: OperationalArtifactReferenceDto | null;
  blocking: boolean;
  overdue: boolean;
  severity: OperationalExceptionSeverity | null;
  openedAt: string;
  dueAt: string | null;
  canResolve: boolean;
  primaryAction: {
    label: string;
    href: string;
  };
}

export interface DashboardHandledResult {
  id: EntityId;
  processId: EntityId;
  title: string;
  summary: string | null;
  occurredAt: string;
  href: string;
  context: OperationalArtifactReferenceDto | null;
  source: "OPERATIONAL_EVENT" | "COMPLETED_PROCESS";
}

export interface DashboardOverview {
  generatedAt: string;
  organization: DashboardOverviewOrganization;
  interventionCount: number;
  interventions: DashboardIntervention[];
  handledResults: DashboardHandledResult[];
  completeness: "COMPLETE" | "PARTIAL";
  unavailableSections: DashboardOverviewSection[];
}

export const universalSearchResultTypes = ["DOCUMENT", "DOCUMENT_TYPE", "WORKER", "JOB_SITE", "DEADLINE", "CHECKLIST", "EVIDENCE", "DOCUMENT_PACKAGE", "OPERATIONAL_PROCESS", "OPERATIONAL_DECISION", "OPERATIONAL_EXCEPTION", "SHARE_LINK"] as const;
export type UniversalSearchResultType = (typeof universalSearchResultTypes)[number];

export interface UniversalSearchRequest {
  query: string;
  types?: UniversalSearchResultType[];
  cursor?: string | null;
  take?: number;
}

export interface UniversalSearchResultDto {
  type: UniversalSearchResultType;
  id: EntityId;
  title: string;
  context: string | null;
  status: string | null;
  usefulDate: string | null;
  matchReason: string;
  href: string;
  timelineHref: string | null;
  attention: boolean;
}

export interface UniversalSearchGroupDto {
  type: UniversalSearchResultType;
  label: string;
  items: UniversalSearchResultDto[];
  hasMore: boolean;
}

export interface UniversalSearchPage {
  groups: UniversalSearchGroupDto[];
  items: UniversalSearchResultDto[];
  nextCursor: string | null;
}
