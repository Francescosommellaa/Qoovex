import "server-only";

import { cache } from "react";
import { db } from "@qoovex/db";
import type { Permission, WorkspaceAccessContext } from "@qoovex/types";
import { auth } from "@shared/server/auth/config";
import { AccessError } from "@shared/server/access-errors";
import { getPermissionsForRole, sanitizeOrganizationPermissions } from "@shared/server/authorization-policy";
import { getActiveSupportSession } from "@shared/server/support-access-service";
import { bootstrapDevUser } from "@shared/server/dev-auth";
import { isMfaSatisfiedForUser } from "@shared/server/mfa-service";

async function requirePrimaryIdentityUncached() {
  const devUser = await bootstrapDevUser();
  if (devUser) {
    return {
      id: devUser.id,
      email: devUser.email,
      emailVerified: devUser.emailVerified,
      platformRole: devUser.platformRole,
      authVersion: devUser.authVersion,
      mfaEnabled: devUser.mfaEnabled,
      suspendedAt: null,
      authSessionId: `dev:${devUser.id}`,
      isDev: true,
      devRole: devUser.devRole,
    };
  }

  const session = await auth();
  const userId = session?.user?.id;
  const authSessionId = session?.user?.authSessionId;
  if (!userId || !authSessionId) throw new AccessError("Sessione non valida.", 401);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, emailVerified: true, platformRole: true, authVersion: true, mfaEnabled: true, suspendedAt: true },
  });
  if (!user || user.suspendedAt) throw new AccessError("Sessione non valida.", 401);
  return { ...user, authSessionId, isDev: false, devRole: null };
}

export const requirePrimaryIdentity = cache(requirePrimaryIdentityUncached);

export async function requireIdentity() {
  const user = await requirePrimaryIdentity();
  if (
    !user.isDev &&
    user.mfaEnabled &&
    !(await isMfaSatisfiedForUser({
      userId: user.id,
      authVersion: user.authVersion,
      authSessionId: user.authSessionId,
    }))
  ) {
    throw new AccessError("Conferma MFA richiesta.", 403, "MFA_REQUIRED");
  }
  return user;
}

async function getWorkspaceAccessContextUncached(): Promise<WorkspaceAccessContext> {
  const user = await requireIdentity();
  const [membership, support] = await Promise.all([
    db.organizationMembership.findUnique({
      where: { userId: user.id, revokedAt: null },
      select: { id: true, role: true, preset: true, permissionKeys: true, scopeMode: true, expiresAt: true, organization: { select: { id: true, name: true, code: true } } },
    }),
    user.platformRole === "SUPER_ADMIN" ? getActiveSupportSession(user.id) : Promise.resolve(null),
  ]);

  if (membership?.expiresAt && membership.expiresAt <= new Date()) throw new AccessError("Accesso scaduto.", 403);
  const companyRole = membership ? user.devRole ?? membership.role : null;
  const effectiveRole = support ? "OWNER" : companyRole;
  return {
    userId: user.id,
    platformRole: user.platformRole,
    company: membership ? {
      role: companyRole ?? membership.role,
      preset: membership.preset,
      scopeMode: membership.scopeMode,
      expiresAt: membership.expiresAt?.toISOString() ?? null,
      organization: membership.organization,
    } : null,
    support: support ? {
      sessionId: support.id,
      reason: support.reason,
      expiresAt: support.expiresAt.toISOString(),
      sensitiveConfirmedUntil: support.sensitiveConfirmedUntil?.toISOString() ?? null,
      organization: support.organization,
    } : null,
    permissions: support
      ? getPermissionsForRole("OWNER")
      : membership?.permissionKeys?.length
        ? sanitizeOrganizationPermissions(membership.permissionKeys)
        : getPermissionsForRole(effectiveRole),
  };
}

export const getWorkspaceAccessContext = cache(getWorkspaceAccessContextUncached);

export function requirePermission(context: WorkspaceAccessContext, permission: Permission) {
  if (!context.permissions.includes(permission)) throw new AccessError("Risorsa non disponibile.", 404);
}

export function getContextOrganizationId(context: WorkspaceAccessContext) {
  const id = context.support?.organization.id ?? context.company?.organization.id;
  if (!id) throw new AccessError("Azienda non configurata.", 403);
  return id;
}
