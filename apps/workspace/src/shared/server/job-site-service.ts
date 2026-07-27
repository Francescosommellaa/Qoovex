import "server-only";

import { db } from "@qoovex/db";
import type { JobSiteOperationalPhase, RecordStatus } from "@qoovex/types";
import { enqueueOperationalProcess } from "@shared/server/operational-process-service";
import { AccessError } from "@shared/server/access-errors";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { trimOptionalText, trimRequiredText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort, recordProductAuditEventsBestEffort } from "./product-audit-service";
import { canReadJobSite, getResourceScope } from "./resource-scope-service";
import { parseEditableRecordStatus, parseJobSiteOperationalPhase, parseOptionalDateRange, rejectSensitiveFields } from "./worker-jobsite-validation";

const JOBSITE_MANAGE_ROLES = ["OWNER", "ADMIN"] as const;
const JOBSITE_READ_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"] as const;

const jobSiteSelect = {
  id: true,
  organizationId: true,
  name: true,
  address: true,
  clientName: true,
  status: true,
  operationalPhase: true,
  startDate: true,
  endDate: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
} as const;

export interface CreateJobSiteInput extends Record<string, unknown> {
  name?: unknown;
  address?: unknown;
  clientName?: unknown;
  status?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  notes?: unknown;
  operationalPhase?: unknown;
  managerUserIds?: unknown;
  workerIds?: unknown;
  continueAfterDuplicateWarning?: unknown;
}

export interface UpdateJobSiteInput extends Record<string, unknown> {
  name?: unknown;
  address?: unknown;
  clientName?: unknown;
  status?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  notes?: unknown;
  operationalPhase?: unknown;
}

function parseIdList(value: unknown, label: string) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    throw new AccessError(`${label} non validi.`, 409);
  }
  return [...new Set(value.map((item) => (item as string).trim()))];
}

export async function findJobSiteDuplicates(input: { name?: unknown; clientName?: unknown; address?: unknown }) {
  const { organizationId } = await requireOrganizationDomainAccess("jobSites:read", JOBSITE_READ_ROLES);
  const name = trimRequiredText(input.name, "Nome cantiere", 2, 160);
  const clientName = trimOptionalText(input.clientName, "Nome committente", 160);
  const address = trimOptionalText(input.address, "Indirizzo cantiere", 500);
  return db.jobSite.findMany({
    where: {
      organizationId,
      archivedAt: null,
      OR: [
        { name: { equals: name, mode: "insensitive" } },
        ...(clientName ? [{ clientName: { equals: clientName, mode: "insensitive" as const } }] : []),
        ...(address ? [{ address: { equals: address, mode: "insensitive" as const } }] : []),
      ],
    },
    select: { id: true, name: true, clientName: true, address: true, operationalPhase: true },
    orderBy: [{ updatedAt: "desc" }],
    take: 5,
  });
}

export async function listJobSites() {
  const { context, organizationId } = await requireOrganizationDomainAccess("jobSites:read", JOBSITE_READ_ROLES);
  const scope = await getResourceScope(context);
  const jobSites = await db.jobSite.findMany({
    where: { organizationId, archivedAt: null, ...(scope.fullAccess ? {} : { id: { in: scope.visibleJobSiteIds } }) },
    select: jobSiteSelect,
    orderBy: [{ name: "asc" }, { createdAt: "asc" }],
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "job-sites" });
  return jobSites;
}

export async function getJobSite(jobSiteId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("jobSites:read", JOBSITE_READ_ROLES);
  const scope = await getResourceScope(context);
  const jobSite = await db.jobSite.findFirst({ where: { id: jobSiteId, organizationId, archivedAt: null }, select: jobSiteSelect });
  if (!jobSite || !canReadJobSite(scope, jobSite.id)) throw new AccessError("Cantiere non trovato.", 404);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "job-site", resourceId: jobSite.id });
  return jobSite;
}

