import "server-only";

import crypto from "crypto";
import { db, type Prisma } from "@qoovex/db";
import type { EvidenceOrigin, EvidenceReviewStatus, EvidenceSensitivity, EvidenceType } from "@qoovex/types";
import { evidenceOrigins, evidenceReviewStatuses, evidenceSensitivities, evidenceTypes } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { deletePrivateBlob, getPrivateBlob, putPrivateBlob } from "./blob-storage-service";
import { isEnumValue, trimOptionalId, trimOptionalText, trimRequiredText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { canReadEvidence, getResourceScope, type ResourceScope } from "./resource-scope-service";
import { appendContextTimelineEvent } from "./context-timeline-service";
import { validateBinaryFileContent } from "./file-content-validation";

const EVIDENCE_READ_ROLES = ["OWNER", "COLLABORATOR"] as const;
const EVIDENCE_UPLOAD_ROLES = ["OWNER", "COLLABORATOR"] as const;
const EVIDENCE_ARCHIVE_ROLES = ["OWNER", "COLLABORATOR"] as const;

export const EVIDENCE_MAX_SIZE_BYTES = 4 * 1024 * 1024;
export const EVIDENCE_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const EVIDENCE_FILE_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;

const BLOB_INPUT_FIELDS = ["blobKey", "blobUrl", "url", "downloadUrl", "file", "files", "content", "base64", "binary"] as const;

const evidenceSelect = {
  id: true,
  organizationId: true,
  jobSiteId: true,
  workerId: true,
  checklistItemId: true,
  type: true,
  title: true,
  description: true,
  sensitivity: true,
  reviewStatus: true,
  origin: true,
  capturedAt: true,
  reviewedById: true,
  reviewedAt: true,
  reviewReason: true,
  blobKey: true,
  originalFileName: true,
  mimeType: true,
  size: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
  checklistItem: { select: { checklist: { select: { jobSiteId: true } } } },
} as const;

async function appendEvidenceTimeline(input: {
  evidence: { id: string; jobSiteId: string | null; workerId: string | null; title: string; reviewStatus: EvidenceReviewStatus; sensitivity: EvidenceSensitivity };
  organizationId: string;
  actorUserId: string;
  actorRole: "OWNER" | "COLLABORATOR";
  eventType: "EVIDENCE_RECORDED" | "EVIDENCE_REVIEWED" | "VALUE_CORRECTED";
  keySuffix: string;
  title: string;
  summary?: string | null;
}, client: Prisma.TransactionClient) {
  const common = { organizationId: input.organizationId, eventType: input.eventType, title: input.title, summary: input.summary ?? input.evidence.title, metadata: { evidenceId: input.evidence.id, reviewStatus: input.evidence.reviewStatus, sensitivity: input.evidence.sensitivity }, actorUserId: input.actorUserId, actorRole: input.actorRole, sourceType: "USER_ACTION" as const, sourceId: input.evidence.id };
  await appendContextTimelineEvent({ ...common, eventKey: `evidence:${input.evidence.id}:${input.keySuffix}:evidence`, targetType: "EVIDENCE", targetId: input.evidence.id }, client);
  if (input.evidence.jobSiteId) await appendContextTimelineEvent({ ...common, eventKey: `evidence:${input.evidence.id}:${input.keySuffix}:job-site`, targetType: "JOB_SITE", targetId: input.evidence.jobSiteId }, client);
  else if (input.evidence.workerId) await appendContextTimelineEvent({ ...common, eventKey: `evidence:${input.evidence.id}:${input.keySuffix}:worker`, targetType: "WORKER", targetId: input.evidence.workerId }, client);
}

export interface ListEvidenceInput {
  type?: unknown;
  jobSiteId?: unknown;
  workerId?: unknown;
  checklistItemId?: unknown;
  sensitivity?: unknown;
  capturedAt?: unknown;
  origin?: unknown;
  take?: number;
  skip?: number;
}

export interface CreateEvidenceInput extends Record<string, unknown> {
  type?: unknown;
  title?: unknown;
  description?: unknown;
  sensitivity?: unknown;
  capturedAt?: unknown;
  reason?: unknown;
  jobSiteId?: unknown;
  workerId?: unknown;
  checklistItemId?: unknown;
}

export interface UpdateEvidenceInput extends Record<string, unknown> {
  title?: unknown;
  description?: unknown;
}

export interface DownloadEvidenceResult {
  stream: ReadableStream<Uint8Array>;
  originalFileName: string;
  mimeType: string;
  size: number;
}

function toEvidenceResponse(evidence: {
  id: string;
  organizationId: string;
  jobSiteId: string | null;
  workerId: string | null;
  checklistItemId: string | null;
  type: EvidenceType;
  title: string;
  description: string | null;
  sensitivity: EvidenceSensitivity;
  reviewStatus: EvidenceReviewStatus;
  origin: EvidenceOrigin;
  capturedAt: Date | null;
  reviewedById: string | null;
  reviewedAt: Date | null;
  reviewReason: string | null;
  blobKey: string | null;
  originalFileName: string | null;
  mimeType: string | null;
  size: number | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}) {
  return {
    id: evidence.id,
    organizationId: evidence.organizationId,
    jobSiteId: evidence.jobSiteId,
    workerId: evidence.workerId,
    checklistItemId: evidence.checklistItemId,
    type: evidence.type,
    title: evidence.title,
    description: evidence.description,
    sensitivity: evidence.sensitivity,
    reviewStatus: evidence.reviewStatus,
    origin: evidence.origin,
    capturedAt: evidence.capturedAt?.toISOString() ?? null,
    reviewedById: evidence.reviewedById,
    reviewedAt: evidence.reviewedAt?.toISOString() ?? null,
    reviewReason: evidence.reviewReason,
    hasFile: Boolean(evidence.blobKey),
    originalFileName: evidence.originalFileName,
    mimeType: evidence.mimeType,
    size: evidence.size,
    createdById: evidence.createdById,
    createdAt: evidence.createdAt,
    updatedAt: evidence.updatedAt,
    archivedAt: evidence.archivedAt,
  };
}

function parseEvidenceType(value: unknown): EvidenceType {
  if (!isEnumValue(evidenceTypes, value)) throw new AccessError("Tipo prova non valido.", 409);
  return value;
}

function parseEvidenceSensitivity(value: unknown): EvidenceSensitivity {
  if (value === undefined) return "INTERNAL";
  if (!isEnumValue(evidenceSensitivities, value)) throw new AccessError("Sensibilita prova non valida.", 409);
  return value;
}

function parseEvidenceOrigin(value: unknown): Extract<EvidenceOrigin, "DIRECT_UPLOAD" | "GUIDED_MANUAL"> {
  if (value === undefined) return "DIRECT_UPLOAD";
  if (!isEnumValue(evidenceOrigins, value) || value === "AUTHORIZED_INTEGRATION") throw new AccessError("Origine prova non disponibile.", 409);
  return value;
}

function parseOptionalEvidenceDate(value: unknown, label: string): Date | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" && !(value instanceof Date)) throw new AccessError(`${label} non valida.`, 409);
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new AccessError(`${label} non valida.`, 409);
  return parsed;
}

