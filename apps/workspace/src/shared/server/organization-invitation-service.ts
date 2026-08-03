import "server-only";

import crypto from "crypto";
import { db } from "@qoovex/db";
import type { OrganizationAccessPreset, OrganizationPermission, OrganizationResourceGrantInput, OrganizationRole, OrganizationScopeMode } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { getContextOrganizationId, getWorkspaceAccessContext, requireIdentity } from "@shared/server/access-context-service";
import { canInviteRole, getPermissionsForPreset, normalizeCollaboratorPermissions } from "@shared/server/authorization-policy";
import { buildOrganizationInvitationPath } from "../lib/workspace-link-routes";
import { sendTransactionalEmail } from "@shared/server/transactional-email-service";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { buildAbsoluteWorkspaceUrl } from "./workspace-url-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import {
  isPrismaKnownRequestError,
  runSerializableTransaction,
  SerializableTransactionConflictError,
} from "./serializable-transaction";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const INVITABLE_ROLES = new Set<OrganizationRole>(["COLLABORATOR"]);

function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
function hashToken(token: string) { return crypto.createHash("sha256").update(token).digest("hex"); }

export async function validateOrganizationResourceGrants(organizationId: string, grants: OrganizationResourceGrantInput[]) {
  const unique = [...new Map(grants.map((grant) => [`${grant.resourceType}:${grant.resourceId}`, grant])).values()];
  if (unique.length > 100) throw new AccessError("Troppe risorse assegnate.", 409);
  for (const grant of unique) {
    const where = { id: grant.resourceId, organizationId };
    const found = grant.resourceType === "JOB_SITE"
      ? await db.jobSite.findFirst({ where, select: { id: true } })
      : grant.resourceType === "WORKER"
        ? await db.worker.findFirst({ where, select: { id: true } })
        : grant.resourceType === "DOCUMENT"
          ? await db.document.findFirst({ where, select: { id: true } })
          : await db.evidence.findFirst({ where, select: { id: true } });
    if (!found) throw new AccessError("Una risorsa assegnata non è disponibile.", 409);
  }
  return unique;
}

