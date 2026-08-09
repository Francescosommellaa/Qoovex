import "server-only";

import crypto from "crypto";
import { db } from "@qoovex/db";
import type { OrganizationAccessPreset, OrganizationPermission, OrganizationResourceGrantInput, OrganizationScopeMode } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { getContextOrganizationId, getWorkspaceAccessContext, requireIdentity, requirePermission } from "@shared/server/access-context-service";
import { requireAccountRole } from "@shared/server/account-role-service";
import { canRevokeRole } from "@shared/server/authorization-policy";
import { normalizeCollaboratorPermissions } from "@shared/server/authorization-policy";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { validateOrganizationResourceGrants } from "./organization-invitation-service";
import {
  isPrismaKnownRequestError,
  runSerializableTransaction,
  SerializableTransactionConflictError,
} from "./serializable-transaction";

const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function generateOrganizationCode() {
  const bytes = crypto.randomBytes(8);
  return `QVX-${Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("")}`;
}

export async function createOrganization(nameInput: string) {
  const user = await requireAccountRole("BUSINESS");
  if (!user.emailVerified) throw new AccessError("Verifica la tua email prima di creare l'azienda.", 403);
  const name = nameInput.trim();
  if (name.length < 2 || name.length > 120) throw new AccessError("Inserisci un nome azienda valido.", 409);

  try {
    return await runSerializableTransaction(async (tx) => {
      const activeMembership = await tx.organizationMembership.findFirst({ where: { userId: user.id, revokedAt: null }, select: { id: true } });
      if (activeMembership) throw new AccessError("Il tuo account e gia collegato a un'Azienda.", 409, "ORGANIZATION_ALREADY_CONNECTED");
      const organization = await tx.organization.create({
        data: { name, code: generateOrganizationCode(), createdById: user.id },
      });
      await tx.organizationMembership.create({
        data: { organizationId: organization.id, userId: user.id, role: "OWNER", scopeMode: "FULL" },
      });
      return organization;
    }, {
      shouldRetry: async (error) => isPrismaKnownRequestError(error, "P2002"),
    });
  } catch (error) {
    if (error instanceof SerializableTransactionConflictError) {
      throw new AccessError("Operazione concorrente. Riprova.", 409);
    }
    if (isPrismaKnownRequestError(error, "P2002")) throw new AccessError("Creazione azienda non riuscita.", 409);
    throw error;
  }
}

export async function listMembers() {
  const context = await getWorkspaceAccessContext();
  requirePermission(context, "members:read");
  const members = await db.organizationMembership.findMany({
    where: { organizationId: getContextOrganizationId(context), revokedAt: null },
    select: { id: true, role: true, createdAt: true, user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: "asc" },
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "organization-members" });
  return members;
}

async function requireOwnerAccessManager() {
  const context = await getWorkspaceAccessContext();
  if (context.support || context.company?.role !== "OWNER") throw new AccessError("Risorsa non disponibile.", 404);
  requirePermission(context, "members:manage");
  return { context, organizationId: getContextOrganizationId(context) };
}

export async function getMemberAccess(memberId: string) {
  const { organizationId } = await requireOwnerAccessManager();
  const membership = await db.organizationMembership.findFirst({
    where: { id: memberId, organizationId, role: "COLLABORATOR" },
    select: {
      id: true,
      role: true,
      preset: true,
      permissionKeys: true,
      scopeMode: true,
      expiresAt: true,
      accessVersion: true,
      updatedAt: true,
      revokedAt: true,
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      resourceGrants: { select: { resourceType: true, resourceId: true }, orderBy: [{ resourceType: "asc" }, { resourceId: "asc" }] },
    },
  });
  if (!membership) throw new AccessError("Collaboratore non trovato.", 404);
  return membership;
}

