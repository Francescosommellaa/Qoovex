import "server-only";

import crypto from "crypto";
import { db } from "@qoovex/db";
import type { StructureRole } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { getContextStructureId, getViewerContext, requireIdentity } from "@shared/server/access-context-service";
import { canInviteRole } from "@shared/server/authorization-policy";
import { sendTransactionalEmail } from "@shared/server/transactional-email-service";
import { recordSupportAccess } from "@shared/server/support-access-service";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const INVITABLE_ROLES = new Set<StructureRole>(["HEAD_OF_HALL", "HEAD_CHEF", "KITCHEN_CREW"]);

function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
function hashToken(token: string) { return crypto.createHash("sha256").update(token).digest("hex"); }

export async function listInvitations() {
  const context = await getViewerContext();
  if (!context.permissions.includes("members:read")) throw new AccessError("Risorsa non disponibile.", 404);
  const actorRole = context.support ? "ADMIN" : context.membership?.role;
  const invitations = await db.structureInvitation.findMany({
    where: { structureId: getContextStructureId(context), acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() }, ...(actorRole === "HEAD_CHEF" ? { role: "KITCHEN_CREW" } : {}) },
    select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "structure-invitations" });
  return invitations;
}

export async function createInvitation(input: { email: string; role: StructureRole }) {
  if (!INVITABLE_ROLES.has(input.role)) throw new AccessError("Ruolo non invitabile.", 403);
  const context = await getViewerContext();
  const actorRole = context.support ? "ADMIN" : context.membership?.role;
  if (!actorRole || !canInviteRole(actorRole, input.role)) throw new AccessError("Non puoi invitare questo ruolo.", 403);
  if (input.role === "ADMIN") throw new AccessError("Il ruolo Admin non può essere invitato.", 403);
  const role: Exclude<StructureRole, "ADMIN"> = input.role;
  const email = normalizeEmail(input.email);
  if (!email.includes("@")) throw new AccessError("Inserisci una email valida.", 409);
  const structureId = getContextStructureId(context);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "structure-invitation", metadata: { role } });

  const existingUser = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) {
    const membership = await db.structureMembership.findFirst({ where: { userId: existingUser.id, revokedAt: null }, select: { id: true } });
    if (membership) throw new AccessError("Questo utente appartiene già a una struttura.", 409);
  }

  const rawToken = crypto.randomBytes(32).toString("base64url");
  const invitation = await db.$transaction(async (tx) => {
    await tx.structureInvitation.updateMany({
      where: { structureId, email, acceptedAt: null, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return tx.structureInvitation.create({
      data: {
        structureId, email, role, tokenHash: hashToken(rawToken),
        invitedById: context.userId, expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
      },
      select: { id: true, email: true, role: true, expiresAt: true, structure: { select: { name: true } } },
    });
  });

  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "https://app.qoovex.com";
  await sendTransactionalEmail({
    to: email,
    template: { kind: "structure-invitation", structureName: invitation.structure.name, role, acceptUrl: `${baseUrl}/invite?token=${encodeURIComponent(rawToken)}`, expiresAt: invitation.expiresAt },
  });
  return { id: invitation.id, email: invitation.email, role: invitation.role, expiresAt: invitation.expiresAt };
}

export async function revokeInvitation(invitationId: string) {
  const context = await getViewerContext();
  const structureId = getContextStructureId(context);
  if (!context.permissions.includes("members:revoke")) throw new AccessError("Risorsa non disponibile.", 404);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "structure-invitation", resourceId: invitationId });
  const result = await db.structureInvitation.updateMany({ where: { id: invitationId, structureId, acceptedAt: null, revokedAt: null }, data: { revokedAt: new Date() } });
  if (!result.count) throw new AccessError("Invito non trovato.", 404);
  return { revoked: true };
}

export async function acceptInvitation(rawToken: string) {
  const user = await requireIdentity();
  if (!user.emailVerified) throw new AccessError("Verifica la tua email prima di accettare l’invito.", 403);
  const invitation = await db.structureInvitation.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    select: { id: true, email: true, role: true, structureId: true, expiresAt: true, acceptedAt: true, revokedAt: true },
  });
  if (!invitation) throw new AccessError("Invito non trovato.", 404);
  if (invitation.revokedAt || invitation.acceptedAt || invitation.expiresAt <= new Date()) throw new AccessError("Invito scaduto o non più valido.", 410);
  if (normalizeEmail(user.email) !== invitation.email) throw new AccessError("L’invito appartiene a un’altra email.", 403);
  const active = await db.structureMembership.findFirst({ where: { userId: user.id, revokedAt: null }, select: { id: true } });
  if (active) throw new AccessError("Appartieni già a una struttura.", 409);

  await db.$transaction(async (tx) => {
    await tx.structureMembership.upsert({
      where: { structureId_userId: { structureId: invitation.structureId, userId: user.id } },
      create: { structureId: invitation.structureId, userId: user.id, role: invitation.role },
      update: { role: invitation.role, revokedAt: null },
    });
    await tx.structureInvitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } });
    await tx.user.update({ where: { id: user.id }, data: { authVersion: { increment: 1 } } });
  });
  return { accepted: true };
}
