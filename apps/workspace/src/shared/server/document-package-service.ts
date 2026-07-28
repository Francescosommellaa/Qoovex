import "server-only";

import { db, Prisma } from "@qoovex/db";
import type { DocumentPackageEffectiveState, DocumentPackageItemType, DocumentPackageStatus } from "@qoovex/types";
import { documentPackageItemTypes, documentPackageStatuses } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { requirePermission } from "@shared/server/access-context-service";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { isEnumValue, trimOptionalId, trimOptionalText, trimRequiredText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";

const PACKAGE_ACCESS_ROLES = ["OWNER", "COLLABORATOR"] as const;
const PACKAGE_WRITE_ROLES = ["OWNER", "COLLABORATOR"] as const;

const documentPackageSelect = {
  id: true,
  organizationId: true,
  jobSiteId: true,
  title: true,
  description: true,
  status: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
} as const;

const packageItemSelect = {
  id: true,
  organizationId: true,
  documentPackageId: true,
  itemType: true,
  documentId: true,
  documentVersionId: true,
  evidenceId: true,
  checklistId: true,
  workerId: true,
  jobSiteUserAssignmentId: true,
  jobSiteWorkerAssignmentId: true,
  operationalRequestId: true,
  contextMessageId: true,
  contextTimelineEventId: true,
  note: true,
  position: true,
  createdAt: true,
} as const;

const packageShareLinkSelect = {
  id: true,
  organizationId: true,
  documentPackageId: true,
  revisionId: true,
  proposalId: true,
  purpose: true,
  recipientLabel: true,
  allowDownload: true,
  expiresAt: true,
  expiredAt: true,
  revokedAt: true,
  createdById: true,
  createdAt: true,
  lastAccessedAt: true,
} as const;

const packageControlSelect = {
  shareProposals: { select: { status: true }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 1 },
  shareLinks: { select: { revokedAt: true, expiredAt: true, expiresAt: true, revision: { select: { preparedAt: true } } }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 20 },
} satisfies Prisma.DocumentPackageSelect;

function withEffectiveState<T extends {
  status: DocumentPackageStatus;
  archivedAt: Date | null;
  updatedAt: Date;
  shareProposals: Array<{ status: "PREPARING" | "READY_FOR_REVIEW" | "BLOCKED" | "APPROVED" | "PUBLISHED" }>;
  shareLinks: Array<{ revokedAt: Date | null; expiredAt: Date | null; expiresAt: Date | null; revision: { preparedAt: Date } }>;
}>(documentPackage: T) {
  const { shareProposals, shareLinks, ...result } = documentPackage;
  const now = Date.now();
  let effectiveState: DocumentPackageEffectiveState = documentPackage.status;
  if (documentPackage.archivedAt) effectiveState = "ARCHIVED";
  else {
    const active = shareLinks.find((link) => !link.revokedAt && !link.expiredAt && (!link.expiresAt || link.expiresAt.getTime() > now));
    if (active && documentPackage.updatedAt.getTime() > active.revision.preparedAt.getTime()) effectiveState = "UPDATED_AFTER_SHARING";
    else if (active) effectiveState = "SHARED";
    else if (shareLinks.length && shareLinks.every((link) => Boolean(link.revokedAt))) effectiveState = "REVOKED";
    else if (shareLinks.length && shareLinks.every((link) => Boolean(link.expiredAt) || Boolean(link.expiresAt && link.expiresAt.getTime() <= now))) effectiveState = "EXPIRED";
    else if (shareProposals[0]?.status === "PREPARING") effectiveState = "PREPARING";
    else if (shareProposals[0]?.status === "BLOCKED") effectiveState = "INCOMPLETE";
    else if (shareProposals[0]?.status === "READY_FOR_REVIEW") effectiveState = "READY_FOR_REVIEW";
    else if (shareProposals[0]?.status === "APPROVED") effectiveState = "APPROVED";
  }
  return { ...result, effectiveState };
}

export interface ListDocumentPackagesInput {
  jobSiteId?: unknown;
  status?: unknown;
  statuses?: readonly DocumentPackageStatus[];
  take?: number;
  skip?: number;
}

export interface ListDocumentPackagesWithDetailsInput extends ListDocumentPackagesInput {
  includeShareLinks?: boolean;
}

export interface CreateDocumentPackageInput extends Record<string, unknown> {
  title?: unknown;
  description?: unknown;
  jobSiteId?: unknown;
  status?: unknown;
}

export interface UpdateDocumentPackageInput extends Record<string, unknown> {
  title?: unknown;
  description?: unknown;
  jobSiteId?: unknown;
  status?: unknown;
}

export interface AddDocumentPackageItemInput extends Record<string, unknown> {
  itemType?: unknown;
  documentId?: unknown;
  documentVersionId?: unknown;
  evidenceId?: unknown;
  checklistId?: unknown;
  workerId?: unknown;
  jobSiteUserAssignmentId?: unknown;
  jobSiteWorkerAssignmentId?: unknown;
  operationalRequestId?: unknown;
  contextMessageId?: unknown;
  contextTimelineEventId?: unknown;
  note?: unknown;
  position?: unknown;
}

export interface UpdateDocumentPackageItemInput extends Record<string, unknown> {
  position?: unknown;
}

function parsePackageStatus(value: unknown): DocumentPackageStatus {
  if (!isEnumValue(documentPackageStatuses, value)) throw new AccessError("Stato pacchetto non valido.", 409);
  return value;
}

function parseEditablePackageStatus(value: unknown): DocumentPackageStatus {
  const status = parsePackageStatus(value);
  if (status === "ARCHIVED") throw new AccessError("Usa l'archiviazione per archiviare il pacchetto.", 409);
  return status;
}

function parsePackageItemType(value: unknown): DocumentPackageItemType {
  if (!isEnumValue(documentPackageItemTypes, value)) throw new AccessError("Tipo elemento pacchetto non valido.", 409);
  return value;
}

function parseOptionalPosition(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new AccessError("Posizione elemento non valida.", 409);
  }
  return value;
}

