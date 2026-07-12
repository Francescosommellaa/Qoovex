import "server-only";

import { db } from "@qoovex/db";
import type { Permission, WorkspaceAccessContext } from "@qoovex/types";
import { auth } from "@shared/server/auth/config";
import { AccessError } from "@shared/server/access-errors";
import { getPermissionsForRole } from "@shared/server/authorization-policy";
import { getActiveSupportSession } from "@shared/server/support-access-service";
import { bootstrapDevUser } from "@shared/server/dev-auth";

export async function requireIdentity() {
  const devUser = await bootstrapDevUser();
  if (devUser) return { ...devUser, suspendedAt: null };

  const session = await auth();
  if (!session?.user?.id) throw new AccessError("Sessione non valida.", 401);
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, emailVerified: true, platformRole: true, authVersion: true, mfaEnabled: true, suspendedAt: true },
  });
  if (!user || user.suspendedAt) throw new AccessError("Sessione non valida.", 401);
  return user;
}

export async function getWorkspaceAccessContext(): Promise<WorkspaceAccessContext> {
  const user = await requireIdentity();
  const [account, support] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { organizationRole: true, organization: { select: { id: true, name: true, code: true } } },
    }),
    user.platformRole === "SUPER_ADMIN" ? getActiveSupportSession(user.id) : Promise.resolve(null),
  ]);
  const company = account?.organization && account.organizationRole
    ? { role: account.organizationRole, organization: account.organization }
    : null;
  const effectiveRole = support ? "OWNER" : company?.role ?? null;
  return {
    userId: user.id,
    platformRole: user.platformRole,
    company,
    support: support ? {
      sessionId: support.id,
      reason: support.reason,
      expiresAt: support.expiresAt.toISOString(),
      sensitiveConfirmedUntil: support.sensitiveConfirmedUntil?.toISOString() ?? null,
      organization: support.organization,
    } : null,
    permissions: getPermissionsForRole(effectiveRole),
  };
}

export function requirePermission(context: WorkspaceAccessContext, permission: Permission) {
  if (!context.permissions.includes(permission)) throw new AccessError("Risorsa non disponibile.", 404);
}

export function getContextOrganizationId(context: WorkspaceAccessContext) {
  const id = context.support?.organization.id ?? context.company?.organization.id;
  if (!id) throw new AccessError("Azienda non configurata.", 403);
  return id;
}
