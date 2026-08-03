import "server-only";

import { createHash } from "node:crypto";
import { db, Prisma } from "@qoovex/db";
import { z } from "zod";
import { AccessError } from "./access-errors";
import { putPrivateBlob, getPrivateBlob } from "./blob-storage-service";
import { validateBinaryFileContent } from "./file-content-validation";
import { recordProductAuditEventBestEffort } from "./product-audit-service";
import { resolveClientJobSiteActor, resolveOrganizationJobSiteActor, requireEconomicAuthority, revalidateActor, type VNextActor } from "./vnext-authorization-service";
import { fingerprintPayload } from "./vnext-contracts";
import { runSerializableTransaction } from "./serializable-transaction";
import { queueJobSiteNotifications } from "./vnext-notification-service";

const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;
const MIME_BY_CATEGORY = {
  GENERAL: ["application/pdf", "image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm", "video/quicktime"],
  PHOTO: ["image/jpeg", "image/png", "image/webp"],
  VIDEO: ["video/mp4", "video/webm", "video/quicktime"],
  EVIDENCE: ["application/pdf", "image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm", "video/quicktime"],
  EXPENSE_RECEIPT: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  PAYMENT_RECEIPT: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  DOCUMENT: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  PROPOSAL: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  REQUEST: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  DISPUTE: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
} as const;

export type VNextAttachmentCategory = keyof typeof MIME_BY_CATEGORY;
export const vnextAttachmentCategorySchema = z.enum(Object.keys(MIME_BY_CATEGORY) as [VNextAttachmentCategory, ...VNextAttachmentCategory[]]);

function safeExtension(mimeType: string) {
  return ({ "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" } as Record<string, string>)[mimeType] ?? "bin";
}

