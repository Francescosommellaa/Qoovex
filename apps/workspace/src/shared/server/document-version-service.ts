import "server-only";

import crypto from "crypto";
import { db } from "@qoovex/db";
import { enqueueOperationalProcess } from "@shared/server/operational-process-service";
import { AccessError } from "@shared/server/access-errors";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { deletePrivateBlob, getPrivateBlob, putPrivateBlob } from "./blob-storage-service";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { canReadDocument, getResourceScope } from "./resource-scope-service";
import { appendContextTimelineEvent } from "./context-timeline-service";
import { validateBinaryFileContent } from "./file-content-validation";

const DOCUMENT_VERSION_UPLOAD_ROLES = ["OWNER", "COLLABORATOR"] as const;
const DOCUMENT_VERSION_READ_ROLES = ["OWNER", "COLLABORATOR"] as const;
const DOCUMENT_VERSION_ARCHIVE_ROLES = ["OWNER", "COLLABORATOR"] as const;

export const DOCUMENT_VERSION_MAX_SIZE_BYTES = 4 * 1024 * 1024;
export const DOCUMENT_VERSION_ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;

const documentVersionSelect = {
  id: true,
  organizationId: true,
  documentId: true,
  blobKey: true,
  originalFileName: true,
  mimeType: true,
  size: true,
  checksum: true,
  uploadedById: true,
  reviewStatus: true,
  reviewedById: true,
  reviewedAt: true,
  reviewReason: true,
  createdAt: true,
  archivedAt: true,
} as const;

export const documentVersionListSelect = {
  id: true,
  organizationId: true,
  documentId: true,
  originalFileName: true,
  mimeType: true,
  size: true,
  checksum: true,
  uploadedById: true,
  reviewStatus: true,
  reviewedById: true,
  reviewedAt: true,
  reviewReason: true,
  createdAt: true,
  archivedAt: true,
} as const;

export interface DocumentVersionResponse {
  id: string;
  organizationId: string;
  documentId: string;
  originalFileName: string;
  mimeType: string;
  size: number;
  checksum: string | null;
  uploadedById: string;
  reviewStatus: "TO_REVIEW" | "CURRENT" | "SUPERSEDED" | "REJECTED";
  reviewedById: string | null;
  reviewedAt: Date | null;
  reviewReason: string | null;
  createdAt: Date;
  archivedAt: Date | null;
}

export interface DownloadDocumentVersionResult {
  stream: ReadableStream<Uint8Array>;
  originalFileName: string;
  mimeType: string;
  size: number;
}

export function toDocumentVersionResponse(version: {
  id: string;
  organizationId: string;
  documentId: string;
  originalFileName: string;
  mimeType: string;
  size: number;
  checksum: string | null;
  uploadedById: string;
  reviewStatus: "TO_REVIEW" | "CURRENT" | "SUPERSEDED" | "REJECTED";
  reviewedById: string | null;
  reviewedAt: Date | null;
  reviewReason: string | null;
  createdAt: Date;
  archivedAt: Date | null;
}): DocumentVersionResponse {
  return {
    id: version.id,
    organizationId: version.organizationId,
    documentId: version.documentId,
    originalFileName: version.originalFileName,
    mimeType: version.mimeType,
    size: version.size,
    checksum: version.checksum,
    uploadedById: version.uploadedById,
    reviewStatus: version.reviewStatus,
    reviewedById: version.reviewedById,
    reviewedAt: version.reviewedAt,
    reviewReason: version.reviewReason,
    createdAt: version.createdAt,
    archivedAt: version.archivedAt,
  };
}

