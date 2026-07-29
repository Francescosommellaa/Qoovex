import "server-only";

import type { OrganizationRole } from "@qoovex/types";
import { getWorkspaceAccessContext } from "@shared/server/access-context-service";
import { getEffectiveOrganizationRole } from "@shared/server/domain-access-service";
import type { WorkspaceCapabilities } from "@/views/workspace/workspace-records";

export async function getWorkspaceCapabilities(): Promise<WorkspaceCapabilities> {
  const context = await getWorkspaceAccessContext();
  const role = getEffectiveOrganizationRole(context);
  const can = (permission: (typeof context.permissions)[number]) => context.permissions.includes(permission);
  return {
    role,
    accessPreset: context.company?.preset ?? null,
    canManageCore: can("organization:update"),
    canCreateDocuments: can("documents:upload"),
    canCreateWorkers: can("workers:create"),
    canCreateJobSites: can("jobSites:create"),
    canCreateDeadlines: can("deadlines:manage"),
    canManageCalendar: can("calendar:manage"),
    canUpdateDocuments: can("documents:update"),
    canManageArchivedDocuments: can("documents:archive"),
    canUploadDocumentVersions: can("documents:upload"),
    canReadDocumentFiles: can("documents:file:read"),
    canReadSensitiveDocuments: can("documents:sensitive:read"),
    canVerifyDocuments: can("documents:verify"),
    canManageChecklists: can("checklists:manage"),
    canCompleteChecklists: can("checklists:complete"),
    canUploadEvidence: can("evidence:upload"),
    canDeleteEvidence: can("evidence:delete"),
    canReadEvidenceFiles: can("evidence:file:read"),
    canReadSensitiveEvidence: can("evidence:sensitive:read"),
    canReviewEvidence: can("evidence:review"),
    canManagePackages: can("documentPackages:create"),
    canSharePackages: can("documentPackages:share"),
    canReadAssignments: can("assignments:read"),
    canManageAssignments: can("assignments:manage"),
    canReadMembers: can("members:read"),
    canManageMembers: can("members:manage"),
    canReadDocumentSettings: can("documents:read"),
    canManageDocumentSettings: can("settings:update"),
    canReadNotifications: can("organization:read"),
    canReadAudit: can("auditLog:read"),
    canReadDataControl: can("auditLog:read"),
    canReadOrganizationProfile: can("organizationProfile:read"),
    canUpdateOrganizationProfile: can("organizationProfile:update"),
    canReadContextMessages: can("contextMessages:read"),
    canCreateContextMessages: can("contextMessages:create"),
    canReadRequests: can("requests:read"),
    canManageRequests: can("requests:manage"),
  };
}

export function isWorkspaceRole(role: OrganizationRole | null): role is OrganizationRole {
  return role !== null;
}

export function serializeForClient<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