function parseRequiredPosition(value: unknown): number {
  const position = parseOptionalPosition(value);
  if (position === undefined) throw new AccessError("Posizione elemento non valida.", 409);
  return position;
}

async function assertActiveJobSite(organizationId: string, jobSiteId: string | null | undefined) {
  if (!jobSiteId) return null;
  const jobSite = await db.jobSite.findFirst({ where: { id: jobSiteId, organizationId, archivedAt: null }, select: { id: true } });
  if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
  return jobSite.id;
}

async function findActivePackage(organizationId: string, packageId: string) {
  const documentPackage = await db.documentPackage.findFirst({
    where: { id: packageId, organizationId, archivedAt: null },
    select: documentPackageSelect,
  });
  if (!documentPackage) throw new AccessError("Pacchetto documentale non trovato.", 404);
  return documentPackage;
}

async function findPackageItem(organizationId: string, packageId: string, itemId: string) {
  const item = await db.documentPackageItem.findFirst({
    where: { id: itemId, organizationId, documentPackageId: packageId },
    select: packageItemSelect,
  });
  if (!item) throw new AccessError("Elemento pacchetto non trovato.", 404);
  return item;
}

function assertOnlyExpectedReference(input: {
  itemType: DocumentPackageItemType;
  documentId: string | null | undefined;
  documentVersionId: string | null | undefined;
  evidenceId: string | null | undefined;
  checklistId: string | null | undefined;
  workerId: string | null | undefined;
  jobSiteUserAssignmentId: string | null | undefined;
  jobSiteWorkerAssignmentId: string | null | undefined;
  operationalRequestId: string | null | undefined;
  contextMessageId: string | null | undefined;
  contextTimelineEventId: string | null | undefined;
  note: string | null | undefined;
}) {
  const refs = [
    input.documentId ? "documentId" : null,
    input.documentVersionId ? "documentVersionId" : null,
    input.evidenceId ? "evidenceId" : null,
    input.checklistId ? "checklistId" : null,
    input.workerId ? "workerId" : null,
    input.jobSiteUserAssignmentId ? "jobSiteUserAssignmentId" : null,
    input.jobSiteWorkerAssignmentId ? "jobSiteWorkerAssignmentId" : null,
    input.operationalRequestId ? "operationalRequestId" : null,
    input.contextMessageId ? "contextMessageId" : null,
    input.contextTimelineEventId ? "contextTimelineEventId" : null,
    input.note ? "note" : null,
  ].filter(Boolean);
  if (refs.length !== 1) throw new AccessError("Elemento pacchetto non coerente con il tipo indicato.", 409);
  const expectedRefByType: Record<DocumentPackageItemType, string> = {
    DOCUMENT: "documentId",
    DOCUMENT_VERSION: "documentVersionId",
    EVIDENCE: "evidenceId",
    CHECKLIST: "checklistId",
    NOTE: "note",
    WORKER: "workerId",
    JOB_SITE_USER_ASSIGNMENT: "jobSiteUserAssignmentId",
    JOB_SITE_WORKER_ASSIGNMENT: "jobSiteWorkerAssignmentId",
    OPERATIONAL_REQUEST: "operationalRequestId",
    CONTEXT_MESSAGE: "contextMessageId",
    CONTEXT_TIMELINE_EVENT: "contextTimelineEventId",
  };
  if (refs[0] !== expectedRefByType[input.itemType]) {
    throw new AccessError("Elemento pacchetto non coerente con il tipo indicato.", 409);
  }
}

