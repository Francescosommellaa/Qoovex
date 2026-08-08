import "server-only";

import { db } from "@qoovex/db";
import { z } from "zod";
import { AccessError } from "./access-errors";
import { requireOrganizationContext } from "./access-context-service";
import { recordProductAuditEvent } from "./product-audit-service";
import { runSerializableTransaction } from "./serializable-transaction";

const placeSchema = z.object({
  reason: z.string().trim().min(10).max(4_000),
}).strict();

const releaseSchema = z.object({
  holdId: z.string().min(1),
  releaseReason: z.string().trim().min(10).max(4_000),
}).strict();

async function requireOwner(organizationId: string) {
  const context = await requireOrganizationContext(organizationId);
  if (context.role !== "OWNER") throw new AccessError("Risorsa non disponibile.", 404);
  return context;
}

export async function placeLegalHold(organizationId: string, jobSiteId: string, rawInput: unknown) {
  const context = await requireOwner(organizationId);
  const input = placeSchema.parse(rawInput);
  const hold = await runSerializableTransaction(async (tx) => {
    const jobSite = await tx.jobSite.findFirst({ where: { id: jobSiteId, organizationId }, select: { id: true } });
    if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
    return tx.legalHold.create({
      data: { organizationId, jobSiteId, reason: input.reason, placedByUserId: context.userId },
      select: { id: true, status: true, reason: true, placedAt: true },
    });
  });
  await recordProductAuditEvent({ organizationId, actorUserId: context.userId, actorRole: context.role, action: "LEGAL_HOLD_PLACED", entityType: "LEGAL_HOLD", entityId: hold.id });
  return hold;
}

export async function releaseLegalHold(organizationId: string, jobSiteId: string, rawInput: unknown) {
  const context = await requireOwner(organizationId);
  const input = releaseSchema.parse(rawInput);
  const hold = await runSerializableTransaction(async (tx) => {
    const updated = await tx.legalHold.updateMany({
      where: { id: input.holdId, organizationId, jobSiteId, status: "ACTIVE" },
      data: { status: "RELEASED", releasedByUserId: context.userId, releasedAt: new Date(), releaseReason: input.releaseReason },
    });
    if (updated.count !== 1) throw new AccessError("Conservazione bloccata non disponibile.", 404);
    return tx.legalHold.findUniqueOrThrow({ where: { id: input.holdId }, select: { id: true, status: true, releasedAt: true } });
  });
  await recordProductAuditEvent({ organizationId, actorUserId: context.userId, actorRole: context.role, action: "LEGAL_HOLD_RELEASED", entityType: "LEGAL_HOLD", entityId: hold.id });
  return hold;
}

export async function hasActiveLegalHold(organizationId: string, jobSiteId: string) {
  return (await db.legalHold.count({ where: { organizationId, jobSiteId, status: "ACTIVE" } })) > 0;
}
