import "server-only";

import crypto from "crypto";
import { db } from "@qoovex/db";
import type { OrganizationRole } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { getContextOrganizationId, getWorkspaceAccessContext, requireIdentity } from "@shared/server/access-context-service";
import { canInviteRole } from "@shared/server/authorization-policy";
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
const INVITABLE_ROLES = new Set<OrganizationRole>(["ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"]);

function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
function hashToken(token: string) { return crypto.createHash("sha256").update(token).digest("hex"); }

export async function listInvitations() {
  const context = await getWorkspaceAccessContext();
  if (!context.permissions.includes("members:read")) throw new AccessError("Risorsa non disponibile.", 404);
  const invitations = await db.organizationInvitation.findMany({
    where: { organizationId: getContextOrganizationId(context), acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
    select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "organization-invitations" });
  return invitations;
}

export async function createInvitation(input: { email: string; role: OrganizationRole; workerId?: string | null }) {
  if (!INVITABLE_ROLES.has(input.role)) throw new AccessError("Ruolo non invitabile.", 403);
  const context = await getWorkspaceAccessContext();
  const actorRole = context.support ? "OWNER" : context.company?.role;
  if (!actorRole || !canInviteRole(actorRole, input.role)) throw new AccessError("Non puoi invitare questo ruolo.", 403);
  const role = input.role as Exclude<OrganizationRole, "OWNER">;
  const email = normalizeEmail(input.email);
  if (!email.includes("@")) throw new AccessError("Inserisci una email valida.", 409);
  const organizationId = getContextOrganizationId(context);
  const workerId = typeof input.workerId === "string" && input.workerId.trim() ? input.workerId.trim() : null;
  if (role === "WORKER" && !workerId) throw new AccessError("Seleziona il profilo lavoratore da invitare.", 409);
  if (workerId && role !== "WORKER") throw new AccessError("Il profilo lavoratore puo essere collegato soltanto a un invito Lavoratore.", 409);
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
    const membership = await db.organizationMembership.findUnique({ where: { userId: existingUser.id }, select: { revokedAt: true } });
    if (membership?.revokedAt === null) throw new AccessError("Questo utente appartiene gia a una azienda.", 409);
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
      data: { revokedAt: new Date() },
    });
    return tx.organizationInvitation.create({
      data: {
        organizationId, workerId, email, role, tokenHash: hashToken(rawToken),
        invitedById: context.userId, expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
      },
      select: { id: true, email: true, role: true, expiresAt: true, organization: { select: { name: true } } },
    });
  });

  await sendTransactionalEmail({
    to: email,
    template: {
      kind: "organization-invitation",
      organizationName: invitation.organization.name,
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
      revokedAt: true,
      organization: { select: { name: true } },
    },
  });
  if (!invitation || invitation.revokedAt || invitation.acceptedAt || invitation.expiresAt <= new Date()) return null;
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
  const result = await db.organizationInvitation.updateMany({ where: { id: invitationId, organizationId, acceptedAt: null, revokedAt: null }, data: { revokedAt: new Date() } });
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

export async function acceptInvitation(rawToken: string) {
  const user = await requireIdentity();
  if (!user.emailVerified) throw new AccessError("Verifica la tua email prima di accettare l'invito.", 403);
  const tokenHash = hashToken(rawToken);

  try {
    const accepted = await runSerializableTransaction(async (tx) => {
      const now = new Date();
      const invitation = await tx.organizationInvitation.findUnique({
        where: { tokenHash },
        select: { id: true, email: true, role: true, organizationId: true, workerId: true, invitedById: true, expiresAt: true, acceptedAt: true, revokedAt: true },
      });
      if (!invitation) throw new AccessError("Invito non trovato.", 404);
      if (invitation.revokedAt || invitation.acceptedAt || invitation.expiresAt <= now) {
        throw new AccessError("Invito scaduto o non piu valido.", 410);
      }
      if (normalizeEmail(user.email) !== invitation.email) throw new AccessError("L'invito appartiene a un'altra email.", 403);

      const membership = await tx.organizationMembership.findUnique({
        where: { userId: user.id },
        select: { id: true, revokedAt: true },
      });
      if (membership?.revokedAt === null) throw new AccessError("Appartieni gia a una azienda.", 409);

      if (membership) {
        const claimed = await tx.organizationMembership.updateMany({
          where: { id: membership.id, userId: user.id, revokedAt: { not: null } },
          data: { organizationId: invitation.organizationId, role: invitation.role, revokedAt: null },
        });
        if (claimed.count !== 1) throw new AccessError("Appartieni gia a una azienda.", 409);
      } else {
        await tx.organizationMembership.create({
          data: { organizationId: invitation.organizationId, userId: user.id, role: invitation.role },
        });
      }
      if (invitation.role === "WORKER" && invitation.workerId) {
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
        where: { id: invitation.id, acceptedAt: null, revokedAt: null, expiresAt: { gt: now } },
        data: { acceptedAt: now },
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
    const active = await db.organizationMembership.findUnique({ where: { userId: user.id }, select: { revokedAt: true } });
    if (active?.revokedAt === null) throw new AccessError("Appartieni gia a una azienda.", 409);
    throw new AccessError("Operazione concorrente. Riprova.", 409);
  }
  return { accepted: true };
}
