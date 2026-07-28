import "server-only";

import { db, type Prisma } from "@qoovex/db";
import type { OperationalRequestStatus } from "@qoovex/types";
import { operationalRequestStatuses } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { assertContextTargetAccessible, appendContextTimelineEvent, parseOperationalTarget } from "./context-timeline-service";
import { isEnumValue, parseOptionalDate, trimOptionalId, trimOptionalText, trimRequiredText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { getResourceScope, type ResourceScope } from "./resource-scope-service";

const requestSelect = {
  id: true,
  organizationId: true,
  targetType: true,
  targetId: true,
  title: true,
  description: true,
  status: true,
  assigneeUserId: true,
  dueAt: true,
  outcome: true,
  createdById: true,
  completedById: true,
  completedAt: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const messageSelect = {
  id: true,
  organizationId: true,
  requestId: true,
  targetType: true,
  targetId: true,
  visibility: true,
  body: true,
  authorId: true,
  createdAt: true,
} as const;

function toRequestResponse(request: {
  dueAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
} & Record<string, unknown>) {
  return {
    ...request,
    dueAt: request.dueAt?.toISOString() ?? null,
    completedAt: request.completedAt?.toISOString() ?? null,
    cancelledAt: request.cancelledAt?.toISOString() ?? null,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  };
}

function toMessageResponse(message: { createdAt: Date } & Record<string, unknown>) {
  return { ...message, createdAt: message.createdAt.toISOString() };
}

function requestVisibilityWhere(scope: ResourceScope): Prisma.OperationalRequestWhereInput {
  if (scope.fullAccess) return {};
  const userId = scope.context.userId;
  const jobSiteIds = scope.visibleJobSiteIds;
  const workerIds = [scope.linkedWorker?.id, ...(scope.grantedResourceIds.WORKER ?? [])].filter((id): id is string => Boolean(id));
  const documentIds = scope.grantedResourceIds.DOCUMENT ?? [];
  const evidenceIds = scope.grantedResourceIds.EVIDENCE ?? [];
  const packageIds = scope.grantedResourceIds.DOCUMENT_PACKAGE ?? [];
  return {
    OR: [
      { createdById: userId },
      { assigneeUserId: userId },
      ...(jobSiteIds.length ? [{ targetType: "JOB_SITE" as const, targetId: { in: jobSiteIds } }] : []),
      ...(workerIds.length ? [{ targetType: "WORKER" as const, targetId: { in: workerIds } }] : []),
      ...(documentIds.length ? [{ targetType: "DOCUMENT" as const, targetId: { in: documentIds } }] : []),
      ...(evidenceIds.length ? [{ targetType: "EVIDENCE" as const, targetId: { in: evidenceIds } }] : []),
      ...(packageIds.length ? [{ targetType: "DOCUMENT_PACKAGE" as const, targetId: { in: packageIds } }] : []),
    ],
  };
}

async function assertAssignee(organizationId: string, userId: string | null | undefined) {
  if (!userId) return null;
  const membership = await db.organizationMembership.findFirst({ where: { organizationId, userId, revokedAt: null }, select: { userId: true } });
  if (!membership) throw new AccessError("Destinatario non disponibile.", 404);
  return membership.userId;
}

function parseStatus(value: unknown): OperationalRequestStatus {
  if (!isEnumValue(operationalRequestStatuses, value)) throw new AccessError("Stato richiesta non valido.", 409);
  return value;
}

function assertTransition(current: OperationalRequestStatus, next: OperationalRequestStatus) {
  const allowed: Record<OperationalRequestStatus, readonly OperationalRequestStatus[]> = {
    OPEN: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
  };
  if (next !== current && !allowed[current].includes(next)) throw new AccessError("Transizione richiesta non consentita.", 409);
}

export async function listOperationalRequests(input: { status?: unknown; targetType?: unknown; targetId?: unknown; take?: unknown } = {}) {
  const { context, organizationId } = await requireOrganizationDomainAccess("requests:read");
  const scope = await getResourceScope(context);
  const take = input.take === undefined ? 50 : Number(input.take);
  if (!Number.isSafeInteger(take) || take < 1 || take > 100) throw new AccessError("Dimensione richieste non valida.", 409);
  const where: Prisma.OperationalRequestWhereInput = { organizationId, ...requestVisibilityWhere(scope) };
  if (input.status !== undefined) where.status = parseStatus(input.status);
  if (input.targetType !== undefined || input.targetId !== undefined) {
    const target = parseOperationalTarget(input.targetType, input.targetId);
    await assertContextTargetAccessible(scope, target.targetType, target.targetId);
    where.targetType = target.targetType;
    where.targetId = target.targetId;
  }
  const requests = await db.operationalRequest.findMany({ where, select: requestSelect, orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }, { id: "desc" }], take });
  return requests.map(toRequestResponse);
}