export async function createJobSite(input: CreateJobSiteInput) {
  rejectSensitiveFields(input);
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("jobSites:create", JOBSITE_MANAGE_ROLES);
  const name = trimRequiredText(input.name, "Nome cantiere", 2, 160);
  const address = trimOptionalText(input.address, "Indirizzo cantiere", 500) ?? null;
  const clientName = trimOptionalText(input.clientName, "Nome committente", 160) ?? null;
  const status = input.status === undefined ? "ACTIVE" : parseEditableRecordStatus(input.status);
  const operationalPhase = parseJobSiteOperationalPhase(input.operationalPhase);
  const dates = parseOptionalDateRange({ startDate: input.startDate, endDate: input.endDate });
  const notes = trimOptionalText(input.notes, "Note cantiere", 4000) ?? null;
  const managerUserIds = parseIdList(input.managerUserIds, "Responsabili");
  const workerIds = parseIdList(input.workerIds, "Lavoratori");

  const duplicates = await db.jobSite.findMany({
    where: {
      organizationId,
      archivedAt: null,
      OR: [
        { name: { equals: name, mode: "insensitive" } },
        ...(clientName ? [{ clientName: { equals: clientName, mode: "insensitive" as const } }] : []),
        ...(address ? [{ address: { equals: address, mode: "insensitive" as const } }] : []),
      ],
    },
    select: { id: true },
    take: 1,
  });
  if (duplicates.length && input.continueAfterDuplicateWarning !== true) {
    throw new AccessError("Esiste gia un cantiere simile. Verifica il duplicato oppure conferma di voler continuare.", 409);
  }

  const [managerMemberships, workers] = await Promise.all([
    managerUserIds.length
      ? db.organizationMembership.findMany({ where: { organizationId, revokedAt: null, role: "SITE_MANAGER", userId: { in: managerUserIds } }, select: { userId: true } })
      : Promise.resolve([]),
    workerIds.length
      ? db.worker.findMany({ where: { organizationId, archivedAt: null, id: { in: workerIds } }, select: { id: true } })
      : Promise.resolve([]),
  ]);
  if (managerMemberships.length !== managerUserIds.length) throw new AccessError("Uno o piu responsabili non sono disponibili per questa azienda.", 409);
  if (workers.length !== workerIds.length) throw new AccessError("Uno o piu lavoratori non sono disponibili per questa azienda.", 409);

  const created = await db.$transaction(async (tx) => {
    const jobSite = await tx.jobSite.create({
      data: {
        organizationId,
        name,
        address,
        clientName,
        status,
        operationalPhase,
        startDate: dates.resolvedStartDate,
        endDate: dates.resolvedEndDate,
        notes,
        userAssignments: managerUserIds.length ? { create: managerUserIds.map((userId) => ({ organizationId, userId, assignmentRole: "SITE_MANAGER", assignedById: context.userId })) } : undefined,
        workerAssignments: workerIds.length ? { create: workerIds.map((workerId) => ({ organizationId, workerId, assignedById: context.userId })) } : undefined,
      },
      select: { ...jobSiteSelect, userAssignments: { select: { id: true } }, workerAssignments: { select: { id: true } } },
    });
    await enqueueOperationalProcess({
      organizationId,
      type: "JOB_SITE_CREATED",
      triggerKind: "JOB_SITE_CREATED",
      idempotencyKey: `job-site:${jobSite.id}:created`,
      context: { source: "workspace", change: "created" },
      artifacts: [{ type: "JOB_SITE", id: jobSite.id, label: jobSite.name }],
      actorUserId: context.userId,
      actorRole,
    }, tx);
    return jobSite;
  });
  const { userAssignments = [], workerAssignments = [], ...jobSite } = created;
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "job-site", resourceId: jobSite.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "JOB_SITE_CREATED",
    entityType: "JOB_SITE",
    entityId: jobSite.id,
    metadata: { nextStatus: jobSite.status, nextPhase: jobSite.operationalPhase },
  });
  const actor = auditActorFromContext(context, actorRole);
  await recordProductAuditEventsBestEffort([
    ...userAssignments.map((assignment) => ({ organizationId, ...actor, action: "JOB_SITE_USER_ASSIGNMENT_CREATED" as const, entityType: "JOB_SITE_USER_ASSIGNMENT" as const, entityId: assignment.id, metadata: { entityType: "JobSiteUserAssignment", reasonCode: "created_with_job_site" } })),
    ...workerAssignments.map((assignment) => ({ organizationId, ...actor, action: "JOB_SITE_WORKER_ASSIGNMENT_CREATED" as const, entityType: "JOB_SITE_WORKER_ASSIGNMENT" as const, entityId: assignment.id, metadata: { entityType: "JobSiteWorkerAssignment", reasonCode: "created_with_job_site" } })),
  ]);
  return jobSite;
}

