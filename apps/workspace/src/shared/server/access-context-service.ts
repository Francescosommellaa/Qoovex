import "server-only";

import { cache } from "react";
import { db } from "@qoovex/db";
import type { OrganizationContext, Permission, WorkspaceAccessContext } from "@qoovex/types";
import { auth } from "@shared/server/auth/config";
import { AccessError } from "@shared/server/access-errors";
import { getPermissionsForPreset, getPermissionsForRole, getSupportSessionPermissions, sanitizeOrganizationPermissions } from "@shared/server/authorization-policy";
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
      accountRole: devUser.accountRole,
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
    select: { id: true, email: true, emailVerified: true, platformRole: true, accountRole: true, authVersion: true, mfaEnabled: true, suspendedAt: true },
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
  const [memberships, support] = await Promise.all([
    db.organizationMembership.findMany({
      where: { userId: user.id, revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      orderBy: [{ organization: { name: "asc" } }, { createdAt: "asc" }],
      select: { id: true, role: true, preset: true, permissionKeys: true, scopeMode: true, expiresAt: true, organization: { select: { id: true, name: true, code: true } } },
    }),
    user.platformRole === "SUPPORT_AGENT" || user.platformRole === "PLATFORM_ADMIN"
      ? getActiveSupportSession(user.id)
      : Promise.resolve(null),
  ]);

  const membership = memberships.length === 1 ? memberships[0] : null;
  const internalDevView = user.isDev && (user.devView === "SUPPORT_AGENT" || user.devView === "PLATFORM_ADMIN" || user.devView === "CLIENT");
  const simulatedProfessional = user.isDev && user.devView === "PROFESSIONAL";
  const company = !internalDevView && membership ? {
    role: simulatedProfessional ? "COLLABORATOR" : membership.role,
    preset: simulatedProfessional ? "OPERATIONAL_COLLABORATION" : membership.preset,
    scopeMode: simulatedProfessional ? "ASSIGNED" : membership.scopeMode,
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
      : simulatedProfessional
        ? getPermissionsForPreset("OPERATIONAL_COLLABORATION")
        : company?.role === "OWNER"
        ? getPermissionsForRole("OWNER")
        : company
          ? sanitizeOrganizationPermissions(membership?.permissionKeys ?? [])
          : [],
  };
}

export const getWorkspaceAccessContext = cache(getWorkspaceAccessContextUncached);

export async function requireOrganizationContext(organizationId: string): Promise<OrganizationContext & { userId: string; platformRole: WorkspaceAccessContext["platformRole"] }> {
  const user = await requireIdentity();
  const membership = await db.organizationMembership.findFirst({
    where: { organizationId, userId: user.id, revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    select: { id: true, role: true, preset: true, permissionKeys: true, scopeMode: true, expiresAt: true, accessVersion: true, organization: { select: { id: true, name: true, code: true } } },
  });
  if (!membership) throw new AccessError("Risorsa non disponibile.", 404);
  const simulatedProfessional = user.isDev && user.devView === "PROFESSIONAL";
  const role = simulatedProfessional ? "COLLABORATOR" : membership.role;
  const preset = simulatedProfessional ? "OPERATIONAL_COLLABORATION" : membership.preset;
  const scopeMode = simulatedProfessional ? "ASSIGNED" : membership.scopeMode;
  const permissions = simulatedProfessional
    ? getPermissionsForPreset("OPERATIONAL_COLLABORATION")
    : membership.role === "OWNER"
      ? getPermissionsForRole("OWNER")
      : sanitizeOrganizationPermissions(membership.permissionKeys);
  return {
    userId: user.id,
    platformRole: user.platformRole,
    membershipId: membership.id,
    accessVersion: membership.accessVersion,
    role,
    preset,
    scopeMode,
    expiresAt: membership.expiresAt?.toISOString() ?? null,
    organization: membership.organization,
    permissions,
  };
}

export async function requireClientJobSiteContext(jobSiteId: string) {
  const user = await requireIdentity();
  const participant = await db.jobSiteParticipant.findFirst({
    where: { jobSiteId, userId: user.id, kind: "CLIENT", status: "ACTIVE" },
    select: { id: true, userId: true, jobSiteId: true, organizationId: true, status: true, accessVersion: true, jobSite: { select: { revision: true, status: true } } },
  });
  if (!participant) throw new AccessError("Risorsa non disponibile.", 404);
  return participant;
}

export async function requireClientInitialAgreementContext(jobSiteId: string) {
  const user = await requireIdentity();
  const participant = await db.jobSiteParticipant.findFirst({
    where: {
      jobSiteId,
      userId: user.id,
      kind: "CLIENT",
      status: { in: ["PENDING", "ACTIVE"] },
      jobSite: { status: { in: ["PENDING_INITIAL_CONFIRMATION", "ACTIVE"] } },
    },
    select: { id: true, userId: true, jobSiteId: true, organizationId: true, status: true, accessVersion: true, jobSite: { select: { revision: true, status: true } } },
  });
  if (!participant) throw new AccessError("Riepilogo iniziale non disponibile.", 404);
  return participant;
}

export async function requireClientJobSiteDetailContext(jobSiteId: string) {
  const user = await requireIdentity();
  const participant = await db.jobSiteParticipant.findFirst({
    where: {
      jobSiteId,
      userId: user.id,
      kind: "CLIENT",
      OR: [
        { status: "ACTIVE" },
        { status: "PENDING", jobSite: { status: "PENDING_INITIAL_CONFIRMATION" } },
      ],
    },
    select: { id: true, userId: true, jobSiteId: true, organizationId: true, status: true, accessVersion: true, jobSite: { select: { revision: true, status: true } } },
  });
  if (!participant) throw new AccessError("Risorsa non disponibile.", 404);
  return participant;
}

export function requirePermission(context: WorkspaceAccessContext, permission: Permission) {
  if (!context.permissions.includes(permission)) throw new AccessError("Risorsa non disponibile.", 404);
}

export function getContextOrganizationId(context: WorkspaceAccessContext) {
  const id = context.support?.organization.id ?? context.company?.organization.id;
  if (!id) throw new AccessError("Azienda non configurata.", 403);
  return id;
}

export async function requireCurrentOrganizationId() {
  return getContextOrganizationId(await getWorkspaceAccessContext());
}

export async function resolveCurrentOrganizationRouteParams<TParams extends object>(params: Promise<TParams>) {
  const [value, organizationId] = await Promise.all([params, requireCurrentOrganizationId()]);
  return { ...value, organizationId };
}