export async function createOperationalRequest(input: Record<string, unknown>) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("requests:create");
  const scope = await getResourceScope(context);
  const target = parseOperationalTarget(input.targetType, input.targetId);
  if (target.targetType === "CONTEXT_MESSAGE") throw new AccessError("Il messaggio non puo essere il contesto principale di una richiesta.", 409);
  await assertContextTargetAccessible(scope, target.targetType, target.targetId);
  const title = trimRequiredText(input.title, "Titolo richiesta", 2, 160);
  const description = trimOptionalText(input.description, "Descrizione richiesta", 4000) ?? null;
  const assigneeUserId = await assertAssignee(organizationId, trimOptionalId(input.assigneeUserId, "Destinatario"));
  const dueAt = parseOptionalDate(input.dueAt, "Scadenza richiesta") ?? null;
  const request = await db.$transaction(async (tx) => {
    const created = await tx.operationalRequest.create({ data: { organizationId, ...target, title, description, assigneeUserId, dueAt, createdById: context.userId }, select: requestSelect });
    await appendContextTimelineEvent({ organizationId, eventKey: `request:${created.id}:created`, targetType: target.targetType, targetId: target.targetId, eventType: "REQUEST_CREATED", title: "Richiesta operativa creata", summary: title, metadata: { requestId: created.id, status: created.status }, actorUserId: context.userId, actorRole, sourceType: "USER_ACTION", sourceId: created.id }, tx);
    return created;
  });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "OPERATIONAL_REQUEST_CREATED", entityType: "OPERATIONAL_REQUEST", entityId: request.id, metadata: { targetType: request.targetType, status: request.status } });
  return toRequestResponse(request);
}

export async function updateOperationalRequest(requestId: string, input: Record<string, unknown>) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("requests:manage");
  const scope = await getResourceScope(context);
  const existing = await db.operationalRequest.findFirst({ where: { id: requestId, organizationId, ...requestVisibilityWhere(scope) }, select: requestSelect });
  if (!existing) throw new AccessError("Richiesta non trovata.", 404);
  await assertContextTargetAccessible(scope, existing.targetType, existing.targetId);
  const nextStatus = input.status === undefined ? existing.status : parseStatus(input.status);
  assertTransition(existing.status, nextStatus);
  const assigneeUserId = input.assigneeUserId === undefined ? undefined : await assertAssignee(organizationId, trimOptionalId(input.assigneeUserId, "Destinatario"));
  const dueAt = input.dueAt === undefined ? undefined : parseOptionalDate(input.dueAt, "Scadenza richiesta");
  const outcome = trimOptionalText(input.outcome, "Esito richiesta", 4000);
  if ((nextStatus === "COMPLETED" || nextStatus === "CANCELLED") && !(outcome ?? existing.outcome)) throw new AccessError("Indica l'esito della richiesta.", 409);
  if (existing.status === nextStatus && assigneeUserId === undefined && dueAt === undefined && outcome === undefined) throw new AccessError("Nessun dato richiesta da aggiornare.", 409);
  const changedAt = new Date();
  const request = await db.$transaction(async (tx) => {
    const updated = await tx.operationalRequest.update({
      where: { id: existing.id },
      data: {
        status: nextStatus,
        ...(assigneeUserId === undefined ? {} : { assigneeUserId }),
        ...(dueAt === undefined ? {} : { dueAt }),
        ...(outcome === undefined ? {} : { outcome }),
        completedAt: nextStatus === "COMPLETED" ? changedAt : existing.completedAt,
        completedById: nextStatus === "COMPLETED" ? context.userId : existing.completedById,
        cancelledAt: nextStatus === "CANCELLED" ? changedAt : existing.cancelledAt,
      },
      select: requestSelect,
    });
    await appendContextTimelineEvent({ organizationId, eventKey: `request:${updated.id}:revision:${updated.updatedAt.toISOString()}`, targetType: updated.targetType, targetId: updated.targetId, eventType: "REQUEST_UPDATED", title: "Richiesta operativa aggiornata", summary: updated.title, metadata: { requestId: updated.id, previousStatus: existing.status, status: updated.status }, actorUserId: context.userId, actorRole, sourceType: "USER_ACTION", sourceId: updated.id }, tx);
    return updated;
  });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "OPERATIONAL_REQUEST_UPDATED", entityType: "OPERATIONAL_REQUEST", entityId: request.id, metadata: { previousStatus: existing.status, status: request.status } });
  return toRequestResponse(request);
}