function assertSensitiveEvidenceAccess(permissions: readonly string[], sensitivity: EvidenceSensitivity) {
  if (sensitivity === "RESTRICTED" && !permissions.includes("evidence:sensitive:read")) throw new AccessError("Prova non trovata.", 404);
}

function rejectBlobFields(input: Record<string, unknown>) {
  const field = BLOB_INPUT_FIELDS.find((key) => key in input);
  if (field) throw new AccessError("Questo endpoint non accetta file o riferimenti Blob.", 409);
}

function sanitizeFileName(name: string) {
  const normalized = name.normalize("NFKD").replace(/[^\w.\-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return normalized.slice(0, 120) || "prova";
}

function allowedTypesForEvidence(type: EvidenceType): readonly string[] {
  return type === "PHOTO" ? EVIDENCE_PHOTO_MIME_TYPES : EVIDENCE_FILE_MIME_TYPES;
}

function assertSingleEvidenceFile(type: EvidenceType, files: unknown[]): File {
  if (files.length === 0) throw new AccessError("File mancante.", 409);
  if (files.length > 1) throw new AccessError("Carica un solo file alla volta.", 409);
  const file = files[0];
  if (!(file instanceof File)) throw new AccessError("File mancante.", 409);
  if (file.size <= 0) throw new AccessError("File vuoto.", 409);
  if (file.size > EVIDENCE_MAX_SIZE_BYTES) throw new AccessError("File troppo grande.", 409);
  const allowedTypes = allowedTypesForEvidence(type);
  if (!allowedTypes.includes(file.type as never)) throw new AccessError("Formato file non supportato.", 409);
  return file;
}

async function normalizeEvidenceContext(organizationId: string, input: CreateEvidenceInput) {
  const jobSiteId = trimOptionalId(input.jobSiteId, "Cantiere") ?? null;
  const workerId = trimOptionalId(input.workerId, "Lavoratore") ?? null;
  const checklistItemId = trimOptionalId(input.checklistItemId, "Voce checklist") ?? null;
  if (!jobSiteId && !workerId && !checklistItemId) throw new AccessError("La prova richiede almeno un contesto.", 409);

  if (jobSiteId) {
    const jobSite = await db.jobSite.findFirst({ where: { id: jobSiteId, organizationId, archivedAt: null }, select: { id: true } });
    if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
  }
  if (workerId) {
    const worker = await db.worker.findFirst({ where: { id: workerId, organizationId, archivedAt: null }, select: { id: true } });
    if (!worker) throw new AccessError("Lavoratore non trovato.", 404);
  }
  if (checklistItemId) {
    const checklistItem = await db.checklistItem.findFirst({
      where: { id: checklistItemId, organizationId, status: { not: "ARCHIVED" }, checklist: { archivedAt: null } },
      select: { id: true, checklist: { select: { jobSiteId: true } } },
    });
    if (!checklistItem) throw new AccessError("Voce checklist non trovata.", 404);
  }
  return { jobSiteId, workerId, checklistItemId };
}

async function assertEvidenceContextAllowed(scope: ResourceScope, context: { jobSiteId: string | null; workerId: string | null; checklistItemId: string | null }) {
  if (scope.fullAccess) return;
  let checklistJobSiteId: string | null = null;
  if (context.checklistItemId) {
    const checklistItem = await db.checklistItem.findFirst({
      where: { id: context.checklistItemId, organizationId: scope.organizationId, status: { not: "ARCHIVED" }, checklist: { archivedAt: null } },
      select: { checklist: { select: { jobSiteId: true } } },
    });
    checklistJobSiteId = checklistItem?.checklist.jobSiteId ?? null;
  }

  if (scope.preset === "SITE_MANAGER") {
    const jobSiteId = context.jobSiteId ?? checklistJobSiteId;
    if (!jobSiteId || !scope.siteManagerJobSiteIds.includes(jobSiteId)) throw new AccessError("Risorsa non disponibile.", 404);
    return;
  }

  if (scope.preset === "LIMITED_UPLOAD") {
    if (context.workerId && context.workerId !== scope.linkedWorker?.id) throw new AccessError("Risorsa non disponibile.", 404);
    const jobSiteId = context.jobSiteId ?? checklistJobSiteId;
    if (jobSiteId && !scope.workerJobSiteIds.includes(jobSiteId)) throw new AccessError("Risorsa non disponibile.", 404);
    if (!context.workerId && !jobSiteId) throw new AccessError("Risorsa non disponibile.", 404);
    return;
  }

  throw new AccessError("Risorsa non disponibile.", 404);
}

async function findActiveEvidence(organizationId: string, evidenceId: string) {
  const evidence = await db.evidence.findFirst({ where: { id: evidenceId, organizationId, archivedAt: null }, select: evidenceSelect });
  if (!evidence) throw new AccessError("Prova non trovata.", 404);
  return evidence;
}

export async function listEvidence(input: ListEvidenceInput = {}) {
  const { context, organizationId } = await requireOrganizationDomainAccess("evidence:read", EVIDENCE_READ_ROLES);
  const scope = await getResourceScope(context);
  const where: Prisma.EvidenceWhereInput = {
    organizationId,
    archivedAt: null,
    ...(context.permissions.includes("evidence:sensitive:read") ? {} : { sensitivity: { not: "RESTRICTED" as const } }),
  };
  if (!scope.fullAccess) {
    if (scope.preset === "SITE_MANAGER") {
      where.OR = [
        { jobSiteId: { in: scope.siteManagerJobSiteIds } },
        { checklistItem: { checklist: { jobSiteId: { in: scope.siteManagerJobSiteIds } } } },
      ];
    }
    if (scope.preset === "LIMITED_UPLOAD" && scope.linkedWorker) {
      where.OR = [
        { workerId: scope.linkedWorker.id },
        { jobSiteId: { in: scope.workerJobSiteIds } },
        { checklistItem: { checklist: { jobSiteId: { in: scope.workerJobSiteIds } } } },
      ];
    }
    if (!where.OR) return [];
  }
  if (input.type !== undefined) where.type = parseEvidenceType(input.type);
  const jobSiteId = trimOptionalId(input.jobSiteId, "Cantiere");
  const workerId = trimOptionalId(input.workerId, "Lavoratore");
  const checklistItemId = trimOptionalId(input.checklistItemId, "Voce checklist");
  if (jobSiteId) where.jobSiteId = jobSiteId;
  if (workerId) where.workerId = workerId;
  if (checklistItemId) where.checklistItemId = checklistItemId;
  if (input.take !== undefined && (!Number.isSafeInteger(input.take) || input.take < 1 || input.take > 101)) throw new AccessError("Dimensione pagina prove non valida.", 409);
  if (input.skip !== undefined && (!Number.isSafeInteger(input.skip) || input.skip < 0 || input.skip > 499_950)) throw new AccessError("Pagina prove non valida.", 409);

  const evidence = await db.evidence.findMany({
    where,
    select: evidenceSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    ...(input.take === undefined ? {} : { take: input.take }),
    ...(input.skip === undefined ? {} : { skip: input.skip }),
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "evidence" });
  return evidence.map(toEvidenceResponse);
}

export async function getEvidence(evidenceId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("evidence:read", EVIDENCE_READ_ROLES);
  const scope = await getResourceScope(context);
  const evidence = await findActiveEvidence(organizationId, evidenceId);
  if (!canReadEvidence(scope, evidence)) throw new AccessError("Prova non trovata.", 404);
  assertSensitiveEvidenceAccess(context.permissions, evidence.sensitivity);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "evidence", resourceId: evidence.id });
  return toEvidenceResponse(evidence);
}