export async function listInvitations() {
  const context = await getWorkspaceAccessContext();
  if (!context.permissions.includes("members:read")) throw new AccessError("Risorsa non disponibile.", 404);
  const invitations = await db.organizationInvitation.findMany({
    where: { organizationId: getContextOrganizationId(context), acceptedAt: null, declinedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
    select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "organization-invitations" });
  return invitations;
}

export async function createInvitation(input: { recipientName?: string | null; email: string; message?: string | null; role: OrganizationRole; preset?: OrganizationAccessPreset | null; permissions?: OrganizationPermission[]; scopeMode?: OrganizationScopeMode; accessExpiresAt?: string | null; workerId?: string | null; grants?: OrganizationResourceGrantInput[] }) {
  if (!INVITABLE_ROLES.has(input.role)) throw new AccessError("Ruolo non invitabile.", 403);
  const context = await getWorkspaceAccessContext();
  if (context.support) throw new AccessError("Gli inviti richiedono l'Owner dell'azienda.", 403);
  const actorRole = context.company?.role;
  if (!actorRole || !canInviteRole(actorRole, input.role)) throw new AccessError("Non puoi invitare questo ruolo.", 403);
  const role = "COLLABORATOR" as const;
  const preset = input.preset ?? "OPERATIONAL_COLLABORATION";
  const permissionKeys = normalizeCollaboratorPermissions(input.permissions?.length ? input.permissions : getPermissionsForPreset(preset));
  const scopeMode: OrganizationScopeMode = input.scopeMode ?? "ASSIGNED";
  const email = normalizeEmail(input.email);
  if (!email.includes("@")) throw new AccessError("Inserisci una email valida.", 409);
  const organizationId = getContextOrganizationId(context);
  const grants = await validateOrganizationResourceGrants(organizationId, input.grants ?? []);
  const workerId = typeof input.workerId === "string" && input.workerId.trim() ? input.workerId.trim() : null;
  if (preset === "LIMITED_UPLOAD" && !workerId) throw new AccessError("Seleziona il profilo lavoratore da invitare.", 409);
  if (workerId && preset !== "LIMITED_UPLOAD") throw new AccessError("Il profilo lavoratore puo essere collegato soltanto al preset Caricamento limitato.", 409);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "organization-invitation", metadata: { role } });

  if (workerId) {
    const worker = await db.worker.findFirst({
      where: { id: workerId, organizationId, archivedAt: null },
      select: { id: true, email: true, userLinks: { where: { archivedAt: null }, select: { id: true }, take: 1 } },
    });
    if (!worker) throw new AccessError("Lavoratore non trovato.", 404);
    if (worker.email && normalizeEmail(worker.email) !== email) {
      throw new AccessError("L'email dell'invito non coincide con il profilo lavoratore.", 409);
    }
    if (worker.userLinks.length) throw new AccessError("Questo lavoratore ha gia un account Qoovex collegato.", 409);
    const activeWorkerInvitation = await db.organizationInvitation.findFirst({
      where: { organizationId, workerId, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true },
    });
    if (activeWorkerInvitation) throw new AccessError("Esiste gia un invito attivo per questo lavoratore.", 409);
  }

  const existingUser = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) {
    const membership = await db.organizationMembership.findUnique({ where: { organizationId_userId: { organizationId, userId: existingUser.id } }, select: { revokedAt: true } });
    if (membership?.revokedAt === null) throw new AccessError("Questo utente appartiene gia a questa Azienda.", 409);
  }

  const rawToken = crypto.randomBytes(32).toString("base64url");
  const invitation = await runSerializableTransaction(async (tx) => {
    if (workerId) {
      const duplicateWorkerInvitation = await tx.organizationInvitation.findFirst({
        where: { organizationId, workerId, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
        select: { id: true },
      });
      if (duplicateWorkerInvitation) throw new AccessError("Esiste gia un invito attivo per questo lavoratore.", 409);
    }
    await tx.organizationInvitation.updateMany({
      where: { organizationId, email, acceptedAt: null, revokedAt: null },
      data: { revokedAt: new Date(), activeKey: null },
    });
    return tx.organizationInvitation.create({
      data: {
        organizationId, workerId, email, role, preset, permissionKeys, scopeMode,
        recipientName: input.recipientName?.trim() || null,
        message: input.message?.trim() || null,
        activeKey: `${organizationId}:${email}`,
        accessExpiresAt: input.accessExpiresAt ? new Date(input.accessExpiresAt) : null,
        tokenHash: hashToken(rawToken),
        invitedById: context.userId, accessUpdatedById: context.userId, expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
        resourceGrants: grants.length ? { create: grants.map((grant) => ({ organizationId, resourceType: grant.resourceType, resourceId: grant.resourceId })) } : undefined,
      },
      select: { id: true, email: true, role: true, expiresAt: true },
    });
  });

  await sendTransactionalEmail({
    to: email,
    template: {
      kind: "organization-invitation",
      organizationName: context.company?.organization.name ?? "Qoovex",
      role,
      acceptUrl: buildAbsoluteWorkspaceUrl(buildOrganizationInvitationPath(rawToken)),
      expiresAt: invitation.expiresAt,
    },
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "ORGANIZATION_INVITATION_CREATED",
    entityType: "ORGANIZATION_INVITATION",
    entityId: invitation.id,
    metadata: { role, automatic: Boolean(workerId) },
  });
  return { id: invitation.id, email: invitation.email, role: invitation.role, expiresAt: invitation.expiresAt };
}

