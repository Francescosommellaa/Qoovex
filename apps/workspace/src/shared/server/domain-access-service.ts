import "server-only";

import type { OrganizationPermission, OrganizationRole, ViewerContext } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { getContextOrganizationId, getViewerContext, requirePermission } from "@shared/server/access-context-service";

export interface DomainAccessContext {
  context: ViewerContext;
  organizationId: string;
  actorRole: OrganizationRole;
}

export function getEffectiveOrganizationRole(context: ViewerContext): OrganizationRole | null {
  return context.support ? "OWNER" : context.membership?.role ?? null;
}

export async function requireOrganizationDomainAccess(
  permission: OrganizationPermission,
  allowedRoles: readonly OrganizationRole[],
): Promise<DomainAccessContext> {
  const context = await getViewerContext();
  requirePermission(context, permission);
  const actorRole = getEffectiveOrganizationRole(context);
  if (!actorRole || !allowedRoles.includes(actorRole)) throw new AccessError("Risorsa non disponibile.", 404);
  return { context, organizationId: getContextOrganizationId(context), actorRole };
}
