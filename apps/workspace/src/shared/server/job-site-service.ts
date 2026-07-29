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
import { appendContextTimelineEvent } from "./context-timeline-service";
import { parseEditableRecordStatus, parseJobSiteOperationalPhase, parseOptionalDateRange, rejectSensitiveFields } from "./worker-jobsite-validation";

const JOBSITE_MANAGE_ROLES = ["OWNER", "COLLABORATOR"] as const;
const JOBSITE_READ_ROLES = ["OWNER", "COLLABORATOR"] as const;

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

const JOB_SITE_PHASE_TRANSITIONS: Record<JobSiteOperationalPhase, readonly JobSiteOperationalPhase[]> = {
  DRAFT: ["PREPARATION"],
  PREPARATION: ["IN_PROGRESS"],
  IN_PROGRESS: ["PAUSED", "CLOSING"],
  PAUSED: ["IN_PROGRESS"],
  CLOSING: ["COMPLETED"],
  COMPLETED: ["PREPARATION"],
};

function parseTransitionReason(value: unknown) {
  return trimOptionalText(value, "Motivazione transizione", 1000) ?? null;
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
  const managerUserIds = parseIdList(input.managerUserIds, "Collaboratori");
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
      ? db.organizationMembership.findMany({ where: { organizationId, revokedAt: null, role: "COLLABORATOR", permissionKeys: { has: "jobSites:read" }, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }], userId: { in: managerUserIds } }, select: { userId: true } })
      : Promise.resolve([]),
    workerIds.length
      ? db.worker.findMany({ where: { organizationId, archivedAt: null, id: { in: workerIds } }, select: { id: true } })
      : Promise.resolve([]),
  ]);
  if (managerMemberships.length !== managerUserIds.length) throw new AccessError("Uno o piu Collaboratori non sono disponibili o non dispongono dei permessi richiesti.", 409);
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
  if (input.operationalPhase !== undefined && input.operationalPhase !== null) {
    const requestedPhase = parseJobSiteOperationalPhase(input.operationalPhase);
    if (requestedPhase !== existing.operationalPhase) {
      throw new AccessError("Usa la transizione di fase dedicata per cambiare la fase operativa.", 409);
    }
  }
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

export async function transitionJobSiteOperationalPhase(jobSiteId: string, input: Record<string, unknown>) {
  rejectSensitiveFields(input);
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("jobSites:update", JOBSITE_MANAGE_ROLES);
  const scope = await getResourceScope(context);
  const existing = await db.jobSite.findFirst({
    where: { id: jobSiteId, organizationId, archivedAt: null },
    select: { id: true, name: true, operationalPhase: true },
  });
  if (!existing || !canReadJobSite(scope, existing.id)) throw new AccessError("Cantiere non trovato.", 404);

  const nextPhase = parseJobSiteOperationalPhase(input.nextPhase);
  if (!JOB_SITE_PHASE_TRANSITIONS[existing.operationalPhase].includes(nextPhase)) {
    throw new AccessError(`Transizione da ${existing.operationalPhase} a ${nextPhase} non consentita.`, 409);
  }
  const reason = parseTransitionReason(input.reason);
  const reopening = existing.operationalPhase === "COMPLETED";
  if (reopening && (actorRole !== "OWNER" || !reason)) {
    throw new AccessError("La riapertura richiede Owner e una motivazione.", 403);
  }

  const shouldInspectBlockers = nextPhase === "IN_PROGRESS" || nextPhase === "COMPLETED";
  const transitionTime = new Date();
  const [openRequests, openChecklistItems, criticalDocuments, activeAssignments] = shouldInspectBlockers
    ? await Promise.all([
        db.operationalRequest.count({ where: { organizationId, targetType: "JOB_SITE", targetId: existing.id, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
        db.checklistItem.count({ where: { organizationId, status: { in: ["OPEN", "TO_REVIEW"] }, checklist: { jobSiteId: existing.id, archivedAt: null } } }),
        db.document.count({
          where: {
            organizationId,
            archivedAt: null,
            status: { in: ["MISSING", "EXPIRED", "TO_REVIEW"] },
            OR: [{ jobSiteId: existing.id }, { jobSiteLinks: { some: { jobSiteId: existing.id, unlinkedAt: null } } }],
          },
        }),
        Promise.all([
          db.jobSiteUserAssignment.count({ where: { organizationId, jobSiteId: existing.id, archivedAt: null, startsAt: { lte: transitionTime }, OR: [{ endsAt: null }, { endsAt: { gt: transitionTime } }] } }),
          db.jobSiteWorkerAssignment.count({ where: { organizationId, jobSiteId: existing.id, archivedAt: null, startsAt: { lte: transitionTime }, OR: [{ endsAt: null }, { endsAt: { gt: transitionTime } }] } }),
        ]).then(([users, workers]) => users + workers),
      ])
    : [0, 0, 0, 0];
  const blockers = { openRequests, openChecklistItems, criticalDocuments, activeAssignments };
  const hasBlockingItems = openRequests + openChecklistItems + criticalDocuments > 0;
  const overrideConfirmed = input.overrideConfirmed === true;
  if (hasBlockingItems && (!overrideConfirmed || actorRole !== "OWNER" || !reason)) {
    throw new AccessError(
      `La transizione ha elementi aperti (${openRequests} richieste, ${openChecklistItems} checklist, ${criticalDocuments} documenti). Solo un Owner puo confermare l'override con motivazione.`,
      409,
      "JOB_SITE_PHASE_BLOCKED",
    );
  }

  const jobSite = await db.jobSite.update({
    where: { id: existing.id },
    data: { operationalPhase: nextPhase },
    select: jobSiteSelect,
  });
  await appendContextTimelineEvent({
    organizationId,
    actorUserId: context.userId,
    targetType: "JOB_SITE",
    targetId: existing.id,
    eventType: "JOB_SITE_PHASE_CHANGED",
    eventKey: `job-site:${existing.id}:phase:${existing.operationalPhase}:${nextPhase}:${jobSite.updatedAt.toISOString()}`,
    title: "Fase cantiere aggiornata",
    summary: `Fase cantiere aggiornata da ${existing.operationalPhase} a ${nextPhase}.`,
    metadata: { previousPhase: existing.operationalPhase, nextPhase, overrideConfirmed: hasBlockingItems && overrideConfirmed, reason },
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "JOB_SITE_PHASE_CHANGED",
    entityType: "JOB_SITE",
    entityId: jobSite.id,
    metadata: { previousPhase: existing.operationalPhase, nextPhase, overrideConfirmed: hasBlockingItems && overrideConfirmed, reason },
  });
  return { jobSite, blockers };
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