export async function createEvidenceNote(input: CreateEvidenceInput) {
  rejectBlobFields(input);
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("evidence:upload", EVIDENCE_UPLOAD_ROLES);
  const scope = await getResourceScope(context);
  const type = parseEvidenceType(input.type);
  if (type !== "NOTE") throw new AccessError("Questo endpoint accetta solo note operative.", 409);
  const title = trimRequiredText(input.title, "Titolo prova", 2, 160);
  const description = trimOptionalText(input.description, "Descrizione prova", 4000) ?? null;
  const sensitivity = parseEvidenceSensitivity(input.sensitivity);
  const origin = parseEvidenceOrigin(input.origin);
  const capturedAt = parseOptionalEvidenceDate(input.capturedAt, "Data acquisizione");
  const evidenceContext = await normalizeEvidenceContext(organizationId, input);
  await assertEvidenceContextAllowed(scope, evidenceContext);

  const evidence = await db.$transaction(async (tx) => {
    const created = await tx.evidence.create({ data: { organizationId, ...evidenceContext, type, title, description, sensitivity, origin, capturedAt, createdById: context.userId }, select: evidenceSelect });
    await appendEvidenceTimeline({ evidence: created, organizationId, actorUserId: context.userId, actorRole, eventType: "EVIDENCE_RECORDED", keySuffix: "recorded", title: "Prova registrata" }, tx);
    return created;
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "evidence", resourceId: evidence.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "EVIDENCE_CREATED",
    entityType: "EVIDENCE",
    entityId: evidence.id,
    metadata: { entityType: evidence.type, hasFile: false },
  });
  return toEvidenceResponse(evidence);
}