function packageItemData(itemType: DocumentPackageItemType, values: Partial<{
  documentId: string;
  documentVersionId: string;
  evidenceId: string;
  checklistId: string;
  workerId: string;
  jobSiteUserAssignmentId: string;
  jobSiteWorkerAssignmentId: string;
  operationalRequestId: string;
  contextMessageId: string;
  contextTimelineEventId: string;
  note: string | null;
}>) {
  return {
    itemType,
    documentId: values.documentId ?? null,
    documentVersionId: values.documentVersionId ?? null,
    evidenceId: values.evidenceId ?? null,
    checklistId: values.checklistId ?? null,
    workerId: values.workerId ?? null,
    jobSiteUserAssignmentId: values.jobSiteUserAssignmentId ?? null,
    jobSiteWorkerAssignmentId: values.jobSiteWorkerAssignmentId ?? null,
    operationalRequestId: values.operationalRequestId ?? null,
    contextMessageId: values.contextMessageId ?? null,
    contextTimelineEventId: values.contextTimelineEventId ?? null,
    note: values.note ?? null,
  };
}

async function normalizePackageItem(organizationId: string, input: AddDocumentPackageItemInput) {
  const itemType = parsePackageItemType(input.itemType);
  const documentIdInput = trimOptionalId(input.documentId, "Documento") ?? null;
  const documentVersionIdInput = trimOptionalId(input.documentVersionId, "Versione documento") ?? null;
  const evidenceIdInput = trimOptionalId(input.evidenceId, "Prova") ?? null;
  const checklistIdInput = trimOptionalId(input.checklistId, "Checklist") ?? null;
  const workerIdInput = trimOptionalId(input.workerId, "Lavoratore") ?? null;
  const jobSiteUserAssignmentIdInput = trimOptionalId(input.jobSiteUserAssignmentId, "Assegnazione collaboratore") ?? null;
  const jobSiteWorkerAssignmentIdInput = trimOptionalId(input.jobSiteWorkerAssignmentId, "Assegnazione lavoratore") ?? null;
  const operationalRequestIdInput = trimOptionalId(input.operationalRequestId, "Richiesta operativa") ?? null;
  const contextMessageIdInput = trimOptionalId(input.contextMessageId, "Messaggio contestuale") ?? null;
  const contextTimelineEventIdInput = trimOptionalId(input.contextTimelineEventId, "Evento operativo") ?? null;
  const noteInput = itemType === "NOTE" && input.note !== undefined ? trimRequiredText(input.note, "Nota pacchetto", 2, 4000) : trimOptionalText(input.note, "Nota pacchetto", 4000) ?? null;

  assertOnlyExpectedReference({
    itemType,
    documentId: documentIdInput,
    documentVersionId: documentVersionIdInput,
    evidenceId: evidenceIdInput,
    checklistId: checklistIdInput,
    workerId: workerIdInput,
    jobSiteUserAssignmentId: jobSiteUserAssignmentIdInput,
    jobSiteWorkerAssignmentId: jobSiteWorkerAssignmentIdInput,
    operationalRequestId: operationalRequestIdInput,
    contextMessageId: contextMessageIdInput,
    contextTimelineEventId: contextTimelineEventIdInput,
    note: noteInput,
  });

  if (itemType === "DOCUMENT") {
    const document = await db.document.findFirst({
      where: { id: documentIdInput ?? "", organizationId, archivedAt: null, documentType: { is: { sensitivity: "STANDARD", categoryKey: { not: "UNCLASSIFIED" } } } },
      select: { id: true },
    });
    if (!document) throw new AccessError("Il documento non e condivisibile: deve essere classificato e avere sensibilita Standard.", 409);
    return packageItemData(itemType, { documentId: document.id });
  }
  if (itemType === "DOCUMENT_VERSION") {
    const version = await db.documentVersion.findFirst({
      where: { id: documentVersionIdInput ?? "", organizationId, archivedAt: null, reviewStatus: "CURRENT", document: { is: { organizationId, archivedAt: null, documentType: { is: { sensitivity: "STANDARD", categoryKey: { not: "UNCLASSIFIED" } } } } } },
      select: { id: true },
    });
    if (!version) throw new AccessError("Il file non e condivisibile: il documento deve essere classificato e avere sensibilita Standard.", 409);
    return packageItemData(itemType, { documentVersionId: version.id });
  }
  if (itemType === "EVIDENCE") {
    const evidence = await db.evidence.findFirst({ where: { id: evidenceIdInput ?? "", organizationId, archivedAt: null, reviewStatus: "ACCEPTED", sensitivity: "SHAREABLE" }, select: { id: true } });
    if (!evidence) throw new AccessError("La prova non e condivisibile: deve essere approvata e classificata come condivisibile.", 409);
    return packageItemData(itemType, { evidenceId: evidence.id });
  }
  if (itemType === "CHECKLIST") {
    const checklist = await db.checklist.findFirst({ where: { id: checklistIdInput ?? "", organizationId, archivedAt: null }, select: { id: true } });
    if (!checklist) throw new AccessError("Checklist non trovata.", 404);
    return packageItemData(itemType, { checklistId: checklist.id });
  }
  if (itemType === "WORKER") {
    const worker = await db.worker.findFirst({ where: { id: workerIdInput ?? "", organizationId, archivedAt: null }, select: { id: true } });
    if (!worker) throw new AccessError("Lavoratore non trovato.", 404);
    return packageItemData(itemType, { workerId: worker.id });
  }
  if (itemType === "JOB_SITE_USER_ASSIGNMENT") {
    const assignment = await db.jobSiteUserAssignment.findFirst({ where: { id: jobSiteUserAssignmentIdInput ?? "", organizationId, archivedAt: null }, select: { id: true } });
    if (!assignment) throw new AccessError("Assegnazione collaboratore non trovata.", 404);
    return packageItemData(itemType, { jobSiteUserAssignmentId: assignment.id });
  }
  if (itemType === "JOB_SITE_WORKER_ASSIGNMENT") {
    const assignment = await db.jobSiteWorkerAssignment.findFirst({ where: { id: jobSiteWorkerAssignmentIdInput ?? "", organizationId, archivedAt: null }, select: { id: true } });
    if (!assignment) throw new AccessError("Assegnazione lavoratore non trovata.", 404);
    return packageItemData(itemType, { jobSiteWorkerAssignmentId: assignment.id });
  }
  if (itemType === "OPERATIONAL_REQUEST") {
    const request = await db.operationalRequest.findFirst({ where: { id: operationalRequestIdInput ?? "", organizationId }, select: { id: true } });
    if (!request) throw new AccessError("Richiesta operativa non trovata.", 404);
    return packageItemData(itemType, { operationalRequestId: request.id });
  }
  if (itemType === "CONTEXT_MESSAGE") {
    const message = await db.contextMessage.findFirst({ where: { id: contextMessageIdInput ?? "", organizationId, visibility: "INTERNAL" }, select: { id: true } });
    if (!message) throw new AccessError("Messaggio contestuale non trovato.", 404);
    return packageItemData(itemType, { contextMessageId: message.id });
  }
  if (itemType === "CONTEXT_TIMELINE_EVENT") {
    const event = await db.contextTimelineEvent.findFirst({ where: { id: contextTimelineEventIdInput ?? "", organizationId }, select: { id: true } });
    if (!event) throw new AccessError("Evento operativo non trovato.", 404);
    return packageItemData(itemType, { contextTimelineEventId: event.id });
  }
  return packageItemData(itemType, { note: noteInput });
}

