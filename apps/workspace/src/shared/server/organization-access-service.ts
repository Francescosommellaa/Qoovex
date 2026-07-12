import "server-only";

import crypto from "crypto";
import { db } from "@qoovex/db";
import { AccessError } from "@shared/server/access-errors";
import { getContextOrganizationId, getWorkspaceAccessContext, requireIdentity, requirePermission } from "@shared/server/access-context-service";
import { canRevokeRole } from "@shared/server/authorization-policy";
import { recordSupportAccess } from "@shared/server/support-access-service";

const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const generateOrganizationCode = () => `QVX-${Array.from(crypto.randomBytes(8), (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("")}`;

export async function createOrganization(nameInput: string) {
  const user = await requireIdentity();
  if (!user.emailVerified) throw new AccessError("Verifica la tua email prima di creare l'azienda.", 403);
  const name = nameInput.trim();
  if (name.length < 2 || name.length > 120) throw new AccessError("Inserisci un nome azienda valido.", 409);
  const existing = await db.user.findUnique({ where: { id: user.id }, select: { organizationId: true } });
  if (existing?.organizationId) throw new AccessError("Hai gia configurato la tua azienda.", 409);
  return db.$transaction(async (tx) => {
    const organization = await tx.organization.create({ data: { name, code: generateOrganizationCode(), createdById: user.id } });
    await tx.user.update({ where: { id: user.id }, data: { organizationId: organization.id, organizationRole: "OWNER", authVersion: { increment: 1 } } });
    return organization;
  });
}

export async function listMembers() {
  const context = await getWorkspaceAccessContext();
  requirePermission(context, "members:read");
  const organizationId = getContextOrganizationId(context);
  const members = await db.user.findMany({
    where: { organizationId, organizationRole: { not: null } },
    select: { id: true, organizationRole: true, createdAt: true, email: true, firstName: true, lastName: true },
    orderBy: { createdAt: "asc" },
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "organization-members" });
  return members.map(({ organizationRole, ...user }) => ({ ...user, role: organizationRole! }));
}

export async function revokeMember(userId: string) {
  const context = await getWorkspaceAccessContext();
  requirePermission(context, "members:manage");
  const organizationId = getContextOrganizationId(context);
  const target = await db.user.findFirst({ where: { id: userId, organizationId, organizationRole: { not: null } }, select: { id: true, organizationRole: true } });
  if (!target) throw new AccessError("Membro non trovato.", 404);
  const actorRole = context.support ? "OWNER" : context.company?.role;
  if (!actorRole || !canRevokeRole(actorRole, target.organizationRole!)) throw new AccessError("Non puoi rimuovere questo ruolo.", 403);
  if (target.id === context.userId) throw new AccessError("Non puoi rimuovere il tuo accesso.", 409);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "organization-member", resourceId: target.id });
  await db.$transaction([
    db.user.update({ where: { id: target.id }, data: { organizationId: null, organizationRole: null, authVersion: { increment: 1 } } }),
    db.session.deleteMany({ where: { userId: target.id } }),
  ]);
  return { revoked: true };
}
