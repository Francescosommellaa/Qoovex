import "server-only";

import { db, type Prisma } from "@qoovex/db";
import type { DocumentCategoryKey, DocumentOwnerType, DocumentStatus } from "@qoovex/types";
import { documentCategoryRegistry, documentOwnerTypes, documentStatuses } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { deletePrivateBlobs } from "@shared/server/blob-storage-service";
import { recordRuntimeErrorBestEffort } from "@shared/server/runtime-error-service";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { assertDocumentTaxonomy, isEnumValue, ownerTypeMatchesAppliesTo, parseDocumentCategoryKey, parseOptionalDate, rejectBinaryPayload, trimOptionalId, trimOptionalText, trimRequiredText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { canReadDocument, getResourceScope } from "./resource-scope-service";
import { documentVersionListSelect, toDocumentVersionResponse } from "./document-version-service";

const FULL_DOCUMENT_ROLES = ["OWNER", "ADMIN"] as const;
const DOCUMENT_READ_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"] as const;
const DOCUMENT_UPDATE_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] as const;

export const documentListSelect = {
  id: true,
  organizationId: true,
  documentTypeId: true,
  ownerType: true,
  workerId: true,
  jobSiteId: true,
  title: true,
  status: true,
  expiryDate: true,
  reviewedAt: true,
  reviewedById: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
  documentType: {
    select: {
      id: true,
      name: true,
      appliesTo: true,
      categoryKey: true,
      sensitivity: true,
      requiresExpiryDate: true,
      archivedAt: true,
    },
  },
  worker: { select: { id: true, displayName: true } },
  jobSite: { select: { id: true, name: true } },
} as const;

export interface ListDocumentsInput {
  ownerType?: unknown;
  workerId?: unknown;
  jobSiteId?: unknown;
  status?: unknown;
  statuses?: readonly DocumentStatus[];
  categoryKey?: unknown;
  take?: number;
  skip?: number;
}

export interface CreateDocumentInput extends Record<string, unknown> {
  title?: unknown;
  documentTypeId?: unknown;
  ownerType?: unknown;
  workerId?: unknown;
  jobSiteId?: unknown;
  status?: unknown;
  expiryDate?: unknown;
  notes?: unknown;
}

export interface UpdateDocumentInput extends Record<string, unknown> {
  title?: unknown;
  documentTypeId?: unknown;
  ownerType?: unknown;
  workerId?: unknown;
  jobSiteId?: unknown;
  status?: unknown;
  expiryDate?: unknown;
  notes?: unknown;
}

function parseOwnerType(value: unknown): DocumentOwnerType {
  if (!isEnumValue(documentOwnerTypes, value)) throw new AccessError("Titolare documento non valido.", 409);
  return value;
}

function parseDocumentStatus(value: unknown): DocumentStatus {
  if (!isEnumValue(documentStatuses, value)) throw new AccessError("Stato documento non valido.", 409);
  return value;
}

async function assertDocumentType(organizationId: string, documentTypeId: string | null | undefined) {
  if (!documentTypeId) throw new AccessError("Scegli un tipo documento configurato.", 409);
  const documentType = await db.documentType.findFirst({
    where: { id: documentTypeId, organizationId, archivedAt: null },
    select: { id: true, name: true, appliesTo: true, categoryKey: true, sensitivity: true, requiresExpiryDate: true, archivedAt: true },
  });
  if (!documentType) throw new AccessError("Tipo documento non trovato.", 404);
  assertDocumentTaxonomy(documentType);
  return documentType;
}

export function toDocumentListRecord<T extends {
  documentType: { name: string; categoryKey: DocumentCategoryKey; sensitivity: "STANDARD" | "RESTRICTED" | "HEALTH_JUDGMENT" } | null;
  worker: { id: string; displayName: string } | null;
  jobSite: { id: string; name: string } | null;
}>(document: T) {
  const { documentType, ...record } = document;
  const categoryKey = documentType?.categoryKey ?? "UNCLASSIFIED";
  return {
    ...record,
    documentTypeName: documentType?.name ?? null,
    categoryKey,
    categoryLabel: documentCategoryRegistry[categoryKey].label,
    sensitivity: documentType?.sensitivity ?? "STANDARD",
    worker: document.worker,
    jobSite: document.jobSite,
  };
}

async function assertWorker(organizationId: string, workerId: string | null | undefined) {
  if (!workerId) return null;
  const worker = await db.worker.findFirst({ where: { id: workerId, organizationId, archivedAt: null }, select: { id: true } });
  if (!worker) throw new AccessError("Lavoratore non trovato.", 404);
  return worker.id;
}

