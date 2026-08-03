import type { OrganizationAccessPreset, OrganizationRole } from "@qoovex/types";

export interface WorkspaceCapabilities {
  role: OrganizationRole | null;
  accessPreset: OrganizationAccessPreset | null;
  canManageCore: boolean;
  canCreateDocuments: boolean;
  canCreateWorkers: boolean;
  canCreateJobSites: boolean;
  canUpdateDocuments: boolean;
  canManageArchivedDocuments: boolean;
  canUploadDocumentVersions: boolean;
  canReadDocumentFiles: boolean;
  canUploadEvidence: boolean;
  canDeleteEvidence: boolean;
  canReadEvidenceFiles: boolean;
  canReadAssignments: boolean;
  canManageAssignments: boolean;
  canReadMembers: boolean;
  canManageMembers: boolean;
  canReadNotifications: boolean;
  canReadAudit: boolean;
  canReadDataControl: boolean;
  canReadOrganizationProfile: boolean;
  canUpdateOrganizationProfile: boolean;
}
