import "server-only";

import crypto from "crypto";
import { db } from "@qoovex/db";
import { AccessError } from "@shared/server/access-errors";
import { getContextOrganizationId, getWorkspaceAccessContext, requireIdentity, requirePermission } from "@shared/server/access-context-service";
import { canRevokeRole } from "@shared/server/authorization-policy";
import { recordSupportAccess } from "@shared/server/support-access-service";

const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function generateOrganizationCode() {
  const bytes = crypto.randomBytes(8);
  return `QVX-${Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("")}`;
}

export async function createOrganization(nameInput: string) {
  const user = await requireIdentity();
  if (!user.emailVerified) throw new AccessError("Verifica la tua email prima di creare l'azienda.", 403);
  const name = nameInput.trim();
  if (name.length < 2 || name.length > 120) throw new AccessError("Inserisci un nome azienda valido.", 409);

  const existing = await db.organizationMembership.findUnique({ where: { userId: user.id }, select: { id: true, revokedAt: true } });
  if (existing?.revokedAt === null) throw new AccessError("Appartieni gia a una azienda.", 409);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await db.$transaction(async (tx) => {
        const organization = await tx.organization.create({ data: { name, code: generateOrganizationCode(), createdById: user.id } });
        if (existing) {
          const claimed = await tx.organizationMembership.updateMany({
            where: { userId: user.id, revokedAt: { not: null } },
            data: { organizationId: organization.id, role: "OWNER", revokedAt: null },
          });
          if (claimed.count !== 1) throw new AccessError("Appartieni gia a una azienda.", 409);
        } else {
          await tx.organizationMembership.create({ data: { organizationId: organization.id, userId: user.id, role: "OWNER" } });
        }
        return organization;
      });
    } catch (error) {
      const active = await db.organizationMembership.findUnique({ where: { userId: user.id }, select: { revokedAt: true } });
      if (active?.revokedAt === null) throw new AccessError("Appartieni gia a una azienda.", 409);
      if (attempt === 4) throw error;
    }
  }
  throw new AccessError("Creazione azienda non riuscita.", 409);
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
  return { revoked: true };
}
