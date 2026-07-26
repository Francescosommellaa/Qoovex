import "server-only";

import crypto from "crypto";
import { db } from "@qoovex/db";
import { AccessError } from "@shared/server/access-errors";
import { getContextOrganizationId, getWorkspaceAccessContext, requireIdentity, requirePermission } from "@shared/server/access-context-service";
import { canRevokeRole } from "@shared/server/authorization-policy";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
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
  const user = await requireIdentity();
  if (!user.emailVerified) throw new AccessError("Verifica la tua email prima di creare l'azienda.", 403);
  const name = nameInput.trim();
  if (name.length < 2 || name.length > 120) throw new AccessError("Inserisci un nome azienda valido.", 409);

  try {
    return await runSerializableTransaction(async (tx) => {
      const existing = await tx.organizationMembership.findUnique({
        where: { userId: user.id },
        select: { id: true, revokedAt: true },
      });
      if (existing?.revokedAt === null) throw new AccessError("Appartieni gia a una azienda.", 409);

      const organization = await tx.organization.create({
        data: { name, code: generateOrganizationCode(), createdById: user.id },
      });
      if (existing) {
        const claimed = await tx.organizationMembership.updateMany({
          where: { id: existing.id, userId: user.id, revokedAt: { not: null } },
          data: { organizationId: organization.id, role: "OWNER", revokedAt: null },
        });
        if (claimed.count !== 1) throw new AccessError("Appartieni gia a una azienda.", 409);
      } else {
        await tx.organizationMembership.create({
          data: { organizationId: organization.id, userId: user.id, role: "OWNER" },
        });
      }
      return organization;
    }, {
      shouldRetry: async (error) => {
        if (!isPrismaKnownRequestError(error, "P2002")) return false;
        const active = await db.organizationMembership.findUnique({
          where: { userId: user.id },
          select: { revokedAt: true },
        });
        if (active?.revokedAt === null) throw new AccessError("Appartieni gia a una azienda.", 409);
        return true;
      },
    });
  } catch (error) {
    if (error instanceof SerializableTransactionConflictError) {
      throw new AccessError("Operazione concorrente. Riprova.", 409);
    }
    if (isPrismaKnownRequestError(error, "P2002")) {
      const active = await db.organizationMembership.findUnique({
        where: { userId: user.id },
        select: { revokedAt: true },
      });
      if (active?.revokedAt === null) throw new AccessError("Appartieni gia a una azienda.", 409);
      throw new AccessError("Creazione azienda non riuscita.", 409);
    }
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
