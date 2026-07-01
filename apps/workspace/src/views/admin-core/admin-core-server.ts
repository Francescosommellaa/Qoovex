import "server-only";

import type { OrganizationRole } from "@qoovex/types";
import { getViewerContext } from "@shared/server/access-context-service";
import { getEffectiveOrganizationRole } from "@shared/server/domain-access-service";
import type { WorkspaceCapabilities } from "@/views/workspace/workspace-records";

export async function getWorkspaceCapabilities(): Promise<WorkspaceCapabilities> {
  const context = await getViewerContext();
  const role = getEffectiveOrganizationRole(context);
  return {
    role,
    canManageCore: role === "OWNER" || role === "ADMIN",
    canUpdateDocuments: role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT",
    canUploadDocumentVersions: role === "OWNER" || role === "ADMIN",
    canManageChecklists: role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT",
    canCompleteChecklists: role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT",
    canUploadEvidence: role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT",
    canDeleteEvidence: role === "OWNER" || role === "ADMIN",
    canManagePackages: role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT",
    canSharePackages: role === "OWNER" || role === "ADMIN",
  };
}

export function isWorkspaceRole(role: OrganizationRole | null): role is OrganizationRole {
  return role !== null;
}

export function serializeForClient<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