function sanitizeFileName(name: string) {
  const fallback = "documento";
  const normalized = name.normalize("NFKD").replace(/[^\w.\-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const safe = normalized.slice(0, 120);
  return safe || fallback;
}

function assertSingleFile(files: unknown[]): File {
  if (files.length === 0) throw new AccessError("File mancante.", 409);
  if (files.length > 1) throw new AccessError("Carica un solo file alla volta.", 409);
  const file = files[0];
  if (!(file instanceof File)) throw new AccessError("File mancante.", 409);
  if (file.size <= 0) throw new AccessError("File vuoto.", 409);
  if (file.size > DOCUMENT_VERSION_MAX_SIZE_BYTES) throw new AccessError("File troppo grande.", 409);
  if (!DOCUMENT_VERSION_ALLOWED_MIME_TYPES.includes(file.type as (typeof DOCUMENT_VERSION_ALLOWED_MIME_TYPES)[number])) {
    throw new AccessError("Formato file non supportato.", 409);
  }
  return file;
}

async function findActiveDocument(organizationId: string, documentId: string) {
  const document = await db.document.findFirst({
    where: { id: documentId, organizationId, archivedAt: null },
    select: {
      id: true,
      organizationId: true,
      status: true,
      ownerType: true,
      workerId: true,
      jobSiteId: true,
      currentVersionId: true,
      documentType: { select: { sensitivity: true } },
    },
  });
  if (!document) throw new AccessError("Documento non trovato.", 404);
  return document;
}

async function findActiveDocumentVersion(organizationId: string, documentId: string, versionId: string) {
  const version = await db.documentVersion.findFirst({
    where: { id: versionId, documentId, organizationId, archivedAt: null },
    select: documentVersionSelect,
  });
  if (!version) throw new AccessError("Versione documento non trovata.", 404);
  return version;
}

export async function listDocumentVersions(documentId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documents:file:read", DOCUMENT_VERSION_READ_ROLES);
  const scope = await getResourceScope(context);
  const document = await findActiveDocument(organizationId, documentId);
  if (
    !canReadDocument(scope, document) ||
    (document.documentType && document.documentType.sensitivity !== "STANDARD" && !context.permissions.includes("documents:sensitive:read"))
  ) throw new AccessError("Documento non trovato.", 404);
  const versions = await db.documentVersion.findMany({
    where: { documentId, organizationId, archivedAt: null },
    select: documentVersionListSelect,
    orderBy: { createdAt: "desc" },
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "document-versions", resourceId: documentId });
  return versions.map(toDocumentVersionResponse);
}

export async function listDocumentVersionsByDocumentIds(documentIds: string[]) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documents:file:read", DOCUMENT_VERSION_READ_ROLES);
  const scope = await getResourceScope(context);
  const uniqueDocumentIds = [...new Set(documentIds.filter(Boolean))];
  if (uniqueDocumentIds.length === 0) return [];

  const documentScope = scope.fullAccess
    ? {}
    : scope.preset === "SITE_MANAGER"
      ? { ownerType: "JOB_SITE" as const, jobSiteId: { in: scope.siteManagerJobSiteIds } }
      : scope.linkedWorker
        ? { ownerType: "WORKER" as const, workerId: scope.linkedWorker.id }
        : null;
  if (!documentScope) return [];

  const versions = await db.documentVersion.findMany({
    where: {
      organizationId,
      documentId: { in: uniqueDocumentIds },
      archivedAt: null,
      document: {
        is: {
          organizationId,
          archivedAt: null,
          ...documentScope,
          ...(context.permissions.includes("documents:sensitive:read")
            ? {}
            : { OR: [{ documentTypeId: null }, { documentType: { is: { sensitivity: "STANDARD" as const } } }] }),
        },
      },
    },
    select: documentVersionListSelect,
    orderBy: [{ documentId: "asc" }, { createdAt: "desc" }],
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "document-versions" });
  return versions.map(toDocumentVersionResponse);
}

export async function uploadDocumentVersion(documentId: string, files: unknown[]) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:upload", DOCUMENT_VERSION_UPLOAD_ROLES);
  const scope = await getResourceScope(context);
  const document = await findActiveDocument(organizationId, documentId);
  if (scope.preset === "LIMITED_UPLOAD") {
    if (document.ownerType !== "WORKER" || document.workerId !== scope.linkedWorker?.id) throw new AccessError("Documento non trovato.", 404);
  } else if (!scope.fullAccess) {
    throw new AccessError("Risorsa non disponibile.", 404);
  }
  const file = assertSingleFile(files);
  const versionId = crypto.randomUUID();
  const originalFileName = file.name.trim() || "documento";
  const safeFileName = sanitizeFileName(originalFileName);
  const blobKey = `organizations/${organizationId}/documents/${document.id}/versions/${versionId}/${safeFileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedMimeType = await validateBinaryFileContent(buffer, file.type, DOCUMENT_VERSION_ALLOWED_MIME_TYPES);
  const checksum = crypto.createHash("sha256").update(buffer).digest("hex");
  const duplicate = await db.documentVersion.findFirst({
    where: { organizationId, documentId: document.id, checksum, archivedAt: null },
    select: { id: true },
  });
  if (duplicate) throw new AccessError("Questo file e gia presente nel documento.", 409);

  const uploadedBlob = await putPrivateBlob({
    pathname: blobKey,
    body: buffer,
    contentType: detectedMimeType,
    maximumSizeInBytes: DOCUMENT_VERSION_MAX_SIZE_BYTES,
  });
  const storedBlobKey = uploadedBlob.pathname;

  try {
    const version = await db.$transaction(async (tx) => {
      const created = await tx.documentVersion.create({
        data: {
          id: versionId,
          organizationId,
          documentId: document.id,
          blobKey: storedBlobKey,
          originalFileName,
          mimeType: detectedMimeType,
          size: file.size,
          checksum,
          uploadedById: context.userId,
        },
        select: documentVersionSelect,
      });
      await tx.document.update({ where: { id: document.id }, data: { status: "TO_REVIEW" }, select: { id: true } });
      await enqueueOperationalProcess({
        organizationId,
        type: "DOCUMENT_RECEIVED",
        triggerKind: "DOCUMENT_VERSION_UPLOADED",
        idempotencyKey: `document-version:${created.id}:received`,
        context: { source: "workspace", change: "version-uploaded" },
        artifacts: [
          { type: "DOCUMENT", id: document.id },
          { type: "DOCUMENT_VERSION", id: created.id, label: created.originalFileName },
        ],
        actorUserId: context.userId,
        actorRole,
      }, tx);
      return created;
    });
    await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "document-version", resourceId: version.id });
    await recordProductAuditEventBestEffort({
      organizationId,
      ...auditActorFromContext(context, actorRole),
      action: "DOCUMENT_VERSION_UPLOADED",
      entityType: "DOCUMENT_VERSION",
      entityId: version.id,
      metadata: { mimeType: version.mimeType, size: version.size, hasFile: true },
    });
    return toDocumentVersionResponse(version);
  } catch (error) {
    await deletePrivateBlob(storedBlobKey).catch(() => undefined);
    throw error;
  }
}

export async function archiveDocumentVersion(documentId: string, versionId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:archive", DOCUMENT_VERSION_ARCHIVE_ROLES);
  const document = await findActiveDocument(organizationId, documentId);
  const existing = await findActiveDocumentVersion(organizationId, documentId, versionId);
  if (document.currentVersionId === existing.id) throw new AccessError("La versione corrente non puo essere archiviata.", 409);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "document-version", resourceId: existing.id });
  const version = await db.documentVersion.update({
    where: { id: existing.id },
    data: { archivedAt: new Date() },
    select: documentVersionSelect,
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DOCUMENT_VERSION_ARCHIVED",
    entityType: "DOCUMENT_VERSION",
    entityId: version.id,
    metadata: { mimeType: version.mimeType, size: version.size, hasFile: true },
  });
  return toDocumentVersionResponse(version);
}

export async function reviewDocumentVersion(
  documentId: string,
  versionId: string,
  input: { decision?: unknown; reason?: unknown },
) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:verify", DOCUMENT_VERSION_READ_ROLES);
  const scope = await getResourceScope(context);
  const document = await findActiveDocument(organizationId, documentId);
  if (
    !canReadDocument(scope, document) ||
    (document.documentType && document.documentType.sensitivity !== "STANDARD" && !context.permissions.includes("documents:sensitive:read"))
  ) throw new AccessError("Documento non trovato.", 404);
  const version = await findActiveDocumentVersion(organizationId, documentId, versionId);
  if (input.decision !== "APPROVE" && input.decision !== "REJECT") throw new AccessError("Decisione revisione non valida.", 409);
  const reason = typeof input.reason === "string" && input.reason.trim() ? input.reason.trim().slice(0, 2000) : null;
  if (input.decision === "REJECT" && !reason) throw new AccessError("Indica il motivo del rifiuto.", 409);
  const reviewedAt = new Date();

  const reviewed = await db.$transaction(async (tx) => {
    if (input.decision === "APPROVE") {
      await tx.documentVersion.updateMany({
        where: { organizationId, documentId, reviewStatus: "CURRENT", id: { not: version.id } },
        data: { reviewStatus: "SUPERSEDED" },
      });
      const current = await tx.documentVersion.update({
        where: { id: version.id },
        data: { reviewStatus: "CURRENT", reviewedById: context.userId, reviewedAt, reviewReason: reason },
        select: documentVersionSelect,
      });
      await tx.document.update({
        where: { id: document.id },
        data: { currentVersionId: current.id, status: "PRESENT", reviewedById: context.userId, reviewedAt },
        select: { id: true },
      });
      await appendContextTimelineEvent({ organizationId, eventKey: `document-version:${current.id}:reviewed:current`, targetType: "DOCUMENT", targetId: document.id, eventType: "DOCUMENT_VERSION_REVIEWED", title: "Versione documento approvata", summary: current.originalFileName, metadata: { versionId: current.id, reviewStatus: current.reviewStatus }, actorUserId: context.userId, actorRole, sourceType: "USER_ACTION", sourceId: current.id }, tx);
      return current;
    }

    const rejected = await tx.documentVersion.update({
      where: { id: version.id },
      data: { reviewStatus: "REJECTED", reviewedById: context.userId, reviewedAt, reviewReason: reason },
      select: documentVersionSelect,
    });
    await tx.document.update({
      where: { id: document.id },
      data: { status: document.currentVersionId ? "PRESENT" : "TO_REVIEW" },
      select: { id: true },
    });
    await appendContextTimelineEvent({ organizationId, eventKey: `document-version:${rejected.id}:reviewed:rejected`, targetType: "DOCUMENT", targetId: document.id, eventType: "DOCUMENT_VERSION_REVIEWED", title: "Versione documento rifiutata", summary: reason, metadata: { versionId: rejected.id, reviewStatus: rejected.reviewStatus }, actorUserId: context.userId, actorRole, sourceType: "USER_ACTION", sourceId: rejected.id }, tx);
    return rejected;
  });

  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DOCUMENT_VERSION_REVIEWED",
    entityType: "DOCUMENT_VERSION",
    entityId: reviewed.id,
    metadata: { decision: input.decision, reviewStatus: reviewed.reviewStatus },
  });
  return toDocumentVersionResponse(reviewed);
}

export async function getDocumentVersionDownload(documentId: string, versionId: string): Promise<DownloadDocumentVersionResult> {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:file:read", DOCUMENT_VERSION_READ_ROLES);
  const scope = await getResourceScope(context);
  const document = await findActiveDocument(organizationId, documentId);
  if (
    !canReadDocument(scope, document) ||
    (document.documentType && document.documentType.sensitivity !== "STANDARD" && !context.permissions.includes("documents:sensitive:read"))
  ) throw new AccessError("Documento non trovato.", 404);
  const version = await findActiveDocumentVersion(organizationId, documentId, versionId);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "document-version-file", resourceId: version.id });
  const blob = await getPrivateBlob(version.blobKey);
  if (!blob) throw new AccessError("Versione documento non trovata.", 404);
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DOCUMENT_VERSION_DOWNLOADED",
    entityType: "DOCUMENT_VERSION",
    entityId: version.id,
    metadata: { mimeType: version.mimeType, size: version.size, hasFile: true },
  });
  return {
    stream: blob.stream,
    originalFileName: version.originalFileName,
    mimeType: version.mimeType,
    size: version.size,
  };
}