async function assertJobSite(organizationId: string, jobSiteId: string | null | undefined) {
  if (!jobSiteId) return null;
  const jobSite = await db.jobSite.findFirst({ where: { id: jobSiteId, organizationId, archivedAt: null }, select: { id: true } });
  if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
  return jobSite.id;
}

async function normalizeDocumentOwner(input: {
  organizationId: string;
  ownerType: DocumentOwnerType;
  workerId: string | null | undefined;
  jobSiteId: string | null | undefined;
}) {
  if (input.ownerType === "ORGANIZATION") {
    if (input.workerId || input.jobSiteId) throw new AccessError("Un documento azienda non deve indicare lavoratore o cantiere.", 409);
    return { workerId: null, jobSiteId: null };
  }
  if (input.ownerType === "WORKER") {
    if (!input.workerId) throw new AccessError("Il documento lavoratore richiede un lavoratore.", 409);
    if (input.jobSiteId) throw new AccessError("Il documento lavoratore non deve indicare un cantiere.", 409);
    return { workerId: await assertWorker(input.organizationId, input.workerId), jobSiteId: null };
  }
  if (!input.jobSiteId) throw new AccessError("Il documento cantiere richiede un cantiere.", 409);
  if (input.workerId) throw new AccessError("Il documento cantiere non deve indicare un lavoratore.", 409);
  return { workerId: null, jobSiteId: await assertJobSite(input.organizationId, input.jobSiteId) };
}

export async function listDocuments(input: ListDocumentsInput = {}) {
  if (input.status !== undefined && input.statuses !== undefined) throw new AccessError("Filtri stato documenti incompatibili.", 409);
  const requestedStatus = input.status === undefined ? undefined : parseDocumentStatus(input.status);
  const requestedStatuses = input.statuses?.map((status) => parseDocumentStatus(status));
  if (requestedStatuses?.includes("ARCHIVED")) throw new AccessError("Vista documenti archiviati non valida.", 409);
  const archiveMode = requestedStatus === "ARCHIVED";
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess(
    archiveMode ? "documents:archive" : "documents:read",
    archiveMode ? FULL_DOCUMENT_ROLES : DOCUMENT_READ_ROLES,
  );
  const scope = await getResourceScope(context);
  const where: Prisma.DocumentWhereInput = { organizationId, archivedAt: archiveMode ? { not: null } : null };
  if (!scope.fullAccess) {
    if (scope.actorRole === "SITE_MANAGER") where.OR = [{ ownerType: "JOB_SITE", jobSiteId: { in: scope.siteManagerJobSiteIds } }];
    if (scope.actorRole === "WORKER" && scope.linkedWorker) where.OR = [{ ownerType: "WORKER", workerId: scope.linkedWorker.id }];
    if (!where.OR) return [];
  }
  if (input.ownerType !== undefined) where.ownerType = parseOwnerType(input.ownerType);
  const workerId = trimOptionalId(input.workerId, "Lavoratore");
  const jobSiteId = trimOptionalId(input.jobSiteId, "Cantiere");
  if (workerId) where.workerId = workerId;
  if (jobSiteId) where.jobSiteId = jobSiteId;
  if (requestedStatus !== undefined) where.status = requestedStatus;
  if (requestedStatuses !== undefined) where.status = { in: requestedStatuses };
  if (input.categoryKey !== undefined) {
    const categoryKey = parseDocumentCategoryKey(input.categoryKey);
    where.documentType = { is: { categoryKey } };
  }
  if (actorRole !== "OWNER" && actorRole !== "ADMIN") {
    where.AND = [{ OR: [{ documentTypeId: null }, { documentType: { is: { sensitivity: "STANDARD" } } }] }];
  }

  if (input.take !== undefined && (!Number.isSafeInteger(input.take) || input.take < 1 || input.take > 101)) {
    throw new AccessError("Dimensione pagina documenti non valida.", 409);
  }
  if (input.skip !== undefined && (!Number.isSafeInteger(input.skip) || input.skip < 0 || input.skip > 499_950)) {
    throw new AccessError("Pagina documenti non valida.", 409);
  }
  const documents = await db.document.findMany({
    where,
    select: documentListSelect,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    ...(input.take === undefined ? {} : { take: input.take }),
    ...(input.skip === undefined ? {} : { skip: input.skip }),
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "documents" });
  return documents.map(toDocumentListRecord);
}

