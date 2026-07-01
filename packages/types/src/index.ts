/** Shared platform-neutral contracts for the Qoovex Organization domain. */
export type EntityId = string;

export const platformRoles = ["USER", "SUPER_ADMIN"] as const;
export type PlatformRole = (typeof platformRoles)[number];

export const organizationRoles = ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER", "VIEWER"] as const;
export type OrganizationRole = (typeof organizationRoles)[number];

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
  "settings:update",
] as const;
export type OrganizationPermission = (typeof organizationPermissions)[number];

export const permissions = organizationPermissions;
export type Permission = OrganizationPermission;

export const recordStatuses = ["ACTIVE", "ARCHIVED"] as const;
export type RecordStatus = (typeof recordStatuses)[number];

export const documentStatuses = ["PRESENT", "MISSING", "EXPIRED", "EXPIRING_SOON", "TO_REVIEW", "ARCHIVED"] as const;
export type DocumentStatus = (typeof documentStatuses)[number];

export const deadlineStatuses = ["SCHEDULED", "EXPIRING_SOON", "EXPIRED", "DONE", "ARCHIVED"] as const;
export type DeadlineStatus = (typeof deadlineStatuses)[number];

export const checklistItemStatuses = ["OPEN", "DONE", "TO_REVIEW", "ARCHIVED"] as const;
export type ChecklistItemStatus = (typeof checklistItemStatuses)[number];

export const documentPackageStatuses = ["DRAFT", "READY_FOR_REVIEW", "SHARED", "ARCHIVED"] as const;
export type DocumentPackageStatus = (typeof documentPackageStatuses)[number];

export const documentOwnerTypes = ["ORGANIZATION", "WORKER", "JOB_SITE"] as const;
export type DocumentOwnerType = (typeof documentOwnerTypes)[number];

export const documentTypeAppliesToValues = ["ORGANIZATION", "WORKER", "JOB_SITE", "EVIDENCE", "OTHER"] as const;
export type DocumentTypeAppliesTo = (typeof documentTypeAppliesToValues)[number];

export const requirementTargetTypes = ["ORGANIZATION", "WORKER", "JOB_SITE"] as const;
export type RequirementTargetType = (typeof requirementTargetTypes)[number];

export const deadlineSourceTypes = ["DOCUMENT", "CHECKLIST", "MANUAL", "OTHER"] as const;
export type DeadlineSourceType = (typeof deadlineSourceTypes)[number];

export const evidenceTypes = ["PHOTO", "FILE", "NOTE"] as const;
export type EvidenceType = (typeof evidenceTypes)[number];

export const documentPackageItemTypes = ["DOCUMENT", "DOCUMENT_VERSION", "EVIDENCE", "CHECKLIST", "NOTE"] as const;
export type DocumentPackageItemType = (typeof documentPackageItemTypes)[number];

export interface OrganizationSummary {
  id: EntityId;
  name: string;
  code: string;
}

export interface MembershipSummary {
  id: EntityId;
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

export interface ViewerContext {
  userId: EntityId;
  platformRole: PlatformRole;
  membership: MembershipSummary | null;
  support: SupportContext | null;
  permissions: Permission[];
}

export interface CreateOrganizationInput { name: string }
export interface CreateInvitationInput { email: string; role: Exclude<OrganizationRole, "OWNER"> }
export interface AcceptInvitationInput { token: string }
export interface OpenSupportSessionInput { organizationCode: string; reason: string }

export interface BlobMetadata {
  blobKey: string;
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
}

export interface JobSiteResponse {
  id: EntityId;
  organizationId: EntityId;
  name: string;
  address?: string | null;
  clientName?: string | null;
  status: RecordStatus;
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
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
}

export interface UpdateJobSiteInput {
  name?: string;
  address?: string | null;
  clientName?: string | null;
  status?: RecordStatus;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
}

export interface ArchiveJobSiteResponse {
  jobSite: JobSiteResponse;
  archived: true;
}

export interface DocumentTypeSummary {
  id: EntityId;
  organizationId: EntityId;
  name: string;
  appliesTo: DocumentTypeAppliesTo;
  requiresExpiryDate: boolean;
}

export interface DocumentSummary {
  id: EntityId;
  organizationId: EntityId;
  documentTypeId?: EntityId | null;
  ownerType: DocumentOwnerType;
  workerId?: EntityId | null;
  jobSiteId?: EntityId | null;
  title: string;
  status: DocumentStatus;
  expiryDate?: string | null;
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
  targetType: RequirementTargetType;
  documentTypeId?: EntityId | null;
  jobSiteId?: EntityId | null;
  isRequired: boolean;
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

export interface DashboardOrganizationSummary {
  name: string;
  role: OrganizationRole;
}

export interface DashboardDocumentStatusCounts {
  present: number;
  missing: number;
  expired: number;
  expiringSoon: number;
  toReview: number;
}

export interface DashboardSummary {
  documents: DashboardDocumentStatusCounts;
  openDeadlines: number;
  activeJobSites: number;
  activeWorkers: number;
  packagesReadyForReview: number;
  sharedPackages: number;
  recentEvidence: number;
}

export interface DashboardDeadlineItem {
  id: EntityId;
  title: string;
  dueDate: string;
  status: DeadlineStatus;
  sourceType: DeadlineSourceType;
  documentId?: EntityId | null;
  workerId?: EntityId | null;
  jobSiteId?: EntityId | null;
}

export interface DashboardDocumentAttentionItem {
  id: EntityId;
  title: string;
  status: DocumentStatus;
  ownerType: DocumentOwnerType;
  ownerLabel: string;
  expiryDate?: string | null;
  updatedAt: string;
  nextAction: string;
}

export interface DashboardJobSiteItem {
  id: EntityId;
  name: string;
  status: RecordStatus;
  documentsToReview: number;
  openChecklists: number;
}

export interface DashboardWorkerItem {
  id: EntityId;
  displayName: string;
  status: RecordStatus;
  documentsToReview: number;
  openDeadlines: number;
}

export interface DashboardPackageItem {
  id: EntityId;
  title: string;
  status: DocumentPackageStatus;
  itemCount: number;
  hasActiveShareLink: boolean;
  updatedAt: string;
}

export interface DashboardEvidenceItem {
  id: EntityId;
  type: EvidenceType;
  title: string;
  hasFile: boolean;
  createdAt: string;
  jobSiteId?: EntityId | null;
}

export interface DashboardQuickAction {
  label: string;
  description: string;
  href?: string | null;
  disabled: boolean;
  disabledReason?: string | null;
}

export interface DashboardEmptyState {
  title: string;
  actionLabel: string;
}

export interface DashboardResponse {
  generatedAt: string;
  organization: DashboardOrganizationSummary;
  summary: DashboardSummary;
  deadlines: DashboardDeadlineItem[];
  documentsToReview: DashboardDocumentAttentionItem[];
  jobSites: DashboardJobSiteItem[];
  workers: DashboardWorkerItem[];
  packages: DashboardPackageItem[];
  recentEvidence: DashboardEvidenceItem[];
  quickActions: DashboardQuickAction[];
  emptyStates: DashboardEmptyState[];
}
