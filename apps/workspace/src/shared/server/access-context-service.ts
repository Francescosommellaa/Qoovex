import "server-only";

import { db } from "@qoovex/db";
import type { Permission, ViewerContext } from "@qoovex/types";
import { auth } from "@shared/server/auth/config";
import { AccessError } from "@shared/server/access-errors";
import { getPermissionsForRole } from "@shared/server/authorization-policy";
import { getActiveSupportSession } from "@shared/server/support-access-service";
import { bootstrapDevUser } from "@shared/server/dev-auth";

export async function requireIdentity() {
  const devUser = await bootstrapDevUser();
  if (devUser) {
    return {
      id: devUser.id,
      email: devUser.email,
      emailVerified: devUser.emailVerified,
      platformRole: devUser.platformRole,
      authVersion: devUser.authVersion,
      mfaEnabled: devUser.mfaEnabled,
    };
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new AccessError("Sessione non valida.", 401);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, emailVerified: true, platformRole: true, authVersion: true, mfaEnabled: true },
  });
  if (!user) throw new AccessError("Sessione non valida.", 401);
  return user;
}

export async function getViewerContext(): Promise<ViewerContext> {
  const user = await requireIdentity();
  const [membership, support] = await Promise.all([
    db.organizationMembership.findFirst({
      where: { userId: user.id, revokedAt: null },
      select: { id: true, role: true, organization: { select: { id: true, name: true, code: true } } },
    }),
    user.platformRole === "SUPER_ADMIN" ? getActiveSupportSession(user.id) : Promise.resolve(null),
  ]);

  const effectiveRole = support ? "OWNER" : membership?.role ?? null;
  return {
    userId: user.id,
    platformRole: user.platformRole,
    membership,
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

export function requirePermission(context: ViewerContext, permission: Permission) {
  if (!context.permissions.includes(permission)) throw new AccessError("Risorsa non disponibile.", 404);
}

export function getContextOrganizationId(context: ViewerContext) {
  const id = context.support?.organization.id ?? context.membership?.organization.id;
  if (!id) throw new AccessError("Nessuna azienda attiva.", 403);
  return id;
}
