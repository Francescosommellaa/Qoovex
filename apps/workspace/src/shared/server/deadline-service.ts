import "server-only";

import { db } from "@qoovex/db";
import type { DeadlineSourceType, DeadlineStatus } from "@qoovex/types";
import { deadlineSourceTypes, deadlineStatuses } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { isEnumValue, parseOptionalDate, parseRequiredDate, trimOptionalId, trimRequiredText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { getResourceScope } from "./resource-scope-service";

const DEADLINE_MANAGE_ROLES = ["OWNER", "ADMIN"] as const;
const DEADLINE_READ_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"] as const;
const EXPIRING_SOON_DAYS = 30;

const deadlineSelect = {
  id: true,
  organizationId: true,
  title: true,
  dueDate: true,
  sourceType: true,
  documentId: true,
  workerId: true,
  jobSiteId: true,
  status: true,
  remindAt: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
} as const;

export interface ListDeadlinesInput {
  documentId?: unknown;
  workerId?: unknown;
  jobSiteId?: unknown;
  status?: unknown;
}

export interface CreateDeadlineInput {
  title?: unknown;
  dueDate?: unknown;
  sourceType?: unknown;
  documentId?: unknown;
  workerId?: unknown;
  jobSiteId?: unknown;
  status?: unknown;
  remindAt?: unknown;
}

export interface UpdateDeadlineInput {
  title?: unknown;
  dueDate?: unknown;
  sourceType?: unknown;
  documentId?: unknown;
  workerId?: unknown;
  jobSiteId?: unknown;
  status?: unknown;
  remindAt?: unknown;
}

function parseSourceType(value: unknown): DeadlineSourceType {
  if (!isEnumValue(deadlineSourceTypes, value)) throw new AccessError("Origine scadenza non valida.", 409);
  return value;
}

function parseDeadlineStatus(value: unknown): DeadlineStatus {
  if (!isEnumValue(deadlineStatuses, value)) throw new AccessError("Stato scadenza non valido.", 409);
  return value;
}

function getOperationalDeadlineStatus(dueDate: Date): DeadlineStatus {
  const now = new Date();
  if (dueDate < now) return "EXPIRED";
  const threshold = new Date(now.getTime() + EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000);
  return dueDate <= threshold ? "EXPIRING_SOON" : "SCHEDULED";
}

function assertReminderBeforeDueDate(remindAt: Date | null | undefined, dueDate: Date | null | undefined) {
  if (remindAt && dueDate && remindAt > dueDate) throw new AccessError("Il promemoria non puo essere successivo alla scadenza.", 409);
}

async function assertDocument(organizationId: string, documentId: string | null | undefined) {
  if (!documentId) return null;
  const document = await db.document.findFirst({ where: { id: documentId, organizationId, archivedAt: null }, select: { id: true } });
  if (!document) throw new AccessError("Documento non trovato.", 404);
  return document.id;
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

async function normalizeDeadlineRelations(input: {
  organizationId: string;
  sourceType: DeadlineSourceType;
  documentId: string | null | undefined;
  workerId: string | null | undefined;
  jobSiteId: string | null | undefined;
}) {
  if (input.sourceType === "DOCUMENT" && !input.documentId) throw new AccessError("La scadenza documento richiede un documento.", 409);
  if (input.sourceType !== "DOCUMENT" && input.documentId) throw new AccessError("Solo una scadenza documento puo indicare un documento.", 409);
  return {
    documentId: await assertDocument(input.organizationId, input.documentId),
    workerId: await assertWorker(input.organizationId, input.workerId),
    jobSiteId: await assertJobSite(input.organizationId, input.jobSiteId),
  };
}

export async function listDeadlines(input: ListDeadlinesInput = {}) {
  const { context, organizationId } = await requireOrganizationDomainAccess("deadlines:read", DEADLINE_READ_ROLES);
  const scope = await getResourceScope(context);
  const where: {
    organizationId: string;
    archivedAt: null;
    documentId?: string;
    workerId?: string;
    jobSiteId?: string;
    status?: DeadlineStatus;
    OR?: Array<
      | { jobSiteId: { in: string[] } }
      | { workerId: string }
      | { document: { ownerType: "WORKER"; workerId: string } }
    >;
  } = { organizationId, archivedAt: null };
  if (!scope.fullAccess) {
    if (scope.actorRole === "SITE_MANAGER") where.OR = [{ jobSiteId: { in: scope.siteManagerJobSiteIds } }];
    if (scope.actorRole === "WORKER" && scope.linkedWorker) {
      where.OR = [{ workerId: scope.linkedWorker.id }, { document: { ownerType: "WORKER", workerId: scope.linkedWorker.id } }];
    }
    if (!where.OR) return [];
  }
  const documentId = trimOptionalId(input.documentId, "Documento");
  const workerId = trimOptionalId(input.workerId, "Lavoratore");
  const jobSiteId = trimOptionalId(input.jobSiteId, "Cantiere");
  if (documentId) where.documentId = documentId;
  if (workerId) where.workerId = workerId;
  if (jobSiteId) where.jobSiteId = jobSiteId;
  if (input.status !== undefined) where.status = parseDeadlineStatus(input.status);

  const deadlines = await db.deadline.findMany({ where, select: deadlineSelect, orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }] });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "deadlines" });
  return deadlines;
}

