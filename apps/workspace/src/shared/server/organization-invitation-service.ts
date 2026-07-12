import "server-only";

import crypto from "crypto";
import { db } from "@qoovex/db";
import type { OrganizationRole } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { getContextOrganizationId, getWorkspaceAccessContext, requireIdentity } from "@shared/server/access-context-service";
import { canInviteRole } from "@shared/server/authorization-policy";
import { sendTransactionalEmail } from "@shared/server/transactional-email-service";
import { recordSupportAccess } from "@shared/server/support-access-service";

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

export async function createInvitation(input: { email: string; role: OrganizationRole }) {
  if (!INVITABLE_ROLES.has(input.role)) throw new AccessError("Ruolo non invitabile.", 403);
  const context = await getWorkspaceAccessContext();
  const actorRole = context.support ? "OWNER" : context.company?.role;
  if (!actorRole || !canInviteRole(actorRole, input.role)) throw new AccessError("Non puoi invitare questo ruolo.", 403);
  const role = input.role as Exclude<OrganizationRole, "OWNER">;
  const email = normalizeEmail(input.email);
  if (!email.includes("@")) throw new AccessError("Inserisci una email valida.", 409);
  const organizationId = getContextOrganizationId(context);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "organization-invitation", metadata: { role } });

  const existingUser = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) {
    const membership = await db.organizationMembership.findUnique({ where: { userId: existingUser.id }, select: { revokedAt: true } });
    if (membership?.revokedAt === null) throw new AccessError("Questo utente appartiene gia a una azienda.", 409);
  }

  const rawToken = crypto.randomBytes(32).toString("base64url");
  const invitation = await db.$transaction(async (tx) => {
    await tx.organizationInvitation.updateMany({
      where: { organizationId, email, acceptedAt: null, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return tx.organizationInvitation.create({
      data: {
        organizationId, email, role, tokenHash: hashToken(rawToken),
        invitedById: context.userId, expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
      },
      select: { id: true, email: true, role: true, expiresAt: true, organization: { select: { name: true } } },
    });
  });

  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "https://app.qoovex.com";
  await sendTransactionalEmail({
    to: email,
    template: { kind: "organization-invitation", organizationName: invitation.organization.name, role, acceptUrl: `${baseUrl}/invite?token=${encodeURIComponent(rawToken)}`, expiresAt: invitation.expiresAt },
  });
  return { id: invitation.id, email: invitation.email, role: invitation.role, expiresAt: invitation.expiresAt };
}

export async function revokeInvitation(invitationId: string) {
  const context = await getWorkspaceAccessContext();
  const organizationId = getContextOrganizationId(context);
  if (!context.permissions.includes("members:manage")) throw new AccessError("Risorsa non disponibile.", 404);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "organization-invitation", resourceId: invitationId });
  const result = await db.organizationInvitation.updateMany({ where: { id: invitationId, organizationId, acceptedAt: null, revokedAt: null }, data: { revokedAt: new Date() } });
  if (!result.count) throw new AccessError("Invito non trovato.", 404);
  return { revoked: true };
}

export async function acceptInvitation(rawToken: string) {
  const user = await requireIdentity();
  if (!user.emailVerified) throw new AccessError("Verifica la tua email prima di accettare l'invito.", 403);
  const invitation = await db.organizationInvitation.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    select: { id: true, email: true, role: true, organizationId: true, expiresAt: true, acceptedAt: true, revokedAt: true },
  });
  if (!invitation) throw new AccessError("Invito non trovato.", 404);
  if (invitation.revokedAt || invitation.acceptedAt || invitation.expiresAt <= new Date()) throw new AccessError("Invito scaduto o non piu valido.", 410);
  if (normalizeEmail(user.email) !== invitation.email) throw new AccessError("L'invito appartiene a un'altra email.", 403);
  const membership = await db.organizationMembership.findUnique({ where: { userId: user.id }, select: { revokedAt: true } });
  if (membership?.revokedAt === null) throw new AccessError("Appartieni gia a una azienda.", 409);

  try {
    await db.$transaction(async (tx) => {
      if (membership) {
        const claimed = await tx.organizationMembership.updateMany({
          where: { userId: user.id, revokedAt: { not: null } },
          data: { organizationId: invitation.organizationId, role: invitation.role, revokedAt: null },
        });
        if (claimed.count !== 1) throw new AccessError("Appartieni gia a una azienda.", 409);
      } else {
        await tx.organizationMembership.create({
          data: { organizationId: invitation.organizationId, userId: user.id, role: invitation.role },
        });
      }
      await tx.organizationInvitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } });
      await tx.user.update({ where: { id: user.id }, data: { authVersion: { increment: 1 } } });
    });
  } catch (error) {
    if (error instanceof AccessError) throw error;
    const active = await db.organizationMembership.findUnique({ where: { userId: user.id }, select: { revokedAt: true } });
    if (active?.revokedAt === null) throw new AccessError("Appartieni gia a una azienda.", 409);
    throw error;
  }
  return { accepted: true };
}
