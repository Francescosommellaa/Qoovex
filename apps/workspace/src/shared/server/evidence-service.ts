import "server-only";

import crypto from "node:crypto";
import { db } from "@qoovex/db";
import { evidenceTypes, type EvidenceType } from "@qoovex/types";
import { AccessError } from "./access-errors";
import { deletePrivateBlob, getPrivateBlob, putPrivateBlob } from "./blob-storage-service";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { trimOptionalText, trimRequiredText } from "./document-domain-validation";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { getResourceScope } from "./resource-scope-service";
import { validateBinaryFileContent } from "./file-content-validation";

const ROLES = ["OWNER", "COLLABORATOR"] as const;
const MAX_SIZE = 8 * 1024 * 1024;
const MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;
const select = { id: true, organizationId: true, jobSiteId: true, workerId: true, type: true, title: true, description: true, capturedAt: true, blobKey: true, originalFileName: true, mimeType: true, size: true, createdById: true, createdAt: true, updatedAt: true, archivedAt: true } as const;

function evidenceType(value: unknown): EvidenceType {
  if (typeof value !== "string" || !evidenceTypes.includes(value as EvidenceType)) throw new AccessError("Tipo prova non valido.", 409);
  return value as EvidenceType;
}
function date(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new AccessError("Data non valida.", 409);
  const parsed = new Date(value); if (Number.isNaN(parsed.getTime())) throw new AccessError("Data non valida.", 409); return parsed;
}
async function assertLinks(organizationId: string, jobSiteId: string | null, workerId: string | null) {
  if (jobSiteId && !await db.jobSite.findFirst({ where: { id: jobSiteId, organizationId, archivedAt: null }, select: { id: true } })) throw new AccessError("Cantiere non trovato.", 404);
  if (workerId && !await db.worker.findFirst({ where: { id: workerId, organizationId, archivedAt: null }, select: { id: true } })) throw new AccessError("Lavoratore non trovato.", 404);
}
function links(input: Record<string, unknown>) { return { jobSiteId: typeof input.jobSiteId === "string" && input.jobSiteId.trim() ? input.jobSiteId.trim() : null, workerId: typeof input.workerId === "string" && input.workerId.trim() ? input.workerId.trim() : null }; }

export async function listEvidence(filters: { type?: unknown; jobSiteId?: unknown; workerId?: unknown; take?: number; skip?: number } = {}) {
  const { context, organizationId } = await requireOrganizationDomainAccess("evidence:read", ROLES);
  const scope = await getResourceScope(context);
  const type = filters.type === undefined ? undefined : evidenceType(filters.type);
  const jobSiteId = typeof filters.jobSiteId === "string" && filters.jobSiteId.trim() ? filters.jobSiteId.trim() : undefined;
  const workerId = typeof filters.workerId === "string" && filters.workerId.trim() ? filters.workerId.trim() : undefined;
  return db.evidence.findMany({ where: { organizationId, archivedAt: null, ...(type ? { type } : {}), ...(jobSiteId ? { jobSiteId } : {}), ...(workerId ? { workerId } : {}), ...(scope.fullAccess ? {} : { OR: [{ jobSiteId: { in: scope.visibleJobSiteIds } }, { workerId: { in: scope.visibleWorkerIds } }] }) }, select, orderBy: { createdAt: "desc" }, take: filters.take, skip: filters.skip });
}

export async function getEvidence(id: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("evidence:read", ROLES);
  const scope = await getResourceScope(context);
  const value = await db.evidence.findFirst({ where: { id, organizationId }, select: { ...select, revisions: { orderBy: { revisionNumber: "desc" } } } });
  if (!value || (!scope.fullAccess && !scope.visibleJobSiteIds.includes(value.jobSiteId ?? "") && !scope.visibleWorkerIds.includes(value.workerId ?? ""))) throw new AccessError("Prova non trovata.", 404);
  return value;
}

