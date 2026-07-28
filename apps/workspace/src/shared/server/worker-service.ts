import "server-only";

import { db } from "@qoovex/db";
import type { RecordStatus } from "@qoovex/types";
import { enqueueOperationalProcess } from "@shared/server/operational-process-service";
import { AccessError } from "@shared/server/access-errors";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { trimOptionalText, trimRequiredText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { canReadSiteManagerWorker, canReadWorker, getResourceScope } from "./resource-scope-service";
import { normalizeOptionalEmail, parseEditableRecordStatus, rejectSensitiveFields } from "./worker-jobsite-validation";

const WORKER_MANAGE_ROLES = ["OWNER", "COLLABORATOR"] as const;
const WORKER_READ_ROLES = ["OWNER", "COLLABORATOR"] as const;

const workerSelect = {
  id: true,
  organizationId: true,
  displayName: true,
  email: true,
  phone: true,
  roleLabel: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
} as const;

export interface CreateWorkerInput extends Record<string, unknown> {
  displayName?: unknown;
  email?: unknown;
  phone?: unknown;
  roleLabel?: unknown;
  status?: unknown;
  notes?: unknown;
}

export interface UpdateWorkerInput extends Record<string, unknown> {
  displayName?: unknown;
  email?: unknown;
  phone?: unknown;
  roleLabel?: unknown;
  status?: unknown;
  notes?: unknown;
}

export async function listWorkers() {
  const { context, organizationId } = await requireOrganizationDomainAccess("workers:read", WORKER_READ_ROLES);
  const scope = await getResourceScope(context);
  if (scope.preset === "LIMITED_UPLOAD") {
    if (!scope.linkedWorker) return [];
    const worker = await db.worker.findFirst({ where: { id: scope.linkedWorker.id, organizationId, archivedAt: null }, select: workerSelect });
    return worker ? [worker] : [];
  }
  if (scope.preset === "SITE_MANAGER") {
    if (!scope.siteManagerJobSiteIds.length) return [];
    const assignments = await db.jobSiteWorkerAssignment.findMany({
      where: {
        organizationId,
        archivedAt: null,
        jobSiteId: { in: scope.siteManagerJobSiteIds },
        worker: { archivedAt: null },
      },
      select: { worker: { select: { id: true, organizationId: true, displayName: true, roleLabel: true, status: true, createdAt: true, updatedAt: true, archivedAt: true } } },
      orderBy: [{ worker: { displayName: "asc" } }],
    });
    const seen = new Set<string>();
    return assignments.flatMap(({ worker }) => {
      if (seen.has(worker.id)) return [];
      seen.add(worker.id);
      return [{ ...worker, email: null, phone: null, notes: null }];
    });
  }
  const workers = await db.worker.findMany({
    where: { organizationId, archivedAt: null },
    select: workerSelect,
    orderBy: [{ displayName: "asc" }, { createdAt: "asc" }],
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "workers" });
  return workers;
}

export async function getWorker(workerId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("workers:read", WORKER_READ_ROLES);
  const scope = await getResourceScope(context);
  const worker = await db.worker.findFirst({ where: { id: workerId, organizationId, archivedAt: null }, select: workerSelect });
  if (!worker) throw new AccessError("Lavoratore non trovato.", 404);
  if (!canReadWorker(scope, worker.id)) {
    const assignments = scope.preset === "SITE_MANAGER"
      ? await db.jobSiteWorkerAssignment.findMany({
        where: { organizationId, workerId: worker.id, archivedAt: null, jobSite: { archivedAt: null } },
        select: { jobSiteId: true },
      })
      : [];
    if (!canReadSiteManagerWorker(scope, assignments.map((assignment) => assignment.jobSiteId))) {
      throw new AccessError("Lavoratore non trovato.", 404);
    }
    worker.email = null;
    worker.phone = null;
    worker.notes = null;
  }
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "worker", resourceId: worker.id });
  return worker;
}