async function nextPackageItemPosition(organizationId: string, packageId: string) {
  const lastItem = await db.documentPackageItem.findFirst({
    where: { organizationId, documentPackageId: packageId },
    select: { position: true },
    orderBy: { position: "desc" },
  });
  return (lastItem?.position ?? -1) + 1;
}

export async function listDocumentPackages(input: ListDocumentPackagesInput = {}) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documentPackages:read", PACKAGE_ACCESS_ROLES);
  const where: { organizationId: string; archivedAt: null; jobSiteId?: string; status?: DocumentPackageStatus } = { organizationId, archivedAt: null };
  const jobSiteId = trimOptionalId(input.jobSiteId, "Cantiere");
  if (jobSiteId) where.jobSiteId = jobSiteId;
  if (input.status !== undefined) where.status = parsePackageStatus(input.status);

  const packages = await db.documentPackage.findMany({ where, select: documentPackageSelect, orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }] });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "document-packages" });
  return packages;
}

export async function listDocumentPackagesWithDetails(input: ListDocumentPackagesWithDetailsInput = {}) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documentPackages:read", PACKAGE_ACCESS_ROLES);
  if (input.status !== undefined && input.statuses !== undefined) throw new AccessError("Filtri stato pacchetti incompatibili.", 409);
  const where: { organizationId: string; archivedAt: null; jobSiteId?: string; status?: DocumentPackageStatus | { in: DocumentPackageStatus[] } } = { organizationId, archivedAt: null };
  const jobSiteId = trimOptionalId(input.jobSiteId, "Cantiere");
  if (jobSiteId) where.jobSiteId = jobSiteId;
  if (input.status !== undefined) where.status = parsePackageStatus(input.status);
  if (input.statuses !== undefined) where.status = { in: input.statuses.map((status) => parsePackageStatus(status)) };
  if (input.take !== undefined && (!Number.isSafeInteger(input.take) || input.take < 1 || input.take > 101)) throw new AccessError("Dimensione pagina pacchetti non valida.", 409);
  if (input.skip !== undefined && (!Number.isSafeInteger(input.skip) || input.skip < 0 || input.skip > 499_950)) throw new AccessError("Pagina pacchetti non valida.", 409);

  if (input.includeShareLinks) {
    requirePermission(context, "documentPackages:share");
    const packages = await db.documentPackage.findMany({
      where,
      select: {
        ...documentPackageSelect,
        items: { select: packageItemSelect, orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
        shareLinks: { select: { ...packageShareLinkSelect, revision: { select: { preparedAt: true } } }, orderBy: { createdAt: "desc" } },
        shareProposals: packageControlSelect.shareProposals,
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      ...(input.take === undefined ? {} : { take: input.take }),
      ...(input.skip === undefined ? {} : { skip: input.skip }),
    });
    await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "document-packages" });
    return packages.map((documentPackage) => {
      const effective = withEffectiveState(documentPackage);
      return { ...effective, shareLinks: documentPackage.shareLinks.map(({ revision: _revision, ...link }) => link) };
    });
  }

  const packages = await db.documentPackage.findMany({
    where,
    select: {
      ...documentPackageSelect,
      items: { select: packageItemSelect, orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
      ...packageControlSelect,
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    ...(input.take === undefined ? {} : { take: input.take }),
    ...(input.skip === undefined ? {} : { skip: input.skip }),
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "document-packages" });
  return packages.map((documentPackage) => ({ ...withEffectiveState(documentPackage), shareLinks: [] }));
}

export async function getDocumentPackage(packageId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documentPackages:read", PACKAGE_ACCESS_ROLES);
  const documentPackage = await db.documentPackage.findFirst({
    where: { id: packageId, organizationId, archivedAt: null },
    select: {
      ...documentPackageSelect,
      items: { select: packageItemSelect, orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
      ...packageControlSelect,
    },
  });
  if (!documentPackage) throw new AccessError("Pacchetto documentale non trovato.", 404);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "document-package", resourceId: documentPackage.id });
  return withEffectiveState(documentPackage);
}