function stableAttachmentId(organizationId: string, idempotencyKey: string) {
  const hash = createHash("sha256").update(`${organizationId}:${idempotencyKey}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

async function requireRelatedRecord(tx: Prisma.TransactionClient, input: { actor: VNextActor; category: VNextAttachmentCategory; relatedId: string | null }) {
  if (!input.relatedId) {
    if (input.actor.side === "CLIENT") throw new AccessError("Seleziona il record a cui collegare il file.", 409, "ATTACHMENT_SOURCE_REQUIRED");
    return;
  }
  const count = input.category === "REQUEST" ? await tx.jobSiteRequest.count({ where: { id: input.relatedId, jobSiteId: input.actor.jobSiteId } })
    : input.category === "PROPOSAL" ? await tx.jobSiteChangeProposal.count({ where: { id: input.relatedId, jobSiteId: input.actor.jobSiteId, ...(input.actor.side === "CLIENT" ? { status: { not: "DRAFT" } } : {}) } })
    : input.category === "DISPUTE" ? await tx.jobSiteDispute.count({ where: { id: input.relatedId, jobSiteId: input.actor.jobSiteId } })
    : input.category === "PAYMENT_RECEIPT" ? await tx.jobSitePaymentRequest.count({ where: { id: input.relatedId, jobSiteId: input.actor.jobSiteId, status: { in: ["REQUESTED", "TRANSFER_DECLARED", "UNDER_REVIEW", "DISPUTED"] } } }) : 1;
  if (count !== 1) throw new AccessError("Record collegato non disponibile.", 404);
}

export async function uploadJobSiteAttachment(input: { actor: VNextActor; file: File; category: VNextAttachmentCategory; audience: "INTERNAL" | "SHARED"; expectedRevision: number; idempotencyKey: string; relatedId?: string | null }) {
  if (!input.idempotencyKey.trim() || input.idempotencyKey.length > 200) throw new AccessError("Idempotency-Key non valida.", 409, "IDEMPOTENCY_KEY_REQUIRED");
  await revalidateActor(input.actor);
  if (input.file.size < 1 || input.file.size > MAX_ATTACHMENT_BYTES) throw new AccessError("Il file supera il limite tecnico di 4 MiB.", 409, "FILE_SIZE_INVALID");
  if (input.actor.side === "CLIENT" && input.audience !== "SHARED") throw new AccessError("Il cliente può caricare soltanto contenuti condivisi.", 403);
  if (input.actor.side === "CLIENT" && !["REQUEST", "PROPOSAL", "DISPUTE", "PAYMENT_RECEIPT"].includes(input.category)) throw new AccessError("Il cliente può allegare file soltanto a richieste, proposte, dispute o dichiarazioni di pagamento.", 403);
  const bytes = Buffer.from(await input.file.arrayBuffer());
  const mimeType = await validateBinaryFileContent(bytes, input.file.type, MIME_BY_CATEGORY[input.category]);
  const checksumSha256 = createHash("sha256").update(bytes).digest("hex");
  const requestPayload = { expectedRevision: input.expectedRevision, category: input.category, audience: input.audience, relatedId: input.relatedId ?? null, originalFileName: input.file.name.slice(0, 255), mimeType, size: bytes.byteLength, checksumSha256 };
  const inputFingerprint = fingerprintPayload(requestPayload);
  const existing = await db.jobSiteActionReceipt.findUnique({ where: { organizationId_action_idempotencyKey: { organizationId: input.actor.organizationId, action: "ATTACHMENT_UPLOAD@1", idempotencyKey: input.idempotencyKey } }, select: { inputFingerprint: true, result: true, resultingRevision: true } });
  if (existing) {
    if (existing.inputFingerprint !== inputFingerprint) throw new AccessError("Idempotency-Key già usata con un input differente.", 409, "IDEMPOTENCY_FINGERPRINT_MISMATCH");
    return { ...(existing.result as Record<string, unknown>), replayed: true, revision: existing.resultingRevision };
  }

  const id = stableAttachmentId(input.actor.organizationId, input.idempotencyKey);
  const pathname = `organizations/${input.actor.organizationId}/job-sites/${input.actor.jobSiteId}/attachments/${id}-${checksumSha256.slice(0, 12)}.${safeExtension(mimeType)}`;
  await putPrivateBlob({ pathname, body: bytes, contentType: mimeType, maximumSizeInBytes: MAX_ATTACHMENT_BYTES, allowOverwrite: true });
  try {
    const execution = await runSerializableTransaction(async (tx) => {
      const site = await tx.jobSite.findFirst({ where: { id: input.actor.jobSiteId, organizationId: input.actor.organizationId }, select: { revision: true, status: true } });
      if (!site) throw new AccessError("Cantiere non trovato.", 404);
      if (site.revision !== input.expectedRevision) throw new AccessError("Il cantiere è stato modificato.", 409, "STALE_REVISION");
      const allowed = input.actor.side === "CLIENT" ? ["ACTIVE", "CLOSURE_PROPOSED"] : ["DRAFT", "WAITING_FOR_CLIENT", "PENDING_INITIAL_CONFIRMATION", "ACTIVE", "CLOSURE_PROPOSED"];
      if (!allowed.includes(site.status)) throw new AccessError("Il cantiere è read-only.", 409, "JOB_SITE_READ_ONLY");
      await requireRelatedRecord(tx, { actor: input.actor, category: input.category, relatedId: input.relatedId ?? null });
      const attachment = await tx.jobSiteAttachment.create({ data: { id, organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, category: input.category === "GENERAL" ? "OTHER" : input.category, sourceKind: "DIRECT_UPLOAD", sourceId: input.relatedId ?? null, blobKey: pathname, originalFileName: requestPayload.originalFileName, mimeType, size: bytes.byteLength, checksumSha256, uploadedByUserId: input.actor.userId }, select: { id: true, category: true, originalFileName: true, mimeType: true, size: true, checksumSha256: true, createdAt: true } });
      const sequence = (await tx.jobSite.update({ where: { id: input.actor.jobSiteId }, data: { timelineSequence: { increment: 1 } }, select: { timelineSequence: true } })).timelineSequence;
      const disclosure = input.category === "PAYMENT_RECEIPT" ? "RESTRICTED_COMMERCIAL" as const : "GENERAL" as const;
      const timelinePayload = { schemaVersion: 1, attachmentId: attachment.id, category: input.category, sourceId: input.relatedId ?? null };
      const event = await tx.jobSiteTimelineEvent.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, sequence, type: input.category === "EVIDENCE" ? "EVIDENCE" : "SHARED_DOCUMENT", audience: input.audience, disclosure, actorKind: input.actor.side, actorUserId: input.actor.userId, actorParticipantId: input.actor.participantId, title: attachment.originalFileName, payload: timelinePayload, fingerprint: fingerprintPayload(timelinePayload), attachments: { create: { attachmentId: attachment.id } } }, select: { id: true, sequence: true } });
      if (input.audience === "SHARED") await tx.jobSiteAttachmentPublication.create({ data: { attachmentId: attachment.id, eventId: event.id, audience: "SHARED", disclosure, publishedByUserId: input.actor.userId } });
      const updated = await tx.jobSite.updateMany({ where: { id: input.actor.jobSiteId, revision: input.expectedRevision }, data: { revision: { increment: 1 } } });
      if (updated.count !== 1) throw new AccessError("Il cantiere è stato modificato.", 409, "STALE_REVISION");
      const result = { ...attachment, createdAt: attachment.createdAt.toISOString(), timeline: { eventId: event.id, sequence: event.sequence.toString() } };
      await tx.jobSiteActionReceipt.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, action: "ATTACHMENT_UPLOAD@1", idempotencyKey: input.idempotencyKey, inputFingerprint, result, resultFingerprint: fingerprintPayload(result), actorUserId: input.actor.userId, actorParticipantId: input.actor.participantId, expectedRevision: input.expectedRevision, resultingRevision: input.expectedRevision + 1 } });
      await queueJobSiteNotifications(tx, { actor: input.actor, action: "ATTACHMENT_UPLOAD@1", idempotencyKey: input.idempotencyKey, sourceId: attachment.id });
      return { ...result, replayed: false, revision: input.expectedRevision + 1 };
    }, { shouldRetry: (error) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034" });
    await recordProductAuditEventBestEffort({ organizationId: input.actor.organizationId, actorUserId: input.actor.userId, action: "JOB_SITE_ATTACHMENT_UPLOADED", entityType: "JOB_SITE_ATTACHMENT", entityId: id });
    return execution;
  } catch (error) {
    const replay = await db.jobSiteActionReceipt.findUnique({ where: { organizationId_action_idempotencyKey: { organizationId: input.actor.organizationId, action: "ATTACHMENT_UPLOAD@1", idempotencyKey: input.idempotencyKey } }, select: { inputFingerprint: true, result: true, resultingRevision: true } }).catch(() => null);
    if (replay?.inputFingerprint === inputFingerprint) return { ...(replay.result as Record<string, unknown>), replayed: true, revision: replay.resultingRevision };
    await db.jobSiteAttachment.deleteMany({ where: { id } }).catch(() => undefined);
    const { deletePrivateBlob } = await import("./blob-storage-service");
    await deletePrivateBlob(pathname).catch(() => undefined);
    throw error;
  }
}

export async function downloadJobSiteAttachment(input: { actor: VNextActor; attachmentId: string }) {
  await revalidateActor(input.actor);
  const attachment = await db.jobSiteAttachment.findFirst({
    where: {
      id: input.attachmentId,
      jobSiteId: input.actor.jobSiteId,
      organizationId: input.actor.organizationId,
      archivedAt: null,
      ...(input.actor.side === "CLIENT" ? { publications: { some: { audience: "SHARED", withdrawnAt: null } } } : {}),
    },
    select: { id: true, category: true, blobKey: true, mimeType: true, originalFileName: true },
  });
  if (!attachment) throw new AccessError("Allegato non disponibile.", 404);
  if (attachment.category === "PAYMENT_RECEIPT" && input.actor.side === "ORGANIZATION_MEMBER") await requireEconomicAuthority(input.actor.participantId, "PAYMENT_CONFIRM_RECEIPT");
  const blob = await getPrivateBlob(attachment.blobKey);
  if (!blob) throw new AccessError("Allegato non disponibile.", 404);
  await recordProductAuditEventBestEffort({ organizationId: input.actor.organizationId, actorUserId: input.actor.userId, action: "JOB_SITE_ATTACHMENT_DOWNLOADED", entityType: "JOB_SITE_ATTACHMENT", entityId: attachment.id });
  return { ...blob, fileName: attachment.originalFileName, mimeType: attachment.mimeType };
}

export async function resolveOrganizationAttachmentActor(organizationId: string, jobSiteId: string, write = false) {
  return resolveOrganizationJobSiteActor({ organizationId, jobSiteId, permission: write ? "jobSite:update" : "jobSite:view" });
}

export async function resolveClientAttachmentActor(jobSiteId: string) {
  return resolveClientJobSiteActor(jobSiteId);
}