export async function getDocument(documentId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:read", DOCUMENT_READ_ROLES);
  const scope = await getResourceScope(context);
  const document = await db.document.findFirst({ where: { id: documentId, organizationId, archivedAt: null }, select: documentListSelect });
  if (!document || !canReadDocument(scope, document) || (document.documentType && document.documentType.sensitivity !== "STANDARD" && actorRole !== "OWNER" && actorRole !== "ADMIN")) throw new AccessError("Documento non trovato.", 404);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "document", resourceId: document.id });
  return toDocumentListRecord(document);
}

export async function getDocumentWithVersions(documentId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:read", DOCUMENT_READ_ROLES);
  const scope = await getResourceScope(context);
  const document = await db.document.findFirst({
    where: { id: documentId, organizationId, archivedAt: null },
    select: {
      ...documentListSelect,
      versions: {
        where: { archivedAt: null },
        select: documentVersionListSelect,
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!document || !canReadDocument(scope, document) || (document.documentType && document.documentType.sensitivity !== "STANDARD" && actorRole !== "OWNER" && actorRole !== "ADMIN")) throw new AccessError("Documento non trovato.", 404);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "document", resourceId: document.id });
  const { versions, ...documentRecord } = document;
  return { document: toDocumentListRecord(documentRecord), versions: versions.map(toDocumentVersionResponse) };
}

export async function createDocument(input: CreateDocumentInput) {
  rejectBinaryPayload(input);
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:update", FULL_DOCUMENT_ROLES);
  const title = trimRequiredText(input.title, "Titolo documento", 2, 160);
  const ownerType = parseOwnerType(input.ownerType);
  const documentType = await assertDocumentType(organizationId, trimOptionalId(input.documentTypeId, "Tipo documento"));
  if (!ownerTypeMatchesAppliesTo(ownerType, documentType.appliesTo)) throw new AccessError("Il tipo documento non e compatibile con la destinazione scelta.", 409);
  const workerIdInput = trimOptionalId(input.workerId, "Lavoratore");
  const jobSiteIdInput = trimOptionalId(input.jobSiteId, "Cantiere");
  const owner = await normalizeDocumentOwner({ organizationId, ownerType, workerId: workerIdInput, jobSiteId: jobSiteIdInput });
  const status = input.status === undefined ? "TO_REVIEW" : parseDocumentStatus(input.status);
  if (status === "ARCHIVED") throw new AccessError("Usa l'archiviazione per archiviare un documento.", 409);
  const expiryDate = parseOptionalDate(input.expiryDate, "Data scadenza") ?? null;
  if (documentType.requiresExpiryDate && !expiryDate) throw new AccessError("Questo tipo documento richiede una scadenza registrata.", 409);
  const notes = trimOptionalText(input.notes, "Note documento", 4000) ?? null;

  const document = await db.document.create({
    data: { organizationId, documentTypeId: documentType.id, ownerType, ...owner, title, status, expiryDate, notes },
    select: documentListSelect,
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "document", resourceId: document.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DOCUMENT_CREATED",
    entityType: "DOCUMENT",
    entityId: document.id,
    metadata: { nextStatus: document.status },
  });
  return toDocumentListRecord(document);
}

export async function updateDocument(documentId: string, input: UpdateDocumentInput) {
  rejectBinaryPayload(input);
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:update", DOCUMENT_UPDATE_ROLES);
  const existing = await db.document.findFirst({
    where: { id: documentId, organizationId, archivedAt: null },
    select: {
      id: true,
      ownerType: true,
      workerId: true,
      jobSiteId: true,
      expiryDate: true,
      documentType: { select: { id: true, name: true, appliesTo: true, categoryKey: true, sensitivity: true, requiresExpiryDate: true, archivedAt: true } },
    },
  });
  if (!existing) throw new AccessError("Documento non trovato.", 404);

  const data: {
    title?: string;
    documentTypeId?: string | null;
    ownerType?: DocumentOwnerType;
    workerId?: string | null;
    jobSiteId?: string | null;
    status?: DocumentStatus;
    expiryDate?: Date | null;
    notes?: string | null;
  } = {};
  if (input.title !== undefined) data.title = trimRequiredText(input.title, "Titolo documento", 2, 160);
  const documentType = input.documentTypeId === undefined
    ? existing.documentType
    : await assertDocumentType(organizationId, trimOptionalId(input.documentTypeId, "Tipo documento"));
  if (input.documentTypeId !== undefined && documentType) data.documentTypeId = documentType.id;
  const ownerType = input.ownerType === undefined ? existing.ownerType : parseOwnerType(input.ownerType);
  const workerIdInput = input.workerId === undefined ? existing.workerId : trimOptionalId(input.workerId, "Lavoratore");
  const jobSiteIdInput = input.jobSiteId === undefined ? existing.jobSiteId : trimOptionalId(input.jobSiteId, "Cantiere");
  if (input.ownerType !== undefined || input.workerId !== undefined || input.jobSiteId !== undefined) {
    const owner = await normalizeDocumentOwner({ organizationId, ownerType, workerId: workerIdInput, jobSiteId: jobSiteIdInput });
    data.ownerType = ownerType;
    data.workerId = owner.workerId;
    data.jobSiteId = owner.jobSiteId;
  }
  if (documentType && !ownerTypeMatchesAppliesTo(ownerType, documentType.appliesTo)) throw new AccessError("Il tipo documento non e compatibile con la destinazione scelta.", 409);
  if (input.status !== undefined) {
    const status = parseDocumentStatus(input.status);
    if (status === "ARCHIVED") throw new AccessError("Usa l'archiviazione per archiviare un documento.", 409);
    data.status = status;
  }
  if (input.expiryDate !== undefined) data.expiryDate = parseOptionalDate(input.expiryDate, "Data scadenza") ?? null;
  const effectiveExpiryDate = input.expiryDate === undefined ? existing.expiryDate : data.expiryDate;
  if (documentType?.requiresExpiryDate && !effectiveExpiryDate) throw new AccessError("Questo tipo documento richiede una scadenza registrata.", 409);
  if (input.notes !== undefined) data.notes = trimOptionalText(input.notes, "Note documento", 4000) ?? null;
  if (!Object.keys(data).length) throw new AccessError("Nessun dato documento da aggiornare.", 409);

  const document = await db.document.update({ where: { id: existing.id }, data, select: documentListSelect });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "document", resourceId: document.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DOCUMENT_UPDATED",
    entityType: "DOCUMENT",
    entityId: document.id,
    metadata: { nextStatus: document.status },
  });
  return toDocumentListRecord(document);
}