export async function uploadEvidenceFile(input: CreateEvidenceInput, files: unknown[]) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("evidence:upload", EVIDENCE_UPLOAD_ROLES);
  const scope = await getResourceScope(context);
  const type = parseEvidenceType(input.type);
  if (type === "NOTE") throw new AccessError("La nota operativa non accetta file.", 409);
  const title = trimRequiredText(input.title, "Titolo prova", 2, 160);
  const description = trimOptionalText(input.description, "Descrizione prova", 4000) ?? null;
  const sensitivity = parseEvidenceSensitivity(input.sensitivity);
  const origin = parseEvidenceOrigin(input.origin);
  const capturedAt = parseOptionalEvidenceDate(input.capturedAt, "Data acquisizione");
  const evidenceContext = await normalizeEvidenceContext(organizationId, input);
  await assertEvidenceContextAllowed(scope, evidenceContext);
  const file = assertSingleEvidenceFile(type, files);
  const evidenceId = crypto.randomUUID();
  const originalFileName = file.name.trim() || "prova";
  const safeFileName = sanitizeFileName(originalFileName);
  const blobKey = `organizations/${organizationId}/evidence/${evidenceId}/${safeFileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedMimeType = await validateBinaryFileContent(buffer, file.type, allowedTypesForEvidence(type));

  const uploadedBlob = await putPrivateBlob({
    pathname: blobKey,
    body: buffer,
    contentType: detectedMimeType,
    maximumSizeInBytes: EVIDENCE_MAX_SIZE_BYTES,
  });
  const storedBlobKey = uploadedBlob.pathname;

  try {
    const evidence = await db.$transaction(async (tx) => {
      const created = await tx.evidence.create({ data: {
        id: evidenceId,
        organizationId,
        ...evidenceContext,
        type,
        title,
        description,
        sensitivity,
        origin,
        capturedAt,
        blobKey: storedBlobKey,
        originalFileName,
        mimeType: detectedMimeType,
        size: file.size,
        createdById: context.userId,
      }, select: evidenceSelect });
      await appendEvidenceTimeline({ evidence: created, organizationId, actorUserId: context.userId, actorRole, eventType: "EVIDENCE_RECORDED", keySuffix: "recorded", title: "Prova registrata" }, tx);
      return created;
    });
    await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "evidence", resourceId: evidence.id });
    await recordProductAuditEventBestEffort({
      organizationId,
      ...auditActorFromContext(context, actorRole),
      action: "EVIDENCE_CREATED",
      entityType: "EVIDENCE",
      entityId: evidence.id,
      metadata: { entityType: evidence.type, mimeType: evidence.mimeType, size: evidence.size, hasFile: true },
    });
    return toEvidenceResponse(evidence);
  } catch (error) {
    await deletePrivateBlob(storedBlobKey).catch(() => undefined);
    throw error;
  }
}

export async function updateEvidence(evidenceId: string, input: UpdateEvidenceInput) {
  rejectBlobFields(input);
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("evidence:upload", EVIDENCE_UPLOAD_ROLES);
  const scope = await getResourceScope(context);
  const existing = await findActiveEvidence(organizationId, evidenceId);
  if (!canReadEvidence(scope, existing)) throw new AccessError("Prova non trovata.", 404);
  assertSensitiveEvidenceAccess(context.permissions, existing.sensitivity);
  const data: { title?: string; description?: string | null; sensitivity?: EvidenceSensitivity; capturedAt?: Date | null } = {};
  if (input.title !== undefined) data.title = trimRequiredText(input.title, "Titolo prova", 2, 160);
  if (input.description !== undefined) data.description = trimOptionalText(input.description, "Descrizione prova", 4000) ?? null;
  if (input.sensitivity !== undefined) data.sensitivity = parseEvidenceSensitivity(input.sensitivity);
  if (input.capturedAt !== undefined) data.capturedAt = parseOptionalEvidenceDate(input.capturedAt, "Data acquisizione");
  if (!Object.keys(data).length) throw new AccessError("Nessun dato prova da aggiornare.", 409);
  const reason = trimOptionalText(input.reason, "Motivo modifica", 1000) ?? null;

  const evidence = await db.$transaction(async (tx) => {
    const updated = await tx.evidence.update({ where: { id: existing.id }, data, select: evidenceSelect });
    const latest = await tx.evidenceRevision.findFirst({
      where: { organizationId, evidenceId: existing.id },
      select: { revisionNumber: true },
      orderBy: { revisionNumber: "desc" },
    });
    await tx.evidenceRevision.create({
      data: {
        organizationId,
        evidenceId: updated.id,
        revisionNumber: (latest?.revisionNumber ?? 0) + 1,
        title: updated.title,
        description: updated.description,
        sensitivity: updated.sensitivity,
        reviewStatus: updated.reviewStatus,
        capturedAt: updated.capturedAt,
        origin: updated.origin,
        reason,
        createdById: context.userId,
      },
      select: { id: true },
    });
    await appendEvidenceTimeline({ evidence: updated, organizationId, actorUserId: context.userId, actorRole, eventType: "VALUE_CORRECTED", keySuffix: `updated:${updated.updatedAt.toISOString()}`, title: "Metadati prova aggiornati", summary: reason }, tx);
    return updated;
  }, { isolationLevel: "Serializable" });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "evidence", resourceId: evidence.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "EVIDENCE_UPDATED",
    entityType: "EVIDENCE",
    entityId: evidence.id,
    metadata: { reviewStatus: evidence.reviewStatus, sensitivity: evidence.sensitivity },
  });
  return toEvidenceResponse(evidence);
}

export async function reviewEvidence(evidenceId: string, input: { decision?: unknown; reason?: unknown; sensitivity?: unknown }) {
  const decision = input.decision === "SUBMIT" ? "REQUEST_REVIEW" : input.decision;
  if (decision !== "REQUEST_REVIEW" && decision !== "ACCEPT" && decision !== "REJECT") throw new AccessError("Decisione revisione prova non valida.", 409);
  const requiredPermission = decision === "REQUEST_REVIEW" ? "evidence:upload" : "evidence:review";
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess(requiredPermission, EVIDENCE_UPLOAD_ROLES);
  const scope = await getResourceScope(context);
  const existing = await findActiveEvidence(organizationId, evidenceId);
  if (!canReadEvidence(scope, existing)) throw new AccessError("Prova non trovata.", 404);
  assertSensitiveEvidenceAccess(context.permissions, existing.sensitivity);
  if (decision === "REQUEST_REVIEW" && existing.reviewStatus !== "RECORDED") throw new AccessError("La prova non puo essere inviata in revisione.", 409);
  if (decision !== "REQUEST_REVIEW" && existing.reviewStatus !== "TO_REVIEW") throw new AccessError("La prova non e in attesa di revisione.", 409);
  const reason = trimOptionalText(input.reason, "Motivo revisione", 1000) ?? null;
  if (decision === "REJECT" && !reason) throw new AccessError("Indica il motivo del rifiuto.", 409);
  const sensitivity = input.sensitivity === undefined ? existing.sensitivity : parseEvidenceSensitivity(input.sensitivity);
  const nextStatus: EvidenceReviewStatus = decision === "REQUEST_REVIEW" ? "TO_REVIEW" : decision === "ACCEPT" ? "ACCEPTED" : "REJECTED";
  const reviewedAt = decision === "REQUEST_REVIEW" ? null : new Date();

  const evidence = await db.$transaction(async (tx) => {
    const updated = await tx.evidence.update({
      where: { id: existing.id },
      data: {
        reviewStatus: nextStatus,
        sensitivity,
        reviewedById: reviewedAt ? context.userId : null,
        reviewedAt,
        reviewReason: reason,
      },
      select: evidenceSelect,
    });
    const latest = await tx.evidenceRevision.findFirst({
      where: { organizationId, evidenceId: existing.id },
      select: { revisionNumber: true },
      orderBy: { revisionNumber: "desc" },
    });
    await tx.evidenceRevision.create({
      data: {
        organizationId,
        evidenceId: updated.id,
        revisionNumber: (latest?.revisionNumber ?? 0) + 1,
        title: updated.title,
        description: updated.description,
        sensitivity: updated.sensitivity,
        reviewStatus: updated.reviewStatus,
        capturedAt: updated.capturedAt,
        origin: updated.origin,
        reason,
        createdById: context.userId,
      },
      select: { id: true },
    });
    await appendEvidenceTimeline({ evidence: updated, organizationId, actorUserId: context.userId, actorRole, eventType: "EVIDENCE_REVIEWED", keySuffix: `reviewed:${nextStatus}`, title: decision === "REQUEST_REVIEW" ? "Prova inviata in revisione" : decision === "ACCEPT" ? "Prova approvata" : "Prova rifiutata", summary: reason }, tx);
    return updated;
  }, { isolationLevel: "Serializable" });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "EVIDENCE_REVIEWED",
    entityType: "EVIDENCE",
    entityId: evidence.id,
    metadata: { decision, reviewStatus: evidence.reviewStatus, sensitivity: evidence.sensitivity },
  });
  return toEvidenceResponse(evidence);
}

export async function archiveEvidence(evidenceId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("evidence:delete", EVIDENCE_ARCHIVE_ROLES);
  const existing = await findActiveEvidence(organizationId, evidenceId);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "evidence", resourceId: existing.id });
  const evidence = await db.evidence.update({
    where: { id: existing.id },
    data: { archivedAt: new Date() },
    select: evidenceSelect,
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "EVIDENCE_ARCHIVED",
    entityType: "EVIDENCE",
    entityId: evidence.id,
    metadata: { entityType: evidence.type, mimeType: evidence.mimeType, size: evidence.size, hasFile: Boolean(evidence.blobKey) },
  });
  return toEvidenceResponse(evidence);
}

export async function getEvidenceDownload(evidenceId: string): Promise<DownloadEvidenceResult> {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("evidence:file:read", EVIDENCE_READ_ROLES);
  const scope = await getResourceScope(context);
  const evidence = await findActiveEvidence(organizationId, evidenceId);
  if (!canReadEvidence(scope, evidence)) throw new AccessError("Prova non trovata.", 404);
  assertSensitiveEvidenceAccess(context.permissions, evidence.sensitivity);
  if (!evidence.blobKey || !evidence.originalFileName || !evidence.mimeType || evidence.size === null) {
    throw new AccessError("File prova non trovato.", 404);
  }
  const blob = await getPrivateBlob(evidence.blobKey);
  if (!blob) throw new AccessError("File prova non trovato.", 404);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "evidence-file", resourceId: evidence.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "EVIDENCE_DOWNLOADED",
    entityType: "EVIDENCE",
    entityId: evidence.id,
    metadata: { entityType: evidence.type, mimeType: evidence.mimeType, size: evidence.size, hasFile: true },
  });
  return {
    stream: blob.stream,
    originalFileName: evidence.originalFileName,
    mimeType: evidence.mimeType,
    size: evidence.size,
  };
}
