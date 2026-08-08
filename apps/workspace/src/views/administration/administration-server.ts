import "server-only";

import type { OrganizationRole } from "@qoovex/types";
import { getWorkspaceAccessContext } from "@shared/server/access-context-service";
import { getEffectiveOrganizationRole } from "@shared/server/domain-access-service";
import type { WorkspaceCapabilities } from "@/views/workspace/workspace-records";

export async function getWorkspaceCapabilities(): Promise<WorkspaceCapabilities> {
  const context = await getWorkspaceAccessContext();
  const can = (permission: (typeof context.permissions)[number]) => context.permissions.includes(permission);
  return {
    role: getEffectiveOrganizationRole(context), accessPreset: context.company?.preset ?? null,
    canManageCore: can("organization:update"), canCreateDocuments: can("documents:upload"), canCreateWorkers: can("workers:create"), canCreateJobSites: can("jobSites:create"),
    canUpdateDocuments: can("documents:update"), canManageArchivedDocuments: can("documents:archive"), canUploadDocumentVersions: can("documents:upload"), canReadDocumentFiles: can("documents:file:read"),
    canUploadEvidence: can("evidence:upload"), canDeleteEvidence: can("evidence:delete"), canReadEvidenceFiles: can("evidence:file:read"),
    canReadAssignments: can("assignments:read"), canManageAssignments: can("assignments:manage"), canReadMembers: can("members:read"), canManageMembers: can("members:manage"),
    canReadNotifications: can("organization:read"), canReadAudit: can("auditLog:read"), canReadDataControl: can("auditLog:read"),
    canReadOrganizationProfile: can("organizationProfile:read"), canUpdateOrganizationProfile: can("organizationProfile:update"),
  };
}
export function isWorkspaceRole(role: OrganizationRole | null): role is OrganizationRole { return role !== null; }
export function serializeForClient<T>(value: unknown): T { return JSON.parse(JSON.stringify(value)) as T; }