export async function archiveDocument(documentId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:archive", FULL_DOCUMENT_ROLES);
  const existing = await db.document.findFirst({ where: { id: documentId, organizationId, archivedAt: null }, select: { id: true } });
  if (!existing) throw new AccessError("Documento non trovato.", 404);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "document", resourceId: existing.id });
  const document = await db.document.update({
    where: { id: existing.id },
    data: { archivedAt: new Date(), status: "ARCHIVED" },
    select: documentListSelect,
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DOCUMENT_ARCHIVED",
    entityType: "DOCUMENT",
    entityId: document.id,
    metadata: { nextStatus: document.status },
  });
  return toDocumentListRecord(document);
}

export async function restoreDocument(documentId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:archive", FULL_DOCUMENT_ROLES);
  const existing = await db.document.findFirst({
    where: { id: documentId, organizationId, archivedAt: { not: null }, status: "ARCHIVED" },
    select: { id: true },
  });
  if (!existing) throw new AccessError("Documento archiviato non trovato.", 404);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "document", resourceId: existing.id });
  const document = await db.document.update({
    where: { id: existing.id },
    data: { archivedAt: null, status: "TO_REVIEW" },
    select: documentListSelect,
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DOCUMENT_UPDATED",
    entityType: "DOCUMENT",
    entityId: document.id,
    metadata: { previousStatus: "ARCHIVED", nextStatus: document.status, restored: true },
  });
  return toDocumentListRecord(document);
}

export async function permanentlyDeleteArchivedDocument(documentId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:archive", FULL_DOCUMENT_ROLES);
  const existing = await db.document.findFirst({
    where: { id: documentId, organizationId, archivedAt: { not: null }, status: "ARCHIVED" },
    select: {
      id: true,
      versions: { select: { id: true, blobKey: true } },
    },
  });
  if (!existing) throw new AccessError("Documento archiviato non trovato.", 404);

  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "document", resourceId: existing.id });
  const deletion = await db.document.deleteMany({
    where: { id: existing.id, organizationId, archivedAt: { not: null }, status: "ARCHIVED" },
  });
  if (!deletion.count) throw new AccessError("Documento archiviato non trovato.", 404);

  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DOCUMENT_ARCHIVED",
    entityType: "DOCUMENT",
    entityId: existing.id,
    metadata: {
      permanentlyDeleted: true,
      deletedVersions: existing.versions.length,
      preservedRelatedRecords: true,
    },
  });

  let storageCleanupPending = false;
  try {
    await deletePrivateBlobs(existing.versions.map((version) => version.blobKey));
  } catch (error) {
    storageCleanupPending = true;
    await recordRuntimeErrorBestEffort({
      error,
      source: "document-permanent-delete",
      routePath: "/api/documents/[documentId]/archive",
      requestMethod: "DELETE",
    });
  }

  return { deleted: true as const, storageCleanupPending };
}
