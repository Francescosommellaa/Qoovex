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
    canManageCore: can("organization:update"),
    canCreateDocuments: can("documents:upload"),
    canCreateWorkers: can("workers:create"),
    canCreateJobSites: can("jobSites:create"),
    canCreateDeadlines: can("deadlines:manage"),
    canManageCalendar: can("calendar:manage"),
    canUpdateDocuments: can("documents:update"),
    canManageArchivedDocuments: can("documents:archive"),
    canUploadDocumentVersions: can("documents:upload"),
    canManageChecklists: can("checklists:manage"),
    canCompleteChecklists: can("checklists:complete"),
    canUploadEvidence: can("evidence:upload"),
    canDeleteEvidence: can("evidence:delete"),
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
  };
}

export function isWorkspaceRole(role: OrganizationRole | null): role is OrganizationRole {
  return role !== null;
}

export function serializeForClient<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