async function create(input: Record<string, unknown>, file?: File) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("evidence:upload", ROLES);
  const type = evidenceType(input.type ?? (file ? "FILE" : "NOTE"));
  const refs = links(input); await assertLinks(organizationId, refs.jobSiteId, refs.workerId);
  let uploaded: { pathname: string } | null = null;
  let buffer: Buffer | null = null; let mimeType: string | null = null;
  if (file) {
    if (!file.size || file.size > MAX_SIZE || !MIME_TYPES.includes(file.type as never)) throw new AccessError("File prova non valido.", 409);
    buffer = Buffer.from(await file.arrayBuffer()); mimeType = await validateBinaryFileContent(buffer, file.type, MIME_TYPES);
    uploaded = await putPrivateBlob({ pathname: `organizations/${organizationId}/evidence/${crypto.randomUUID()}/${file.name || "evidence"}`, body: buffer, contentType: mimeType, maximumSizeInBytes: MAX_SIZE });
  }
  try {
    const value = await db.evidence.create({ data: { organizationId, ...refs, type, title: trimRequiredText(input.title, "Titolo prova", 2, 200), description: trimOptionalText(input.description, "Descrizione", 4000) ?? null, capturedAt: date(input.capturedAt), blobKey: uploaded?.pathname ?? null, originalFileName: file?.name ?? null, mimeType, size: file?.size ?? null, createdById: context.userId }, select });
    await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "EVIDENCE_CREATED", entityType: "EVIDENCE", entityId: value.id, outcome: "SUCCESS", metadata: { hasFile: Boolean(file) } });
    return value;
  } catch (error) { if (uploaded) await deletePrivateBlob(uploaded.pathname).catch(() => undefined); throw error; }
}

export function createEvidenceNote(input: Record<string, unknown>) { return create(input); }
export async function uploadEvidenceFile(input: Record<string, unknown>, files: unknown[]) {
  if (files.length !== 1 || !(files[0] instanceof File)) throw new AccessError("Carica un solo file.", 409);
  return create(input, files[0]);
}

export async function updateEvidence(id: string, input: Record<string, unknown>) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("evidence:upload", ROLES);
  const existing = await getEvidence(id); const refs = links({ jobSiteId: input.jobSiteId ?? existing.jobSiteId, workerId: input.workerId ?? existing.workerId }); await assertLinks(organizationId, refs.jobSiteId, refs.workerId);
  const value = await db.$transaction(async (tx) => {
    const count = await tx.evidenceRevision.count({ where: { evidenceId: id } });
    await tx.evidenceRevision.create({ data: { organizationId, evidenceId: id, revisionNumber: count + 1, title: existing.title, description: existing.description, capturedAt: existing.capturedAt, reason: trimOptionalText(input.reason, "Motivazione", 1000) ?? null, createdById: context.userId } });
    return tx.evidence.update({ where: { id }, data: { ...refs, ...(input.type !== undefined ? { type: evidenceType(input.type) } : {}), ...(input.title !== undefined ? { title: trimRequiredText(input.title, "Titolo prova", 2, 200) } : {}), ...(input.description !== undefined ? { description: trimOptionalText(input.description, "Descrizione", 4000) ?? null } : {}), ...(input.capturedAt !== undefined ? { capturedAt: date(input.capturedAt) } : {}) }, select });
  });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "EVIDENCE_UPDATED", entityType: "EVIDENCE", entityId: id, outcome: "SUCCESS" }); return value;
}

export async function archiveEvidence(id: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("evidence:delete", ROLES); await getEvidence(id);
  const value = await db.evidence.update({ where: { id }, data: { archivedAt: new Date() }, select });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "EVIDENCE_ARCHIVED", entityType: "EVIDENCE", entityId: id, outcome: "SUCCESS" }); return value;
}

export async function getEvidenceDownload(id: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("evidence:file:read", ROLES); const value = await getEvidence(id);
  if (!value.blobKey || !value.originalFileName || !value.mimeType || value.size === null) throw new AccessError("La prova non contiene un file.", 404);
  const blob = await getPrivateBlob(value.blobKey); if (!blob) throw new AccessError("File prova non trovato.", 404);
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "EVIDENCE_DOWNLOADED", entityType: "EVIDENCE", entityId: id, outcome: "SUCCESS" });
  return { stream: blob.stream, originalFileName: value.originalFileName, mimeType: value.mimeType, size: value.size };
}