export async function getAccessResourceOptions() {
  const { organizationId } = await requireOwnerAccessManager();
  const [jobSites, workers] = await Promise.all([
    db.jobSite.findMany({ where: { organizationId, archivedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" }, take: 100 }),
    db.worker.findMany({ where: { organizationId, archivedAt: null }, select: { id: true, displayName: true }, orderBy: { displayName: "asc" }, take: 100 }),
  ]);
  return {
    jobSites: jobSites.map((item) => ({ id: item.id, label: item.name, resourceType: "JOB_SITE" as const })),
    workers: workers.map((item) => ({ id: item.id, label: item.displayName, resourceType: "WORKER" as const })),
  };
}

export async function updateMemberAccess(memberId: string, input: {
  expectedVersion: number;
  preset: OrganizationAccessPreset | null;
  permissions: OrganizationPermission[];
  scopeMode: OrganizationScopeMode;
  expiresAt?: string | null;
  grants?: OrganizationResourceGrantInput[];
}) {
  const { context, organizationId } = await requireOwnerAccessManager();
  if (!Number.isInteger(input.expectedVersion) || input.expectedVersion < 1) throw new AccessError("Versione accesso non valida.", 409);
  if (input.scopeMode !== "FULL" && input.scopeMode !== "ASSIGNED") throw new AccessError("Scope non valido.", 409);
  const permissionKeys = normalizeCollaboratorPermissions(input.permissions);
  const grants = input.scopeMode === "FULL" ? [] : await validateOrganizationResourceGrants(organizationId, input.grants ?? []);
  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) throw new AccessError("Scadenza accesso non valida.", 409);

  const result = await runSerializableTransaction(async (tx) => {
    const target = await tx.organizationMembership.findFirst({
      where: { id: memberId, organizationId, role: "COLLABORATOR", revokedAt: null },
      select: { id: true, userId: true, permissionKeys: true, scopeMode: true, expiresAt: true, accessVersion: true },
    });
    if (!target) throw new AccessError("Collaboratore non trovato.", 404);
    const updated = await tx.organizationMembership.updateMany({
      where: { id: target.id, organizationId, role: "COLLABORATOR", revokedAt: null, accessVersion: input.expectedVersion },
      data: {
        preset: input.preset,
        permissionKeys,
        scopeMode: input.scopeMode,
        expiresAt,
        accessUpdatedById: context.userId,
        accessVersion: { increment: 1 },
      },
    });
    if (updated.count !== 1) throw new AccessError("L'accesso e stato modificato da un'altra sessione. Ricarica e riprova.", 409);
    await tx.organizationMembershipResourceGrant.deleteMany({ where: { membershipId: target.id } });
    if (grants.length) {
      await tx.organizationMembershipResourceGrant.createMany({
        data: grants.map((grant) => ({ organizationId, membershipId: target.id, resourceType: grant.resourceType, resourceId: grant.resourceId, grantedById: context.userId })),
      });
    }
    await tx.user.update({ where: { id: target.userId }, data: { authVersion: { increment: 1 } } });
    await tx.session.deleteMany({ where: { userId: target.userId } });
    await tx.securityAuditEvent.create({
      data: {
        userId: target.userId,
        type: "ORGANIZATION_MEMBERSHIP_ACCESS_UPDATED",
        metadata: {
          organizationId,
          actorUserId: context.userId,
          membershipId: target.id,
          previousAccessVersion: target.accessVersion,
          nextAccessVersion: target.accessVersion + 1,
          permissionsAdded: permissionKeys.filter((permission) => !target.permissionKeys.includes(permission)),
          permissionsRemoved: target.permissionKeys.filter((permission) => !new Set<string>(permissionKeys).has(permission)),
          scopeChanged: target.scopeMode !== input.scopeMode,
          expiryChanged: target.expiresAt?.toISOString() !== expiresAt?.toISOString(),
          grantCount: grants.length,
        },
      },
    });
    return { updated: true, accessVersion: target.accessVersion + 1 };
  });
  return result;
}

export async function revokeMember(memberId: string) {
  const context = await getWorkspaceAccessContext();
  requirePermission(context, "members:manage");
  const organizationId = getContextOrganizationId(context);
  const target = await db.organizationMembership.findFirst({ where: { id: memberId, organizationId, revokedAt: null }, select: { id: true, userId: true, role: true } });
  if (!target) throw new AccessError("Membro non trovato.", 404);
  const actorRole = context.support ? "OWNER" : context.company?.role;
  if (!actorRole || !canRevokeRole(actorRole, target.role)) throw new AccessError("Non puoi revocare questo ruolo.", 403);
  if (target.userId === context.userId) throw new AccessError("Non puoi revocare il tuo accesso.", 409);

  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "organization-membership", resourceId: target.id });

  await db.$transaction([
    db.organizationMembership.update({ where: { id: target.id }, data: { revokedAt: new Date() } }),
    db.user.update({ where: { id: target.userId }, data: { authVersion: { increment: 1 } } }),
    db.session.deleteMany({ where: { userId: target.userId } }),
  ]);
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "ORGANIZATION_MEMBERSHIP_REVOKED",
    entityType: "ORGANIZATION_MEMBERSHIP",
    entityId: target.id,
    metadata: { role: target.role },
  });
  return { revoked: true };
}
