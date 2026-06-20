import "server-only";

import crypto from "crypto";
import { db } from "@qoovex/db";
import { AccessError } from "@shared/server/access-errors";
import { getContextStructureId, getViewerContext, requireIdentity, requirePermission } from "@shared/server/access-context-service";
import { canRevokeRole } from "@shared/server/authorization-policy";
import { recordSupportAccess } from "@shared/server/support-access-service";

const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function generateStructureCode() {
  const bytes = crypto.randomBytes(8);
  return `QVX-${Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("")}`;
}

export async function createStructure(nameInput: string) {
  const user = await requireIdentity();
  if (!user.emailVerified) throw new AccessError("Verifica la tua email prima di creare la struttura.", 403);
  const name = nameInput.trim();
  if (name.length < 2 || name.length > 120) throw new AccessError("Inserisci un nome struttura valido.", 409);

  const existing = await db.structureMembership.findFirst({ where: { userId: user.id, revokedAt: null }, select: { id: true } });
  if (existing) throw new AccessError("Appartieni già a una struttura.", 409);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await db.$transaction(async (tx) => {
        const structure = await tx.structure.create({ data: { name, code: generateStructureCode(), createdById: user.id } });
        await tx.structureMembership.create({ data: { structureId: structure.id, userId: user.id, role: "ADMIN" } });
        return structure;
      });
    } catch (error) {
      if (attempt === 4) throw error;
    }
  }
  throw new AccessError("Creazione struttura non riuscita.", 409);
}

export async function listMembers() {
  const context = await getViewerContext();
  requirePermission(context, "members:read");
  const actorRole = context.support ? "ADMIN" : context.membership?.role;
  const visibleRoles = actorRole === "HEAD_CHEF" ? ["HEAD_CHEF", "KITCHEN_CREW"] as const : undefined;
  const members = await db.structureMembership.findMany({
    where: { structureId: getContextStructureId(context), revokedAt: null, ...(visibleRoles ? { role: { in: [...visibleRoles] } } : {}) },
    select: { id: true, role: true, createdAt: true, user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: "asc" },
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "structure-members" });
  return members;
}

export async function revokeMember(memberId: string) {
  const context = await getViewerContext();
  requirePermission(context, "members:revoke");
  const structureId = getContextStructureId(context);
  const target = await db.structureMembership.findFirst({ where: { id: memberId, structureId, revokedAt: null }, select: { id: true, userId: true, role: true } });
  if (!target) throw new AccessError("Membro non trovato.", 404);
  const actorRole = context.support ? "ADMIN" : context.membership?.role;
  if (!actorRole || !canRevokeRole(actorRole, target.role)) throw new AccessError("Non puoi revocare questo ruolo.", 403);
  if (target.userId === context.userId) throw new AccessError("Non puoi revocare il tuo accesso.", 409);

  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "structure-membership", resourceId: target.id });

  await db.$transaction([
    db.structureMembership.update({ where: { id: target.id }, data: { revokedAt: new Date() } }),
    db.user.update({ where: { id: target.userId }, data: { authVersion: { increment: 1 } } }),
    db.session.deleteMany({ where: { userId: target.userId } }),
  ]);
  return { revoked: true };
}
