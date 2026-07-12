import "server-only";

import type { OrganizationRole } from "@qoovex/types";
import { getWorkspaceAccessContext } from "@shared/server/access-context-service";
import { getEffectiveOrganizationRole } from "@shared/server/domain-access-service";
import type { WorkspaceCapabilities } from "@/views/workspace/workspace-records";

export async function getWorkspaceCapabilities(): Promise<WorkspaceCapabilities> {
  const context = await getWorkspaceAccessContext();
  const role = getEffectiveOrganizationRole(context);
  return {
    role,
    canManageCore: role === "OWNER" || role === "ADMIN",
    canUpdateDocuments: role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT",
    canUploadDocumentVersions: role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT" || role === "WORKER",
    canManageChecklists: role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT",
    canCompleteChecklists: role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT" || role === "SITE_MANAGER",
    canUploadEvidence: role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT" || role === "SITE_MANAGER" || role === "WORKER",
    canDeleteEvidence: role === "OWNER" || role === "ADMIN",
    canManagePackages: role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT",
    canSharePackages: role === "OWNER" || role === "ADMIN",
    canReadAssignments: role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT",
    canManageAssignments: role === "OWNER" || role === "ADMIN",
  };
}

export function isWorkspaceRole(role: OrganizationRole | null): role is OrganizationRole {
  return role !== null;
}

export function serializeForClient<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