export async function listContextMessages(input: { targetType?: unknown; targetId?: unknown; take?: unknown }) {
  const { context, organizationId } = await requireOrganizationDomainAccess("contextMessages:read");
  const scope = await getResourceScope(context);
  const target = parseOperationalTarget(input.targetType, input.targetId);
  await assertContextTargetAccessible(scope, target.targetType, target.targetId);
  const take = input.take === undefined ? 50 : Number(input.take);
  if (!Number.isSafeInteger(take) || take < 1 || take > 100) throw new AccessError("Dimensione messaggi non valida.", 409);
  const messages = await db.contextMessage.findMany({ where: { organizationId, ...target, visibility: "INTERNAL" }, select: messageSelect, orderBy: [{ createdAt: "asc" }, { id: "asc" }], take });
  return messages.map(toMessageResponse);
}

export async function createContextMessage(input: Record<string, unknown>) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("contextMessages:create");
  const scope = await getResourceScope(context);
  const target = parseOperationalTarget(input.targetType, input.targetId);
  if (target.targetType === "CONTEXT_MESSAGE") throw new AccessError("Un messaggio non puo riferirsi a un altro messaggio.", 409);
  await assertContextTargetAccessible(scope, target.targetType, target.targetId);
  const body = trimRequiredText(input.body, "Messaggio", 1, 4000);
  const requestId = trimOptionalId(input.requestId, "Richiesta") ?? null;
  if (requestId) {
    const request = await db.operationalRequest.findFirst({ where: { id: requestId, organizationId, targetType: target.targetType, targetId: target.targetId, ...requestVisibilityWhere(scope) }, select: { id: true } });
    if (!request) throw new AccessError("Richiesta non trovata.", 404);
  }
  const message = await db.$transaction(async (tx) => {
    const created = await tx.contextMessage.create({ data: { organizationId, requestId, ...target, body, authorId: context.userId }, select: messageSelect });
    await appendContextTimelineEvent({ organizationId, eventKey: `context-message:${created.id}:created`, targetType: target.targetType, targetId: target.targetId, eventType: "CONTEXT_MESSAGE_ADDED", title: "Messaggio contestuale aggiunto", summary: body.slice(0, 160), metadata: { messageId: created.id, requestId }, actorUserId: context.userId, actorRole, sourceType: "USER_ACTION", sourceId: created.id }, tx);
    return created;
  });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "CONTEXT_MESSAGE_CREATED", entityType: "CONTEXT_MESSAGE", entityId: message.id, metadata: { targetType: message.targetType, hasRequest: Boolean(message.requestId) } });
  return toMessageResponse(message);
}