export async function getInvitationPreview(rawToken: string) {
  if (!rawToken) return null;
  const invitation = await db.organizationInvitation.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    select: {
      role: true,
      expiresAt: true,
      acceptedAt: true,
      declinedAt: true,
      revokedAt: true,
      organization: { select: { name: true } },
    },
  });
  if (!invitation || invitation.revokedAt || invitation.declinedAt || invitation.acceptedAt || invitation.expiresAt <= new Date()) return null;
  return {
    organizationName: invitation.organization.name,
    role: invitation.role,
    expiresAt: invitation.expiresAt,
  };
}

export async function revokeInvitation(invitationId: string) {
  const context = await getWorkspaceAccessContext();
  const organizationId = getContextOrganizationId(context);
  if (!context.permissions.includes("members:manage")) throw new AccessError("Risorsa non disponibile.", 404);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "organization-invitation", resourceId: invitationId });
  const result = await db.organizationInvitation.updateMany({ where: { id: invitationId, organizationId, acceptedAt: null, revokedAt: null }, data: { revokedAt: new Date(), activeKey: null, accessUpdatedById: context.userId, accessVersion: { increment: 1 } } });
  if (!result.count) throw new AccessError("Invito non trovato.", 404);
  const actorRole = context.support ? "OWNER" : context.company?.role ?? null;
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "ORGANIZATION_INVITATION_REVOKED",
    entityType: "ORGANIZATION_INVITATION",
    entityId: invitationId,
  });
  return { revoked: true };
}

export async function resendInvitation(invitationId: string) {
  const context = await getWorkspaceAccessContext();
  if (context.support || context.company?.role !== "OWNER") throw new AccessError("Risorsa non disponibile.", 404);
  const organizationId = getContextOrganizationId(context);
  const existing = await db.organizationInvitation.findFirst({
    where: { id: invitationId, organizationId, acceptedAt: null },
    select: { id: true, email: true, role: true, organization: { select: { name: true } } },
  });
  if (!existing) throw new AccessError("Invito non trovato.", 404);
  if (existing.role !== "COLLABORATOR") throw new AccessError("Invito non disponibile.", 409);
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);
  await runSerializableTransaction(async (tx) => {
    await tx.organizationInvitation.updateMany({
      where: { organizationId, email: existing.email, id: { not: existing.id }, acceptedAt: null, declinedAt: null, revokedAt: null },
      data: { revokedAt: new Date(), activeKey: null },
    });
    const updated = await tx.organizationInvitation.updateMany({
      where: { id: existing.id, organizationId, acceptedAt: null },
      data: { tokenHash: hashToken(rawToken), activeKey: `${organizationId}:${existing.email}`, expiresAt, declinedAt: null, revokedAt: null, accessUpdatedById: context.userId, accessVersion: { increment: 1 } },
    });
    if (updated.count !== 1) throw new AccessError("Invito non disponibile.", 409);
  });
  await sendTransactionalEmail({
    to: existing.email,
    template: { kind: "organization-invitation", organizationName: existing.organization.name, role: existing.role, acceptUrl: buildAbsoluteWorkspaceUrl(buildOrganizationInvitationPath(rawToken)), expiresAt },
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, "OWNER"),
    action: "ORGANIZATION_INVITATION_CREATED",
    entityType: "ORGANIZATION_INVITATION",
    entityId: existing.id,
    metadata: { role: existing.role, reissued: true },
  });
  return { reissued: true, expiresAt };
}

