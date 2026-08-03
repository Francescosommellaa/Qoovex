import "server-only";

import { db } from "@qoovex/db";
import { documentOwnerTypes, type DocumentOwnerType } from "@qoovex/types";
import { AccessError } from "./access-errors";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { trimOptionalText, trimRequiredText } from "./document-domain-validation";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { canReadDocument, getResourceScope } from "./resource-scope-service";

const READ_ROLES = ["OWNER", "COLLABORATOR"] as const;
const MANAGE_ROLES = ["OWNER", "COLLABORATOR"] as const;
const documentSelect = {
  id: true, organizationId: true, currentVersionId: true, ownerType: true, workerId: true, jobSiteId: true,
  title: true, notes: true, createdAt: true, updatedAt: true, archivedAt: true,
  worker: { select: { id: true, displayName: true } }, jobSite: { select: { id: true, name: true } },
  currentVersion: { select: { id: true, originalFileName: true, mimeType: true, size: true, checksum: true, createdAt: true, archivedAt: true } },
} as const;

function ownerType(value: unknown): DocumentOwnerType {
  if (typeof value !== "string" || !documentOwnerTypes.includes(value as DocumentOwnerType)) throw new AccessError("Proprietario file non valido.", 409);
  return value as DocumentOwnerType;
}

async function assertOwner(organizationId: string, type: DocumentOwnerType, workerId: string | null, jobSiteId: string | null) {
  if (type === "WORKER") {
    if (!workerId || jobSiteId) throw new AccessError("Seleziona un lavoratore valido.", 409);
    if (!await db.worker.findFirst({ where: { id: workerId, organizationId, archivedAt: null }, select: { id: true } })) throw new AccessError("Lavoratore non trovato.", 404);
  } else if (type === "JOB_SITE") {
    if (!jobSiteId || workerId) throw new AccessError("Seleziona un cantiere valido.", 409);
    if (!await db.jobSite.findFirst({ where: { id: jobSiteId, organizationId, archivedAt: null }, select: { id: true } })) throw new AccessError("Cantiere non trovato.", 404);
  } else if (workerId || jobSiteId) throw new AccessError("Il file Azienda non puo indicare altre risorse proprietarie.", 409);
}

export async function listDocuments(filters: { ownerType?: unknown; workerId?: unknown; jobSiteId?: unknown; archived?: boolean } = {}) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documents:read", READ_ROLES);
  const scope = await getResourceScope(context);
  const type = filters.ownerType === undefined ? undefined : ownerType(filters.ownerType);
  const workerId = typeof filters.workerId === "string" && filters.workerId.trim() ? filters.workerId.trim() : undefined;
  const jobSiteId = typeof filters.jobSiteId === "string" && filters.jobSiteId.trim() ? filters.jobSiteId.trim() : undefined;
  return db.document.findMany({ where: { organizationId, archivedAt: filters.archived ? { not: null } : null, ...(type ? { ownerType: type } : {}), ...(workerId ? { workerId } : {}), ...(jobSiteId ? { OR: [{ jobSiteId }, { jobSiteLinks: { some: { jobSiteId, unlinkedAt: null } } }] } : {}), ...(scope.fullAccess ? {} : { OR: [{ id: { in: scope.visibleDocumentIds } }, { workerId: { in: scope.visibleWorkerIds } }, { jobSiteId: { in: scope.visibleJobSiteIds } }, { jobSiteLinks: { some: { jobSiteId: { in: scope.visibleJobSiteIds }, unlinkedAt: null } } }] }) }, select: documentSelect, orderBy: [{ updatedAt: "desc" }, { title: "asc" }] });
}

export async function getDocument(documentId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documents:read", READ_ROLES);
  const scope = await getResourceScope(context);
  const value = await db.document.findFirst({ where: { id: documentId, organizationId }, select: { ...documentSelect, versions: { where: { archivedAt: null }, select: { id: true, originalFileName: true, mimeType: true, size: true, checksum: true, createdAt: true, archivedAt: true }, orderBy: { createdAt: "desc" } } } });
  if (!value || !canReadDocument(scope, value)) throw new AccessError("File non trovato.", 404);
  return value;
}

export async function createDocument(input: Record<string, unknown>) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:upload", MANAGE_ROLES);
  const type = ownerType(input.ownerType ?? "ORGANIZATION");
  const workerId = typeof input.workerId === "string" && input.workerId.trim() ? input.workerId.trim() : null;
  const jobSiteId = typeof input.jobSiteId === "string" && input.jobSiteId.trim() ? input.jobSiteId.trim() : null;
  await assertOwner(organizationId, type, workerId, jobSiteId);
  const value = await db.document.create({ data: { organizationId, ownerType: type, workerId, jobSiteId, title: trimRequiredText(input.title, "Titolo file", 2, 200), notes: trimOptionalText(input.notes, "Note", 4000) ?? null }, select: documentSelect });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "DOCUMENT_CREATED", entityType: "DOCUMENT", entityId: value.id, outcome: "SUCCESS" });
  return value;
}

export async function updateDocument(documentId: string, input: Record<string, unknown>) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:update", MANAGE_ROLES);
  const current = await getDocument(documentId);
  const type = input.ownerType === undefined ? current.ownerType : ownerType(input.ownerType);
  const workerId = input.workerId === undefined ? current.workerId : typeof input.workerId === "string" && input.workerId.trim() ? input.workerId.trim() : null;
  const jobSiteId = input.jobSiteId === undefined ? current.jobSiteId : typeof input.jobSiteId === "string" && input.jobSiteId.trim() ? input.jobSiteId.trim() : null;
  await assertOwner(organizationId, type, workerId, jobSiteId);
  const value = await db.document.update({ where: { id: documentId }, data: { ownerType: type, workerId, jobSiteId, ...(input.title !== undefined ? { title: trimRequiredText(input.title, "Titolo file", 2, 200) } : {}), ...(input.notes !== undefined ? { notes: trimOptionalText(input.notes, "Note", 4000) ?? null } : {}) }, select: documentSelect });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "DOCUMENT_UPDATED", entityType: "DOCUMENT", entityId: value.id, outcome: "SUCCESS" });
  return value;
}

export async function archiveDocument(documentId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:archive", MANAGE_ROLES);
  await getDocument(documentId);
  const value = await db.document.update({ where: { id: documentId }, data: { archivedAt: new Date() }, select: documentSelect });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "DOCUMENT_ARCHIVED", entityType: "DOCUMENT", entityId: value.id, outcome: "SUCCESS" });
  return { document: value, archived: true };
}
