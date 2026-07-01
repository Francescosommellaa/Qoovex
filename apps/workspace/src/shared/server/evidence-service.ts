import "server-only";

import crypto from "crypto";
import { db } from "@qoovex/db";
import type { EvidenceType } from "@qoovex/types";
import { evidenceTypes } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { deletePrivateBlob, getPrivateBlob, putPrivateBlob } from "./blob-storage-service";
import { isEnumValue, trimOptionalId, trimOptionalText, trimRequiredText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";

const EVIDENCE_ACCESS_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] as const;
const EVIDENCE_ARCHIVE_ROLES = ["OWNER", "ADMIN"] as const;

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
  blobKey: true,
  originalFileName: true,
  mimeType: true,
  size: true,
  createdById: true,
  createdAt: true,
  archivedAt: true,
} as const;

export interface ListEvidenceInput {
  type?: unknown;
  jobSiteId?: unknown;
  workerId?: unknown;
  checklistItemId?: unknown;
}

export interface CreateEvidenceInput extends Record<string, unknown> {
  type?: unknown;
  title?: unknown;
  description?: unknown;
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
  blobKey: string | null;
  originalFileName: string | null;
  mimeType: string | null;
  size: number | null;
  createdById: string;
  createdAt: Date;
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
    hasFile: Boolean(evidence.blobKey),
    originalFileName: evidence.originalFileName,
    mimeType: evidence.mimeType,
    size: evidence.size,
    createdById: evidence.createdById,
    createdAt: evidence.createdAt,
    archivedAt: evidence.archivedAt,
  };
}

function parseEvidenceType(value: unknown): EvidenceType {
  if (!isEnumValue(evidenceTypes, value)) throw new AccessError("Tipo prova non valido.", 409);
  return value;
}

function rejectBlobFields(input: Record<string, unknown>) {
  const field = BLOB_INPUT_FIELDS.find((key) => key in input);
  if (field) throw new AccessError("Questo endpoint non accetta file o riferimenti Blob.", 409);
}

function sanitizeFileName(name: string) {
  const normalized = name.normalize("NFKD").replace(/[^\w.\-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return normalized.slice(0, 120) || "prova";
}

function assertSingleEvidenceFile(type: EvidenceType, files: unknown[]): File {
  if (files.length === 0) throw new AccessError("File mancante.", 409);
  if (files.length > 1) throw new AccessError("Carica un solo file alla volta.", 409);
  const file = files[0];
  if (!(file instanceof File)) throw new AccessError("File mancante.", 409);
  if (file.size <= 0) throw new AccessError("File vuoto.", 409);
  if (file.size > EVIDENCE_MAX_SIZE_BYTES) throw new AccessError("File troppo grande.", 409);
  const allowedTypes = type === "PHOTO" ? EVIDENCE_PHOTO_MIME_TYPES : EVIDENCE_FILE_MIME_TYPES;
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
      select: { id: true },
    });
    if (!checklistItem) throw new AccessError("Voce checklist non trovata.", 404);
  }
  return { jobSiteId, workerId, checklistItemId };
}

async function findActiveEvidence(organizationId: string, evidenceId: string) {
  const evidence = await db.evidence.findFirst({ where: { id: evidenceId, organizationId, archivedAt: null }, select: evidenceSelect });
  if (!evidence) throw new AccessError("Prova non trovata.", 404);
  return evidence;
}

export async function listEvidence(input: ListEvidenceInput = {}) {
  const { context, organizationId } = await requireOrganizationDomainAccess("evidence:read", EVIDENCE_ACCESS_ROLES);
  const where: { organizationId: string; archivedAt: null; type?: EvidenceType; jobSiteId?: string; workerId?: string; checklistItemId?: string } = {
    organizationId,
    archivedAt: null,
  };
  if (input.type !== undefined) where.type = parseEvidenceType(input.type);
  const jobSiteId = trimOptionalId(input.jobSiteId, "Cantiere");
  const workerId = trimOptionalId(input.workerId, "Lavoratore");
  const checklistItemId = trimOptionalId(input.checklistItemId, "Voce checklist");
  if (jobSiteId) where.jobSiteId = jobSiteId;
  if (workerId) where.workerId = workerId;
  if (checklistItemId) where.checklistItemId = checklistItemId;

  const evidence = await db.evidence.findMany({ where, select: evidenceSelect, orderBy: { createdAt: "desc" } });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "evidence" });
  return evidence.map(toEvidenceResponse);
}

export async function getEvidence(evidenceId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("evidence:read", EVIDENCE_ACCESS_ROLES);
  const evidence = await findActiveEvidence(organizationId, evidenceId);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "evidence", resourceId: evidence.id });
  return toEvidenceResponse(evidence);
}

