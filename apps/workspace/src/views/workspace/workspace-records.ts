import type {
  ChecklistItemStatus,
  DeadlineSourceType,
  DeadlineStatus,
  CalendarEventKind,
  CalendarEventPriority,
  CalendarEventSource,
  CalendarEventStatus,
  DocumentOwnerType,
  DocumentPackageItemType,
  DocumentPackageStatus,
  DocumentStatus,
  DocumentTypeAppliesTo,
  EvidenceType,
  RecordStatus,
} from "@qoovex/types";

export type WorkspaceRole = "OWNER" | "ADMIN" | "SAFETY_CONSULTANT" | "SITE_MANAGER" | "WORKER";

export interface WorkspaceCapabilities {
  role: WorkspaceRole | null;
  canManageCore: boolean;
  canCreateDocuments: boolean;
  canCreateWorkers: boolean;
  canCreateJobSites: boolean;
  canCreateDeadlines: boolean;
  canManageCalendar: boolean;
  canUpdateDocuments: boolean;
  canUploadDocumentVersions: boolean;
  canManageChecklists: boolean;
  canCompleteChecklists: boolean;
  canUploadEvidence: boolean;
  canDeleteEvidence: boolean;
  canManagePackages: boolean;
  canSharePackages: boolean;
  canReadAssignments: boolean;
  canManageAssignments: boolean;
  canReadMembers: boolean;
  canManageMembers: boolean;
  canReadDocumentSettings: boolean;
  canManageDocumentSettings: boolean;
  canReadNotifications: boolean;
  canReadAudit: boolean;
  canReadDataControl: boolean;
}

export interface WorkspaceDocumentTypeRecord {
  id: string;
  name: string;
  appliesTo: DocumentTypeAppliesTo;
  requiresExpiryDate: boolean;
}

export interface WorkspaceWorkerRecord {
  id: string;
  displayName: string;
  email?: string | null;
  phone?: string | null;
  roleLabel?: string | null;
  status: RecordStatus;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceJobSiteRecord {
  id: string;
  name: string;
  address?: string | null;
  clientName?: string | null;
  status: RecordStatus;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceDocumentRecord {
  id: string;
  documentTypeId?: string | null;
  ownerType: DocumentOwnerType;
  workerId?: string | null;
  jobSiteId?: string | null;
  title: string;
  status: DocumentStatus;
  expiryDate?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceDocumentVersionRecord {
  id: string;
  documentId: string;
  originalFileName: string;
  mimeType: string;
  size: number;
  checksum?: string | null;
  uploadedById: string;
  createdAt: string;
  archivedAt?: string | null;
}

export interface WorkspaceDeadlineRecord {
  id: string;
  title: string;
  dueDate: string;
  sourceType: DeadlineSourceType;
  documentId?: string | null;
  workerId?: string | null;
  jobSiteId?: string | null;
  status: DeadlineStatus;
  remindAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceCalendarParticipant {
  id: string;
  label: string;
  email: string;
  role: WorkspaceRole;
}

export interface WorkspaceCalendarEventRecord {
  id: string;
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
  assignedToId?: string | null;
  jobSiteId?: string | null;
  createdById: string;
  assignedTo?: WorkspaceCalendarParticipant | null;
  jobSite?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceChecklistItemRecord {
  id: string;
  checklistId: string;
  label: string;
  description?: string | null;
  status: ChecklistItemStatus;
  completedAt?: string | null;
  completedById?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceChecklistRecord {
  id: string;
  jobSiteId?: string | null;
  name: string;
  description?: string | null;
  status: RecordStatus;
  createdAt?: string;
  updatedAt?: string;
  items?: WorkspaceChecklistItemRecord[];
}

export interface WorkspaceEvidenceRecord {
  id: string;
  jobSiteId?: string | null;
  workerId?: string | null;
  checklistItemId?: string | null;
  type: EvidenceType;
  title: string;
  description?: string | null;
  hasFile: boolean;
  originalFileName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  createdById: string;
  createdAt: string;
  archivedAt?: string | null;
}

export interface WorkspaceDocumentPackageItemRecord {
  id: string;
  documentPackageId: string;
  itemType: DocumentPackageItemType;
  documentId?: string | null;
  documentVersionId?: string | null;
  evidenceId?: string | null;
  checklistId?: string | null;
  note?: string | null;
  position: number;
  createdAt: string;
}

export interface WorkspaceDocumentPackageRecord {
  id: string;
  jobSiteId?: string | null;
  title: string;
  description?: string | null;
  status: DocumentPackageStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  items?: WorkspaceDocumentPackageItemRecord[];
}

export interface WorkspaceShareLinkRecord {
  id: string;
  documentPackageId: string;
  expiresAt?: string | null;
  revokedAt?: string | null;
  createdById: string;
  createdAt: string;
  lastAccessedAt?: string | null;
}