export async function createWorker(input: CreateWorkerInput) {
  rejectSensitiveFields(input);
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("workers:create", WORKER_MANAGE_ROLES);
  const displayName = trimRequiredText(input.displayName, "Nome lavoratore", 2, 160);
  const email = normalizeOptionalEmail(input.email) ?? null;
  const phone = trimOptionalText(input.phone, "Telefono", 80) ?? null;
  const roleLabel = trimOptionalText(input.roleLabel, "Ruolo operativo", 120) ?? null;
  const status = input.status === undefined ? "ACTIVE" : parseEditableRecordStatus(input.status);
  const notes = trimOptionalText(input.notes, "Note lavoratore", 4000) ?? null;

  if (email) {
    const duplicate = await db.worker.findFirst({
      where: { organizationId, archivedAt: null, email: { equals: email, mode: "insensitive" } },
      select: { id: true, displayName: true },
    });
    if (duplicate) throw new AccessError(`Esiste gia un lavoratore con questa email: ${duplicate.displayName}.`, 409);
  }

  const worker = await db.$transaction(async (tx) => {
    const created = await tx.worker.create({
      data: { organizationId, displayName, email, phone, roleLabel, status, notes },
      select: workerSelect,
    });
    await enqueueOperationalProcess({
      organizationId,
      type: "WORKER_CREATED",
      triggerKind: "WORKER_CREATED",
      idempotencyKey: `worker:${created.id}:created`,
      context: { source: "workspace", change: "created" },
      artifacts: [{ type: "WORKER", id: created.id, label: created.displayName }],
      actorUserId: context.userId,
      actorRole,
    }, tx);
    return created;
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "worker", resourceId: worker.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "WORKER_CREATED",
    entityType: "WORKER",
    entityId: worker.id,
    metadata: { nextStatus: worker.status },
  });
  return worker;
}

export async function checkWorkerDuplicates(input: { displayName?: unknown; email?: unknown }) {
  const { organizationId } = await requireOrganizationDomainAccess("workers:create", WORKER_MANAGE_ROLES);
  const displayName = trimRequiredText(input.displayName, "Nome lavoratore", 2, 160);
  const email = normalizeOptionalEmail(input.email);
  const [emailMatch, similarNames] = await Promise.all([
    email ? db.worker.findFirst({
      where: { organizationId, archivedAt: null, email: { equals: email, mode: "insensitive" } },
      select: { id: true, displayName: true },
    }) : null,
    db.worker.findMany({
      where: { organizationId, archivedAt: null, displayName: { contains: displayName, mode: "insensitive" } },
      select: { id: true, displayName: true },
      orderBy: [{ displayName: "asc" }],
      take: 5,
    }),
  ]);
  return { emailMatch, similarNames };
}

export async function updateWorker(workerId: string, input: UpdateWorkerInput) {
  rejectSensitiveFields(input);
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("workers:update", WORKER_MANAGE_ROLES);
  const existing = await db.worker.findFirst({ where: { id: workerId, organizationId, archivedAt: null }, select: { id: true } });
  if (!existing) throw new AccessError("Lavoratore non trovato.", 404);

  const data: {
    displayName?: string;
    email?: string | null;
    phone?: string | null;
    roleLabel?: string | null;
    status?: RecordStatus;
    notes?: string | null;
  } = {};
  if (input.displayName !== undefined) data.displayName = trimRequiredText(input.displayName, "Nome lavoratore", 2, 160);
  if (input.email !== undefined) data.email = normalizeOptionalEmail(input.email) ?? null;
  if (input.phone !== undefined) data.phone = trimOptionalText(input.phone, "Telefono", 80) ?? null;
  if (input.roleLabel !== undefined) data.roleLabel = trimOptionalText(input.roleLabel, "Ruolo operativo", 120) ?? null;
  if (input.status !== undefined) data.status = parseEditableRecordStatus(input.status);
  if (input.notes !== undefined) data.notes = trimOptionalText(input.notes, "Note lavoratore", 4000) ?? null;
  if (!Object.keys(data).length) throw new AccessError("Nessun dato lavoratore da aggiornare.", 409);

  const worker = await db.$transaction(async (tx) => {
    const updated = await tx.worker.update({ where: { id: existing.id }, data, select: workerSelect });
    await enqueueOperationalProcess({
      organizationId,
      type: "WORKER_CREATED",
      triggerKind: "WORKER_UPDATED",
      idempotencyKey: `worker:${updated.id}:updated:${updated.updatedAt.toISOString()}`,
      context: { source: "workspace", change: "updated" },
      artifacts: [{ type: "WORKER", id: updated.id, label: updated.displayName }],
      actorUserId: context.userId,
      actorRole,
    }, tx);
    return updated;
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "worker", resourceId: worker.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "WORKER_UPDATED",
    entityType: "WORKER",
    entityId: worker.id,
    metadata: { nextStatus: worker.status },
  });
  return worker;
}

export async function archiveWorker(workerId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("workers:archive", WORKER_MANAGE_ROLES);
  const existing = await db.worker.findFirst({ where: { id: workerId, organizationId, archivedAt: null }, select: { id: true } });
  if (!existing) throw new AccessError("Lavoratore non trovato.", 404);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "worker", resourceId: existing.id });
  const worker = await db.worker.update({
    where: { id: existing.id },
    data: { archivedAt: new Date(), status: "ARCHIVED" },
    select: workerSelect,
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "WORKER_ARCHIVED",
    entityType: "WORKER",
    entityId: worker.id,
    metadata: { nextStatus: worker.status },
  });
  return worker;
}
