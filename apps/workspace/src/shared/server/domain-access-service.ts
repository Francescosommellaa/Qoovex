import "server-only";

import type { OrganizationPermission, OrganizationRole, WorkspaceAccessContext } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { getContextOrganizationId, getWorkspaceAccessContext, requirePermission } from "@shared/server/access-context-service";

export interface DomainAccessContext {
  context: WorkspaceAccessContext;
  organizationId: string;
  actorRole: OrganizationRole;
}

export function getEffectiveOrganizationRole(context: WorkspaceAccessContext): OrganizationRole | null {
  return context.support ? "OWNER" : context.company?.role ?? null;
}

export async function requireOrganizationDomainAccess(
  permission: OrganizationPermission,
  _allowedRoles?: readonly string[],
): Promise<DomainAccessContext> {
  const context = await getWorkspaceAccessContext();
  requirePermission(context, permission);
  const actorRole = getEffectiveOrganizationRole(context);
  if (!actorRole) throw new AccessError("Risorsa non disponibile.", 404);
  return { context, organizationId: getContextOrganizationId(context), actorRole };
}
