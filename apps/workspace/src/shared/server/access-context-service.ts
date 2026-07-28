import "server-only";

import { cache } from "react";
import { db } from "@qoovex/db";
import type { Permission, WorkspaceAccessContext } from "@qoovex/types";
import { auth } from "@shared/server/auth/config";
import { AccessError } from "@shared/server/access-errors";
import { getPermissionsForRole, getSupportSessionPermissions, sanitizeOrganizationPermissions } from "@shared/server/authorization-policy";
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
      devView: devUser.devView,
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
  return { ...user, authSessionId, isDev: false, devView: null };
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
    user.platformRole === "SUPPORT_AGENT" || user.platformRole === "PLATFORM_ADMIN"
      ? getActiveSupportSession(user.id)
      : Promise.resolve(null),
  ]);

  if (membership?.expiresAt && membership.expiresAt <= new Date()) throw new AccessError("Accesso scaduto.", 403);
  const internalDevView = user.isDev && user.devView !== "OWNER";
  const company = !internalDevView && membership ? {
    role: membership.role,
    preset: membership.preset,
    scopeMode: membership.scopeMode,
    expiresAt: membership.expiresAt?.toISOString() ?? null,
    organization: membership.organization,
  } : null;
  return {
    userId: user.id,
    platformRole: user.platformRole,
    devView: user.devView,
    company,
    support: support ? {
      sessionId: support.id,
      reason: support.reason,
      expiresAt: support.expiresAt.toISOString(),
      sensitiveConfirmedUntil: support.sensitiveConfirmedUntil?.toISOString() ?? null,
      organization: support.organization,
    } : null,
    permissions: support
      ? getSupportSessionPermissions()
      : company?.role === "OWNER"
        ? getPermissionsForRole("OWNER")
        : company
          ? sanitizeOrganizationPermissions(membership?.permissionKeys ?? [])
          : [],
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
