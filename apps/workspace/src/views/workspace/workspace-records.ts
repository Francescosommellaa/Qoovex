import type { OrganizationAccessPreset, OrganizationRole } from "@qoovex/types";

export interface WorkspaceCapabilities {
  role: OrganizationRole | null;
  accessPreset: OrganizationAccessPreset | null;
  canManageCore: boolean;
  canCreateWorkers: boolean;
  canCreateJobSites: boolean;
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