export async function createEvidenceNote(input: CreateEvidenceInput) {
  rejectBlobFields(input);
  const { context, organizationId } = await requireOrganizationDomainAccess("evidence:upload", EVIDENCE_ACCESS_ROLES);
  const type = parseEvidenceType(input.type);
  if (type !== "NOTE") throw new AccessError("Questo endpoint accetta solo note operative.", 409);
  const title = trimRequiredText(input.title, "Titolo prova", 2, 160);
  const description = trimOptionalText(input.description, "Descrizione prova", 4000) ?? null;
  const evidenceContext = await normalizeEvidenceContext(organizationId, input);

  const evidence = await db.evidence.create({
    data: { organizationId, ...evidenceContext, type, title, description, createdById: context.userId },
    select: evidenceSelect,
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "evidence", resourceId: evidence.id });
  return toEvidenceResponse(evidence);
}

export async function uploadEvidenceFile(input: CreateEvidenceInput, files: unknown[]) {
  const { context, organizationId } = await requireOrganizationDomainAccess("evidence:upload", EVIDENCE_ACCESS_ROLES);
  const type = parseEvidenceType(input.type);
  if (type === "NOTE") throw new AccessError("La nota operativa non accetta file.", 409);
  const title = trimRequiredText(input.title, "Titolo prova", 2, 160);
  const description = trimOptionalText(input.description, "Descrizione prova", 4000) ?? null;
  const evidenceContext = await normalizeEvidenceContext(organizationId, input);
  const file = assertSingleEvidenceFile(type, files);
  const evidenceId = crypto.randomUUID();
  const originalFileName = file.name.trim() || "prova";
  const safeFileName = sanitizeFileName(originalFileName);
  const blobKey = `organizations/${organizationId}/evidence/${evidenceId}/${safeFileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadedBlob = await putPrivateBlob({
    pathname: blobKey,
    body: buffer,
    contentType: file.type,
    maximumSizeInBytes: EVIDENCE_MAX_SIZE_BYTES,
  });
  const storedBlobKey = uploadedBlob.pathname;

  try {
    const evidence = await db.evidence.create({
      data: {
        id: evidenceId,
        organizationId,
        ...evidenceContext,
        type,
        title,
        description,
        blobKey: storedBlobKey,
        originalFileName,
        mimeType: file.type,
        size: file.size,
        createdById: context.userId,
      },
      select: evidenceSelect,
    });
    await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "evidence", resourceId: evidence.id });
    return toEvidenceResponse(evidence);
  } catch (error) {
    await deletePrivateBlob(storedBlobKey).catch(() => undefined);
    throw error;
  }
}

export async function updateEvidence(evidenceId: string, input: UpdateEvidenceInput) {
  rejectBlobFields(input);
  const { context, organizationId } = await requireOrganizationDomainAccess("evidence:upload", EVIDENCE_ACCESS_ROLES);
  const existing = await findActiveEvidence(organizationId, evidenceId);
  const data: { title?: string; description?: string | null } = {};
  if (input.title !== undefined) data.title = trimRequiredText(input.title, "Titolo prova", 2, 160);
  if (input.description !== undefined) data.description = trimOptionalText(input.description, "Descrizione prova", 4000) ?? null;
  if (!Object.keys(data).length) throw new AccessError("Nessun dato prova da aggiornare.", 409);

  const evidence = await db.evidence.update({ where: { id: existing.id }, data, select: evidenceSelect });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "evidence", resourceId: evidence.id });
  return toEvidenceResponse(evidence);
}

export async function archiveEvidence(evidenceId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("evidence:delete", EVIDENCE_ARCHIVE_ROLES);
  const existing = await findActiveEvidence(organizationId, evidenceId);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "evidence", resourceId: existing.id });
  const evidence = await db.evidence.update({
    where: { id: existing.id },
    data: { archivedAt: new Date() },
    select: evidenceSelect,
  });
  return toEvidenceResponse(evidence);
}

export async function getEvidenceDownload(evidenceId: string): Promise<DownloadEvidenceResult> {
  const { context, organizationId } = await requireOrganizationDomainAccess("evidence:read", EVIDENCE_ACCESS_ROLES);
  const evidence = await findActiveEvidence(organizationId, evidenceId);
  if (!evidence.blobKey || !evidence.originalFileName || !evidence.mimeType || evidence.size === null) {
    throw new AccessError("File prova non trovato.", 404);
  }
  const blob = await getPrivateBlob(evidence.blobKey);
  if (!blob) throw new AccessError("File prova non trovato.", 404);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "evidence-file", resourceId: evidence.id });
  return {
    stream: blob.stream,
    originalFileName: evidence.originalFileName,
    mimeType: evidence.mimeType,
    size: evidence.size,
  };
}