export async function createDocumentPackage(input: CreateDocumentPackageInput) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documentPackages:create", PACKAGE_WRITE_ROLES);
  const title = trimRequiredText(input.title, "Titolo pacchetto", 2, 160);
  const description = trimOptionalText(input.description, "Descrizione pacchetto", 4000) ?? null;
  const jobSiteId = await assertActiveJobSite(organizationId, trimOptionalId(input.jobSiteId, "Cantiere"));
  const status = input.status === undefined ? "DRAFT" : parseEditablePackageStatus(input.status);

  const documentPackage = await db.documentPackage.create({
    data: { organizationId, jobSiteId, title, description, status, createdById: context.userId },
    select: documentPackageSelect,
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "document-package", resourceId: documentPackage.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DOCUMENT_PACKAGE_CREATED",
    entityType: "DOCUMENT_PACKAGE",
    entityId: documentPackage.id,
    metadata: { nextStatus: documentPackage.status },
  });
  return documentPackage;
}

export async function updateDocumentPackage(packageId: string, input: UpdateDocumentPackageInput) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documentPackages:create", PACKAGE_WRITE_ROLES);
  const existing = await findActivePackage(organizationId, packageId);
  const data: { title?: string; description?: string | null; jobSiteId?: string | null; status?: DocumentPackageStatus } = {};
  if (input.title !== undefined) data.title = trimRequiredText(input.title, "Titolo pacchetto", 2, 160);
  if (input.description !== undefined) data.description = trimOptionalText(input.description, "Descrizione pacchetto", 4000) ?? null;
  if (input.jobSiteId !== undefined) data.jobSiteId = await assertActiveJobSite(organizationId, trimOptionalId(input.jobSiteId, "Cantiere"));
  if (input.status !== undefined) data.status = parseEditablePackageStatus(input.status);
  if (!Object.keys(data).length) throw new AccessError("Nessun dato pacchetto da aggiornare.", 409);
  if (existing.status === "SHARED" && input.status === undefined) data.status = "DRAFT";

  const documentPackage = await db.documentPackage.update({ where: { id: existing.id }, data, select: documentPackageSelect });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "document-package", resourceId: documentPackage.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DOCUMENT_PACKAGE_UPDATED",
    entityType: "DOCUMENT_PACKAGE",
    entityId: documentPackage.id,
    metadata: { nextStatus: documentPackage.status },
  });
  return documentPackage;
}

