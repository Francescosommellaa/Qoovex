import "server-only";

import crypto from "node:crypto";
import { db } from "@qoovex/db";
import { AccessError } from "./access-errors";
import { deletePrivateBlob, getPrivateBlob, putPrivateBlob } from "./blob-storage-service";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { canReadDocument, getResourceScope } from "./resource-scope-service";
import { validateBinaryFileContent } from "./file-content-validation";

const ROLES = ["OWNER", "COLLABORATOR"] as const;
export const DOCUMENT_VERSION_MAX_SIZE_BYTES = 4 * 1024 * 1024;
export const DOCUMENT_VERSION_ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;
const select = { id: true, organizationId: true, documentId: true, blobKey: true, originalFileName: true, mimeType: true, size: true, checksum: true, uploadedById: true, createdAt: true, archivedAt: true } as const;
export const documentVersionListSelect = { id: true, organizationId: true, documentId: true, originalFileName: true, mimeType: true, size: true, checksum: true, uploadedById: true, createdAt: true, archivedAt: true } as const;

async function activeDocument(organizationId: string, documentId: string) {
  const value = await db.document.findFirst({ where: { id: documentId, organizationId, archivedAt: null }, select: { id: true, ownerType: true, workerId: true, jobSiteId: true, currentVersionId: true, jobSiteLinks: { where: { unlinkedAt: null }, select: { jobSiteId: true } } } });
  if (!value) throw new AccessError("File non trovato.", 404);
  return value;
}

async function activeVersion(organizationId: string, documentId: string, versionId: string) {
  const value = await db.documentVersion.findFirst({ where: { id: versionId, documentId, organizationId, archivedAt: null }, select });
  if (!value) throw new AccessError("Versione file non trovata.", 404);
  return value;
}

async function authorizeRead(organizationId: string, documentId: string, context: Awaited<ReturnType<typeof requireOrganizationDomainAccess>>["context"]) {
  const document = await activeDocument(organizationId, documentId);
  if (!canReadDocument(await getResourceScope(context), document)) throw new AccessError("File non trovato.", 404);
  return document;
}

export async function listDocumentVersions(documentId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documents:file:read", ROLES);
  await authorizeRead(organizationId, documentId, context);
  return db.documentVersion.findMany({ where: { organizationId, documentId, archivedAt: null }, select: documentVersionListSelect, orderBy: { createdAt: "desc" } });
}

export async function listDocumentVersionsByDocumentIds(documentIds: string[]) {
  const values = [];
  for (const id of [...new Set(documentIds)]) values.push(...await listDocumentVersions(id));
  return values;
}

function fileFrom(values: unknown[]) {
  if (values.length !== 1 || !(values[0] instanceof File)) throw new AccessError("Carica un solo file.", 409);
  const file = values[0];
  if (!file.size || file.size > DOCUMENT_VERSION_MAX_SIZE_BYTES) throw new AccessError("Dimensione file non valida.", 409);
  if (!DOCUMENT_VERSION_ALLOWED_MIME_TYPES.includes(file.type as never)) throw new AccessError("Formato file non supportato.", 409);
  return file;
}

export async function uploadDocumentVersion(documentId: string, files: unknown[]) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:upload", ROLES);
  const document = await authorizeRead(organizationId, documentId, context);
  const file = fileFrom(files);
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = await validateBinaryFileContent(buffer, file.type, DOCUMENT_VERSION_ALLOWED_MIME_TYPES);
  const checksum = crypto.createHash("sha256").update(buffer).digest("hex");
  if (await db.documentVersion.findFirst({ where: { organizationId, documentId, checksum, archivedAt: null }, select: { id: true } })) throw new AccessError("File gia presente.", 409);
  const id = crypto.randomUUID();
  const safeName = (file.name || "file").normalize("NFKD").replace(/[^\w.\-]+/g, "-").slice(0, 120) || "file";
  const uploaded = await putPrivateBlob({ pathname: `organizations/${organizationId}/documents/${documentId}/versions/${id}/${safeName}`, body: buffer, contentType: mimeType, maximumSizeInBytes: DOCUMENT_VERSION_MAX_SIZE_BYTES });
  try {
    const version = await db.$transaction(async (tx) => {
      const created = await tx.documentVersion.create({ data: { id, organizationId, documentId, blobKey: uploaded.pathname, originalFileName: file.name || "file", mimeType, size: file.size, checksum, uploadedById: context.userId }, select });
      await tx.document.update({ where: { id: document.id }, data: { currentVersionId: created.id } });
      return created;
    });
    await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "DOCUMENT_VERSION_UPLOADED", entityType: "DOCUMENT_VERSION", entityId: version.id, outcome: "SUCCESS", metadata: { mimeType, size: file.size } });
    return version;
  } catch (error) { await deletePrivateBlob(uploaded.pathname).catch(() => undefined); throw error; }
}

export async function archiveDocumentVersion(documentId: string, versionId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:archive", ROLES);
  const document = await authorizeRead(organizationId, documentId, context);
  const current = await activeVersion(organizationId, documentId, versionId);
  if (document.currentVersionId === current.id) throw new AccessError("La versione corrente non puo essere archiviata.", 409);
  const value = await db.documentVersion.update({ where: { id: versionId }, data: { archivedAt: new Date() }, select });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "DOCUMENT_VERSION_ARCHIVED", entityType: "DOCUMENT_VERSION", entityId: value.id, outcome: "SUCCESS" });
  return value;
}

export async function getDocumentVersionDownload(documentId: string, versionId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:file:read", ROLES);
  await authorizeRead(organizationId, documentId, context);
  const version = await activeVersion(organizationId, documentId, versionId);
  const blob = await getPrivateBlob(version.blobKey);
  if (!blob) throw new AccessError("Versione file non trovata.", 404);
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "DOCUMENT_VERSION_DOWNLOADED", entityType: "DOCUMENT_VERSION", entityId: version.id, outcome: "SUCCESS", metadata: { mimeType: version.mimeType, size: version.size } });
  return { stream: blob.stream, originalFileName: version.originalFileName, mimeType: version.mimeType, size: version.size };
}