export async function updateJobSite(jobSiteId: string, input: UpdateJobSiteInput) {
  rejectSensitiveFields(input);
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("jobSites:update", JOBSITE_MANAGE_ROLES);
  const existing = await db.jobSite.findFirst({
    where: { id: jobSiteId, organizationId, archivedAt: null },
    select: { id: true, startDate: true, endDate: true, operationalPhase: true },
  });
  if (!existing) throw new AccessError("Cantiere non trovato.", 404);

  const dates = parseOptionalDateRange({
    startDate: input.startDate,
    endDate: input.endDate,
    currentStartDate: existing.startDate,
    currentEndDate: existing.endDate,
  });
  const data: {
    name?: string;
    address?: string | null;
    clientName?: string | null;
    status?: RecordStatus;
    startDate?: Date | null;
    endDate?: Date | null;
    notes?: string | null;
    operationalPhase?: JobSiteOperationalPhase;
  } = {};
  if (input.name !== undefined) data.name = trimRequiredText(input.name, "Nome cantiere", 2, 160);
  if (input.address !== undefined) data.address = trimOptionalText(input.address, "Indirizzo cantiere", 500) ?? null;
  if (input.clientName !== undefined) data.clientName = trimOptionalText(input.clientName, "Nome committente", 160) ?? null;
  if (input.status !== undefined) data.status = parseEditableRecordStatus(input.status);
  if (input.startDate !== undefined) data.startDate = dates.startDate ?? null;
  if (input.endDate !== undefined) data.endDate = dates.endDate ?? null;
  if (input.notes !== undefined) data.notes = trimOptionalText(input.notes, "Note cantiere", 4000) ?? null;
  if (input.operationalPhase !== undefined && input.operationalPhase !== null) data.operationalPhase = parseJobSiteOperationalPhase(input.operationalPhase);
  if (!Object.keys(data).length) throw new AccessError("Nessun dato cantiere da aggiornare.", 409);

  const jobSite = await db.$transaction(async (tx) => {
    const updated = await tx.jobSite.update({ where: { id: existing.id }, data, select: jobSiteSelect });
    await enqueueOperationalProcess({
      organizationId,
      type: "JOB_SITE_CREATED",
      triggerKind: "JOB_SITE_UPDATED",
      idempotencyKey: `job-site:${updated.id}:updated:${updated.updatedAt.toISOString()}`,
      context: { source: "workspace", change: "updated" },
      artifacts: [{ type: "JOB_SITE", id: updated.id, label: updated.name }],
      actorUserId: context.userId,
      actorRole,
    }, tx);
    return updated;
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "job-site", resourceId: jobSite.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "JOB_SITE_UPDATED",
    entityType: "JOB_SITE",
    entityId: jobSite.id,
    metadata: { nextStatus: jobSite.status, previousPhase: existing.operationalPhase, nextPhase: jobSite.operationalPhase },
  });
  return jobSite;
}

export async function archiveJobSite(jobSiteId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("jobSites:archive", JOBSITE_MANAGE_ROLES);
  const existing = await db.jobSite.findFirst({ where: { id: jobSiteId, organizationId, archivedAt: null }, select: { id: true } });
  if (!existing) throw new AccessError("Cantiere non trovato.", 404);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "job-site", resourceId: existing.id });
  const jobSite = await db.jobSite.update({
    where: { id: existing.id },
    data: { archivedAt: new Date(), status: "ARCHIVED" },
    select: jobSiteSelect,
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "JOB_SITE_ARCHIVED",
    entityType: "JOB_SITE",
    entityId: jobSite.id,
    metadata: { nextStatus: jobSite.status },
  });
  return jobSite;
}
