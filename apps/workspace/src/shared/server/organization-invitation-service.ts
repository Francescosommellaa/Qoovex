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
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export async function listInvitations() {
  const context = await getWorkspaceAccessContext();
  if (!context.permissions.includes("members:read")) throw new AccessError("Risorsa non disponibile.", 404);
  return db.organizationInvitation.findMany({ where: { organizationId: getContextOrganizationId(context), acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } }, select: { id: true, email: true, role: true, expiresAt: true, createdAt: true }, orderBy: { createdAt: "desc" } });
}

export async function createInvitation(input: { email: string; role: OrganizationRole }) {
  if (!INVITABLE_ROLES.has(input.role)) throw new AccessError("Ruolo non invitabile.", 403);
  const role = input.role as Exclude<OrganizationRole, "OWNER">;
  const context = await getWorkspaceAccessContext();
  const actorRole = context.support ? "OWNER" : context.company?.role;
  if (!actorRole || !canInviteRole(actorRole, role)) throw new AccessError("Non puoi invitare questo ruolo.", 403);
  const email = normalizeEmail(input.email);
  if (!email.includes("@")) throw new AccessError("Inserisci una email valida.", 409);
  const organizationId = getContextOrganizationId(context);
  const existingUser = await db.user.findUnique({ where: { email }, select: { organizationId: true } });
  if (existingUser?.organizationId) throw new AccessError("Questo utente appartiene gia a una azienda.", 409);
  const token = crypto.randomBytes(32).toString("base64url");
  const invitation = await db.$transaction(async (tx) => {
    await tx.organizationInvitation.updateMany({ where: { organizationId, email, acceptedAt: null, revokedAt: null }, data: { revokedAt: new Date() } });
    return tx.organizationInvitation.create({ data: { organizationId, email, role, tokenHash: hashToken(token), invitedById: context.userId, expiresAt: new Date(Date.now() + INVITATION_TTL_MS) }, select: { id: true, email: true, role: true, expiresAt: true, organization: { select: { name: true } } } });
  });
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "organization-invitation", metadata: { role } });
  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "https://app.qoovex.com";
  await sendTransactionalEmail({ to: email, template: { kind: "organization-invitation", organizationName: invitation.organization.name, role: invitation.role as Exclude<OrganizationRole, "OWNER">, acceptUrl: `${baseUrl}/invite?token=${encodeURIComponent(token)}`, expiresAt: invitation.expiresAt } });
  return { id: invitation.id, email: invitation.email, role: invitation.role, expiresAt: invitation.expiresAt };
}

export async function revokeInvitation(invitationId: string) {
  const context = await getWorkspaceAccessContext();
  if (!context.permissions.includes("members:manage")) throw new AccessError("Risorsa non disponibile.", 404);
  const result = await db.organizationInvitation.updateMany({ where: { id: invitationId, organizationId: getContextOrganizationId(context), acceptedAt: null, revokedAt: null }, data: { revokedAt: new Date() } });
  if (!result.count) throw new AccessError("Invito non trovato.", 404);
  return { revoked: true };
}

export async function acceptInvitation(token: string) {
  const user = await requireIdentity();
  if (!user.emailVerified) throw new AccessError("Verifica la tua email prima di accettare l'invito.", 403);
  const invitation = await db.organizationInvitation.findUnique({ where: { tokenHash: hashToken(token) }, select: { id: true, email: true, role: true, organizationId: true, expiresAt: true, acceptedAt: true, revokedAt: true } });
  if (!invitation) throw new AccessError("Invito non trovato.", 404);
  if (invitation.revokedAt || invitation.acceptedAt || invitation.expiresAt <= new Date()) throw new AccessError("Invito scaduto o non piu valido.", 410);
  if (normalizeEmail(user.email) !== invitation.email) throw new AccessError("L'invito appartiene a un'altra email.", 403);
  const account = await db.user.findUnique({ where: { id: user.id }, select: { organizationId: true } });
  if (account?.organizationId) throw new AccessError("Appartieni gia a una azienda.", 409);
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { organizationId: invitation.organizationId, organizationRole: invitation.role, authVersion: { increment: 1 } } }),
    db.organizationInvitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } }),
  ]);
  return { accepted: true };
}