export async function archiveDocumentPackage(packageId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documentPackages:create", PACKAGE_WRITE_ROLES);
  const existing = await findActivePackage(organizationId, packageId);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "document-package", resourceId: existing.id });
  const documentPackage = await db.documentPackage.update({
    where: { id: existing.id },
    data: { archivedAt: new Date(), status: "ARCHIVED" },
    select: documentPackageSelect,
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DOCUMENT_PACKAGE_ARCHIVED",
    entityType: "DOCUMENT_PACKAGE",
    entityId: documentPackage.id,
    metadata: { nextStatus: documentPackage.status },
  });
  return documentPackage;
}

export async function listDocumentPackageItems(packageId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documentPackages:read", PACKAGE_ACCESS_ROLES);
  await findActivePackage(organizationId, packageId);
  const items = await db.documentPackageItem.findMany({
    where: { organizationId, documentPackageId: packageId },
    select: packageItemSelect,
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "document-package-items", resourceId: packageId });
  return items;
}

export async function addDocumentPackageItem(packageId: string, input: AddDocumentPackageItemInput) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documentPackages:create", PACKAGE_WRITE_ROLES);
  const documentPackage = await findActivePackage(organizationId, packageId);
  const data = await normalizePackageItem(organizationId, input);
  const duplicate = await db.documentPackageItem.findFirst({
    where: {
      organizationId,
      documentPackageId: documentPackage.id,
      itemType: data.itemType,
      documentId: data.documentId,
      documentVersionId: data.documentVersionId,
      evidenceId: data.evidenceId,
      checklistId: data.checklistId,
      workerId: data.workerId,
      jobSiteUserAssignmentId: data.jobSiteUserAssignmentId,
      jobSiteWorkerAssignmentId: data.jobSiteWorkerAssignmentId,
      operationalRequestId: data.operationalRequestId,
      contextMessageId: data.contextMessageId,
      contextTimelineEventId: data.contextTimelineEventId,
      note: data.note,
    },
    select: { id: true },
  });
  if (duplicate) throw new AccessError("Elemento gia presente nel pacchetto.", 409);
  const position = parseOptionalPosition(input.position) ?? await nextPackageItemPosition(organizationId, documentPackage.id);

  const item = await db.$transaction(async (tx) => {
    const created = await tx.documentPackageItem.create({
      data: { organizationId, documentPackageId: documentPackage.id, ...data, position },
      select: packageItemSelect,
    });
    await tx.documentPackage.updateMany({ where: { id: documentPackage.id, organizationId, status: { in: ["SHARED", "READY_FOR_REVIEW"] } }, data: { status: "DRAFT" } });
    return created;
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "document-package-item", resourceId: item.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DOCUMENT_PACKAGE_ITEM_ADDED",
    entityType: "DOCUMENT_PACKAGE_ITEM",
    entityId: item.id,
    metadata: { itemType: item.itemType },
  });
  return item;
}

