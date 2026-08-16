import "server-only";

import { db, Prisma } from "@qoovex/db";
import { notificationSourceIdFromResult } from "@shared/lib/job-site-notification-destination";
import { AccessError } from "./access-errors";
import { fingerprintPayload } from "./job-site-contracts";
import { runSerializableTransaction } from "./serializable-transaction";
import { revalidateActor, type JobSiteActor } from "./job-site-authorization-service";
import { queueJobSiteNotifications } from "./job-site-notification-service";
import { recordProductAuditEvent } from "./product-audit-service";

export async function executeIdempotentJobSiteMutation<T extends Record<string, unknown>>(input: {
  actor: JobSiteActor;
  action: string;
  idempotencyKey: string;
  expectedRevision: number;
  request: unknown;
  operation: (tx: Prisma.TransactionClient) => Promise<T>;
}) {
  if (!input.idempotencyKey.trim() || input.idempotencyKey.length > 200) throw new AccessError("Idempotency-Key non valida.", 409, "IDEMPOTENCY_KEY_REQUIRED");
  await revalidateActor(input.actor);
  const inputFingerprint = fingerprintPayload(input.request);
  const existing = await db.jobSiteActionReceipt.findUnique({ where: { organizationId_action_idempotencyKey: { organizationId: input.actor.organizationId, action: input.action, idempotencyKey: input.idempotencyKey } }, select: { inputFingerprint: true, result: true, resultingRevision: true } });
  if (existing) {
    if (existing.inputFingerprint !== inputFingerprint) throw new AccessError("Idempotency-Key gia usata con un input differente.", 409, "IDEMPOTENCY_FINGERPRINT_MISMATCH");
    return { replayed: true, result: existing.result as T, revision: existing.resultingRevision };
  }
  const execution = await runSerializableTransaction(async (tx) => {
    const jobSite = await tx.jobSite.findFirst({ where: { id: input.actor.jobSiteId, organizationId: input.actor.organizationId }, select: { revision: true } });
    if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
    if (jobSite.revision !== input.expectedRevision) throw new AccessError("Il cantiere e stato modificato.", 409, "STALE_REVISION");
    const result = await input.operation(tx);
    const updated = await tx.jobSite.updateMany({ where: { id: input.actor.jobSiteId, revision: input.expectedRevision }, data: { revision: { increment: 1 } } });
    if (updated.count !== 1) throw new AccessError("Il cantiere e stato modificato.", 409, "STALE_REVISION");
    const revision = input.expectedRevision + 1;
    await tx.jobSiteActionReceipt.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, action: input.action, idempotencyKey: input.idempotencyKey, inputFingerprint, result: result as Prisma.InputJsonValue, resultFingerprint: fingerprintPayload(result), actorUserId: input.actor.userId, actorParticipantId: input.actor.participantId, expectedRevision: input.expectedRevision, resultingRevision: revision } });
    await queueJobSiteNotifications(tx, { actor: input.actor, action: input.action, idempotencyKey: input.idempotencyKey, result, sourceId: notificationSourceIdFromResult(input.action, result) });
    return { result, revision };
  }, { shouldRetry: (error) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" });
  await recordProductAuditEvent({ organizationId: input.actor.organizationId, actorUserId: input.actor.userId, actorRole: input.actor.role, action: "JOB_SITE_ACTION_EXECUTED", entityType: "JOB_SITE", entityId: input.actor.jobSiteId });
  return { replayed: false, ...execution };
}