export async function createDeadline(input: CreateDeadlineInput) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("deadlines:manage", DEADLINE_MANAGE_ROLES);
  const title = trimRequiredText(input.title, "Titolo scadenza", 2, 160);
  const dueDate = parseRequiredDate(input.dueDate, "Data scadenza");
  const sourceType = parseSourceType(input.sourceType);
  const documentIdInput = trimOptionalId(input.documentId, "Documento");
  const workerIdInput = trimOptionalId(input.workerId, "Lavoratore");
  const jobSiteIdInput = trimOptionalId(input.jobSiteId, "Cantiere");
  const relations = await normalizeDeadlineRelations({ organizationId, sourceType, documentId: documentIdInput, workerId: workerIdInput, jobSiteId: jobSiteIdInput });
  const remindAt = parseOptionalDate(input.remindAt, "Promemoria") ?? null;
  assertReminderBeforeDueDate(remindAt, dueDate);
  const status = input.status === undefined ? getOperationalDeadlineStatus(dueDate) : parseDeadlineStatus(input.status);
  if (status === "ARCHIVED") throw new AccessError("Usa l'archiviazione per archiviare una scadenza.", 409);

  const deadline = await db.deadline.create({
    data: { organizationId, title, dueDate, sourceType, ...relations, status, remindAt },
    select: deadlineSelect,
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "deadline", resourceId: deadline.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DEADLINE_CREATED",
    entityType: "DEADLINE",
    entityId: deadline.id,
    metadata: { nextStatus: deadline.status },
  });
  return deadline;
}

export async function updateDeadline(deadlineId: string, input: UpdateDeadlineInput) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("deadlines:manage", DEADLINE_MANAGE_ROLES);
  const existing = await db.deadline.findFirst({
    where: { id: deadlineId, organizationId, archivedAt: null },
    select: { id: true, dueDate: true, sourceType: true, documentId: true, workerId: true, jobSiteId: true, remindAt: true },
  });
  if (!existing) throw new AccessError("Scadenza non trovata.", 404);

  const sourceType = input.sourceType === undefined ? existing.sourceType : parseSourceType(input.sourceType);
  const documentIdInput = input.documentId === undefined ? existing.documentId : trimOptionalId(input.documentId, "Documento");
  const workerIdInput = input.workerId === undefined ? existing.workerId : trimOptionalId(input.workerId, "Lavoratore");
  const jobSiteIdInput = input.jobSiteId === undefined ? existing.jobSiteId : trimOptionalId(input.jobSiteId, "Cantiere");
  const dueDate = input.dueDate === undefined ? existing.dueDate : parseRequiredDate(input.dueDate, "Data scadenza");
  const remindAt = input.remindAt === undefined ? existing.remindAt : parseOptionalDate(input.remindAt, "Promemoria");
  assertReminderBeforeDueDate(remindAt, dueDate);

  const data: {
    title?: string;
    dueDate?: Date;
    sourceType?: DeadlineSourceType;
    documentId?: string | null;
    workerId?: string | null;
    jobSiteId?: string | null;
    status?: DeadlineStatus;
    remindAt?: Date | null;
  } = {};
  if (input.title !== undefined) data.title = trimRequiredText(input.title, "Titolo scadenza", 2, 160);
  if (input.dueDate !== undefined) data.dueDate = dueDate;
  if (input.sourceType !== undefined || input.documentId !== undefined || input.workerId !== undefined || input.jobSiteId !== undefined) {
    const relations = await normalizeDeadlineRelations({ organizationId, sourceType, documentId: documentIdInput, workerId: workerIdInput, jobSiteId: jobSiteIdInput });
    data.sourceType = sourceType;
    data.documentId = relations.documentId;
    data.workerId = relations.workerId;
    data.jobSiteId = relations.jobSiteId;
  }
  if (input.status !== undefined) {
    const status = parseDeadlineStatus(input.status);
    if (status === "ARCHIVED") throw new AccessError("Usa l'archiviazione per archiviare una scadenza.", 409);
    data.status = status;
  } else if (input.dueDate !== undefined) {
    data.status = getOperationalDeadlineStatus(dueDate);
  }
  if (input.remindAt !== undefined) data.remindAt = remindAt ?? null;
  if (!Object.keys(data).length) throw new AccessError("Nessun dato scadenza da aggiornare.", 409);

  const deadline = await db.deadline.update({ where: { id: existing.id }, data, select: deadlineSelect });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "deadline", resourceId: deadline.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DEADLINE_UPDATED",
    entityType: "DEADLINE",
    entityId: deadline.id,
    metadata: { nextStatus: deadline.status },
  });
  return deadline;
}

export async function archiveDeadline(deadlineId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("deadlines:manage", DEADLINE_MANAGE_ROLES);
  const existing = await db.deadline.findFirst({ where: { id: deadlineId, organizationId, archivedAt: null }, select: { id: true } });
  if (!existing) throw new AccessError("Scadenza non trovata.", 404);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "deadline", resourceId: existing.id });
  const deadline = await db.deadline.update({
    where: { id: existing.id },
    data: { archivedAt: new Date(), status: "ARCHIVED" },
    select: deadlineSelect,
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DEADLINE_ARCHIVED",
    entityType: "DEADLINE",
    entityId: deadline.id,
    metadata: { nextStatus: deadline.status },
  });
  return deadline;
}