export async function acceptInvitation(rawToken: string) {
  const user = await requireIdentity();
  if (!user.emailVerified) throw new AccessError("Verifica la tua email prima di accettare l'invito.", 403);
  const tokenHash = hashToken(rawToken);

  try {
    const accepted = await runSerializableTransaction(async (tx) => {
      const now = new Date();
      const invitation = await tx.organizationInvitation.findUnique({
        where: { tokenHash },
        select: { id: true, email: true, role: true, preset: true, permissionKeys: true, scopeMode: true, accessExpiresAt: true, organizationId: true, workerId: true, invitedById: true, expiresAt: true, acceptedAt: true, declinedAt: true, revokedAt: true, resourceGrants: { select: { resourceType: true, resourceId: true } } },
      });
      if (!invitation) throw new AccessError("Invito non trovato.", 404);
      if (invitation.revokedAt || invitation.declinedAt || invitation.acceptedAt || invitation.expiresAt <= now) {
        throw new AccessError("Invito scaduto o non piu valido.", 410);
      }
      if (normalizeEmail(user.email) !== invitation.email) throw new AccessError("L'invito appartiene a un'altra email.", 403);
      const invitationPreset = invitation.preset ?? "CUSTOM";
      const invitationGrants = invitation.resourceGrants ?? [];

      const membership = await tx.organizationMembership.findUnique({
        where: { organizationId_userId: { organizationId: invitation.organizationId, userId: user.id } },
        select: { id: true, revokedAt: true },
      });
      if (membership?.revokedAt === null) throw new AccessError("Appartieni gia a questa Azienda.", 409);

      let acceptedMembershipId: string;
      if (membership) {
        const claimed = await tx.organizationMembership.updateMany({
          where: { id: membership.id, userId: user.id, revokedAt: { not: null } },
          data: { organizationId: invitation.organizationId, role: invitation.role, preset: invitationPreset, permissionKeys: invitation.permissionKeys ?? [], scopeMode: invitation.scopeMode ?? "ASSIGNED", expiresAt: invitation.accessExpiresAt ?? null, revokedAt: null, accessUpdatedById: invitation.invitedById, accessVersion: { increment: 1 } },
        });
        if (claimed.count !== 1) throw new AccessError("Appartieni gia a una azienda.", 409);
        await tx.organizationMembershipResourceGrant.deleteMany({ where: { membershipId: membership.id } });
        if (invitationGrants.length) {
          await tx.organizationMembershipResourceGrant.createMany({ data: invitationGrants.map((grant) => ({ membershipId: membership.id, organizationId: invitation.organizationId, resourceType: grant.resourceType, resourceId: grant.resourceId })) });
        }
        acceptedMembershipId = membership.id;
      } else {
        const createdMembership = await tx.organizationMembership.create({
          data: { organizationId: invitation.organizationId, userId: user.id, role: invitation.role, preset: invitationPreset, permissionKeys: invitation.permissionKeys ?? [], scopeMode: invitation.scopeMode ?? "ASSIGNED", expiresAt: invitation.accessExpiresAt ?? null, accessUpdatedById: invitation.invitedById, resourceGrants: { create: invitationGrants.map((grant) => ({ organizationId: invitation.organizationId, resourceType: grant.resourceType, resourceId: grant.resourceId })) } },
          select: { id: true },
        });
        acceptedMembershipId = createdMembership.id;
      }
      for (const grant of invitationGrants.filter((value) => value.resourceType === "JOB_SITE")) {
        const jobSite = await tx.jobSite.findFirst({ where: { id: grant.resourceId, organizationId: invitation.organizationId }, select: { id: true } });
        if (!jobSite) throw new AccessError("Cantiere assegnato non più disponibile.", 409);
        await tx.jobSiteParticipant.upsert({ where: { userSideKey: `${jobSite.id}:${user.id}` }, create: { organizationId: invitation.organizationId, jobSiteId: jobSite.id, userId: user.id, membershipId: acceptedMembershipId, kind: "ORGANIZATION_MEMBER", status: "ACTIVE", publicRoleLabel: "Collaborator", activeKey: `${jobSite.id}:${user.id}:ORGANIZATION_MEMBER`, userSideKey: `${jobSite.id}:${user.id}`, activatedAt: now, createdByUserId: invitation.invitedById }, update: { membershipId: acceptedMembershipId, status: "ACTIVE", accessVersion: { increment: 1 }, publicRoleLabel: "Collaborator", activeKey: `${jobSite.id}:${user.id}:ORGANIZATION_MEMBER`, activatedAt: now, revokedAt: null, endedAt: null, endedByUserId: null, endReason: null } });
      }
      if (invitationPreset === "LIMITED_UPLOAD" && invitation.workerId) {
        const worker = await tx.worker.findFirst({
          where: { id: invitation.workerId, organizationId: invitation.organizationId, archivedAt: null },
          select: { id: true },
        });
        if (!worker) throw new AccessError("Profilo lavoratore non piu disponibile.", 409);
        const activeLink = await tx.workerUserLink.findFirst({
          where: {
            organizationId: invitation.organizationId,
            archivedAt: null,
            OR: [{ workerId: worker.id }, { userId: user.id }],
          },
          select: { workerId: true, userId: true },
        });
        if (activeLink && (activeLink.workerId !== worker.id || activeLink.userId !== user.id)) {
          throw new AccessError("Profilo o account gia collegato a un'altra persona.", 409);
        }
        if (!activeLink) {
          const archivedLink = await tx.workerUserLink.findFirst({
            where: { organizationId: invitation.organizationId, workerId: worker.id, userId: user.id, archivedAt: { not: null } },
            select: { id: true },
          });
          if (archivedLink) {
            await tx.workerUserLink.update({
              where: { id: archivedLink.id },
              data: { archivedAt: null, linkedById: invitation.invitedById },
            });
          } else {
            await tx.workerUserLink.create({
              data: {
                organizationId: invitation.organizationId,
                workerId: worker.id,
                userId: user.id,
                linkedById: invitation.invitedById,
              },
            });
          }
        }
      }
      const consumed = await tx.organizationInvitation.updateMany({
        where: { id: invitation.id, acceptedAt: null, declinedAt: null, revokedAt: null, expiresAt: { gt: now } },
        data: { acceptedAt: now, activeKey: null },
      });
      if (consumed.count !== 1) throw new AccessError("Invito scaduto o non piu valido.", 410);
      await tx.user.update({ where: { id: user.id }, data: { authVersion: { increment: 1 } } });
      return { organizationId: invitation.organizationId, invitationId: invitation.id, role: invitation.role, linkedWorker: Boolean(invitation.workerId) };
    });
    await recordProductAuditEventBestEffort({
      organizationId: accepted.organizationId,
      actorUserId: user.id,
      actorRole: accepted.role,
      action: "ORGANIZATION_INVITATION_ACCEPTED",
      entityType: "ORGANIZATION_INVITATION",
      entityId: accepted.invitationId,
      metadata: { role: accepted.role, automatic: accepted.linkedWorker },
    });
  } catch (error) {
    if (error instanceof AccessError) throw error;
    if (error instanceof SerializableTransactionConflictError) {
      throw new AccessError("Operazione concorrente. Riprova.", 409);
    }
    if (!isPrismaKnownRequestError(error, "P2002")) throw error;
    const active = await db.organizationMembership.findFirst({ where: { userId: user.id, revokedAt: null }, select: { revokedAt: true } });
    if (active?.revokedAt === null) throw new AccessError("Sei gia membro di questa Azienda.", 409);
    throw new AccessError("Operazione concorrente. Riprova.", 409);
  }
  return { accepted: true };
}

export async function declineInvitation(rawToken: string) {
  const user = await requireIdentity();
  if (!rawToken) throw new AccessError("Invito non valido.", 410);
  const now = new Date();
  const result = await db.organizationInvitation.updateMany({
    where: {
      tokenHash: hashToken(rawToken),
      email: normalizeEmail(user.email),
      acceptedAt: null,
      declinedAt: null,
      revokedAt: null,
      expiresAt: { gt: now },
    },
    data: { declinedAt: now, activeKey: null, accessVersion: { increment: 1 } },
  });
  if (result.count !== 1) throw new AccessError("Invito non disponibile.", 410);
  return { declined: true };
}