export async function updateDocumentPackageItem(packageId: string, itemId: string, input: UpdateDocumentPackageItemInput) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documentPackages:create", PACKAGE_WRITE_ROLES);
  await findActivePackage(organizationId, packageId);
  const existing = await findPackageItem(organizationId, packageId, itemId);
  const position = parseRequiredPosition(input.position);
  const item = await db.$transaction(async (tx) => {
    const updated = await tx.documentPackageItem.update({ where: { id: existing.id }, data: { position }, select: packageItemSelect });
    await tx.documentPackage.updateMany({ where: { id: packageId, organizationId, status: { in: ["SHARED", "READY_FOR_REVIEW"] } }, data: { status: "DRAFT" } });
    return updated;
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "document-package-item", resourceId: item.id });
  return item;
}

export async function removeDocumentPackageItem(packageId: string, itemId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documentPackages:create", PACKAGE_WRITE_ROLES);
  await findActivePackage(organizationId, packageId);
  const existing = await findPackageItem(organizationId, packageId, itemId);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "document-package-item", resourceId: existing.id });
  const item = await db.$transaction(async (tx) => {
    const removed = await tx.documentPackageItem.delete({ where: { id: existing.id }, select: packageItemSelect });
    await tx.documentPackage.updateMany({ where: { id: packageId, organizationId, status: { in: ["SHARED", "READY_FOR_REVIEW"] } }, data: { status: "DRAFT" } });
    return removed;
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DOCUMENT_PACKAGE_ITEM_REMOVED",
    entityType: "DOCUMENT_PACKAGE_ITEM",
    entityId: item.id,
    metadata: { itemType: item.itemType },
  });
  return item;
}
