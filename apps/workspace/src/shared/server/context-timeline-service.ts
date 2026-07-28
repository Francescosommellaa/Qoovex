import "server-only";

import { db, type Prisma } from "@qoovex/db";
import type {
  OperationalActorType,
  OperationalArtifactType,
  OperationalEventSourceType,
  OperationalEventType,
  OperationalImpact,
  OperationalReliability,
} from "@qoovex/types";
import { operationalArtifactTypes, operationalEventTypes } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { isEnumValue, trimRequiredText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import {
  canReadDeadline,
  canReadDocument,
  canReadEvidence,
  canReadJobSite,
  canReadWorker,
  getResourceScope,
  hasResourceGrant,
  type ResourceScope,
} from "./resource-scope-service";

type DbClient = typeof db | Prisma.TransactionClient;
type TimelineMetadataValue = string | number | boolean | null;

const FORBIDDEN_METADATA_KEYS = ["token", "secret", "blob", "url", "content", "ip", "useragent", "credential"] as const;

function sanitizeMetadata(value: unknown): Record<string, TimelineMetadataValue> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const result: Record<string, TimelineMetadataValue> = {};
  for (const [key, item] of Object.entries(value)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, "");
    if (FORBIDDEN_METADATA_KEYS.some((forbidden) => normalizedKey.includes(forbidden))) continue;
    if (item === null || typeof item === "string" || typeof item === "number" || typeof item === "boolean") result[key] = item;
  }
  return Object.keys(result).length ? result : undefined;
}

export function parseOperationalTarget(type: unknown, id: unknown) {
  if (!isEnumValue(operationalArtifactTypes, type)) throw new AccessError("Tipo contesto operativo non valido.", 409);
  const targetId = trimRequiredText(id, "Contesto operativo", 1, 191);
  return { targetType: type, targetId };
}

export async function assertContextTargetAccessible(
  scope: ResourceScope,
  targetType: OperationalArtifactType,
  targetId: string,
  client: DbClient = db,
) {
  const organizationId = scope.organizationId;
  if (targetType === "ORGANIZATION") {
    if (targetId !== organizationId) throw new AccessError("Risorsa non disponibile.", 404);
    return;
  }
  if (targetType === "JOB_SITE") {
    const item = await client.jobSite.findFirst({ where: { id: targetId, organizationId, archivedAt: null }, select: { id: true } });
    if (!item || !canReadJobSite(scope, item.id)) throw new AccessError("Risorsa non disponibile.", 404);
    return;
  }
  if (targetType === "WORKER") {
    const item = await client.worker.findFirst({ where: { id: targetId, organizationId, archivedAt: null }, select: { id: true } });
    if (!item || !canReadWorker(scope, item.id)) throw new AccessError("Risorsa non disponibile.", 404);
    return;
  }
  if (targetType === "DOCUMENT" || targetType === "DOCUMENT_VERSION") {
    const item = targetType === "DOCUMENT"
      ? await client.document.findFirst({
        where: { id: targetId, organizationId, archivedAt: null },
        select: { id: true, documentTypeId: true, ownerType: true, workerId: true, jobSiteId: true, documentType: { select: { sensitivity: true } } },
      })
      : (await client.documentVersion.findFirst({
        where: { id: targetId, organizationId, archivedAt: null },
        select: { document: { select: { id: true, documentTypeId: true, ownerType: true, workerId: true, jobSiteId: true, documentType: { select: { sensitivity: true } } } } },
      }))?.document;
    if (!item || !canReadDocument(scope, item)) throw new AccessError("Risorsa non disponibile.", 404);
    if (item.documentType?.sensitivity !== "STANDARD" && !scope.context.permissions.includes("documents:sensitive:read")) throw new AccessError("Risorsa non disponibile.", 404);
    return;
  }
  if (targetType === "DOCUMENT_REQUIREMENT") {
    const item = await client.documentRequirement.findFirst({ where: { id: targetId, organizationId, archivedAt: null }, select: { jobSiteId: true } });
    if (!item || (!scope.fullAccess && (!item.jobSiteId || !canReadJobSite(scope, item.jobSiteId)))) throw new AccessError("Risorsa non disponibile.", 404);
    return;
  }
  if (targetType === "DEADLINE") {
    const item = await client.deadline.findFirst({
      where: { id: targetId, organizationId, archivedAt: null },
      select: { workerId: true, jobSiteId: true, document: { select: { id: true, documentTypeId: true, ownerType: true, workerId: true, jobSiteId: true } } },
    });
    if (!item || !canReadDeadline(scope, item)) throw new AccessError("Risorsa non disponibile.", 404);
    return;
  }
  if (targetType === "CHECKLIST") {
    const item = await client.checklist.findFirst({ where: { id: targetId, organizationId, archivedAt: null }, select: { jobSiteId: true } });
    if (!item || (!scope.fullAccess && (!item.jobSiteId || !canReadJobSite(scope, item.jobSiteId)))) throw new AccessError("Risorsa non disponibile.", 404);
    return;
  }
  if (targetType === "EVIDENCE") {
    const item = await client.evidence.findFirst({
      where: { id: targetId, organizationId, archivedAt: null },
      select: { id: true, workerId: true, jobSiteId: true, sensitivity: true, checklistItem: { select: { checklist: { select: { jobSiteId: true } } } } },
    });
    if (!item || !canReadEvidence(scope, item) || (item.sensitivity === "RESTRICTED" && !scope.context.permissions.includes("evidence:sensitive:read"))) throw new AccessError("Risorsa non disponibile.", 404);
    return;
  }
  if (targetType === "DOCUMENT_PACKAGE") {
    const item = await client.documentPackage.findFirst({ where: { id: targetId, organizationId, archivedAt: null }, select: { id: true, jobSiteId: true } });
    if (!item || (!scope.fullAccess && !hasResourceGrant(scope, "DOCUMENT_PACKAGE", item.id) && (!item.jobSiteId || !canReadJobSite(scope, item.jobSiteId)))) throw new AccessError("Risorsa non disponibile.", 404);
    return;
  }
  if (targetType === "SHARE_LINK") {
    const item = await client.shareLink.findFirst({ where: { id: targetId, organizationId }, select: { id: true } });
    if (!item || !scope.fullAccess) throw new AccessError("Risorsa non disponibile.", 404);
    return;
  }
  if (targetType === "OPERATIONAL_REQUEST") {
    const item = await client.operationalRequest.findFirst({ where: { id: targetId, organizationId }, select: { createdById: true, assigneeUserId: true } });
    if (!item || (!scope.fullAccess && item.createdById !== scope.context.userId && item.assigneeUserId !== scope.context.userId)) throw new AccessError("Risorsa non disponibile.", 404);
    return;
  }
  if (targetType === "CONTEXT_MESSAGE") {
    const item = await client.contextMessage.findFirst({ where: { id: targetId, organizationId }, select: { authorId: true } });
    if (!item || (!scope.fullAccess && item.authorId !== scope.context.userId)) throw new AccessError("Risorsa non disponibile.", 404);
    return;
  }
  if (targetType === "DOCUMENT_SOURCE") {
    const item = await client.documentSourcePolicy.findFirst({ where: { id: targetId, organizationId, archivedAt: null }, select: { responsibleUserId: true } });
    if (!item || (!scope.fullAccess && item.responsibleUserId !== scope.context.userId)) throw new AccessError("Risorsa non disponibile.", 404);
    return;
  }
  throw new AccessError("Risorsa non disponibile.", 404);
}

export async function appendContextTimelineEvent(input: {
  organizationId: string;
  eventKey: string;
  targetType: OperationalArtifactType;
  targetId: string;
  eventType: OperationalEventType;
  title: string;
  summary?: string | null;
  metadata?: unknown;
  actorUserId?: string | null;
  actorType?: OperationalActorType;
  actorRole?: "OWNER" | "COLLABORATOR" | null;
  sourceType?: OperationalEventSourceType;
  sourceId?: string | null;
  reliability?: OperationalReliability;
  impact?: OperationalImpact;
}, client: DbClient = db) {
  return client.contextTimelineEvent.upsert({
    where: { organizationId_eventKey: { organizationId: input.organizationId, eventKey: input.eventKey } },
    create: {
      organizationId: input.organizationId,
      eventKey: trimRequiredText(input.eventKey, "Chiave evento", 2, 191),
      targetType: input.targetType,
      targetId: input.targetId,
      eventType: input.eventType,
      title: trimRequiredText(input.title, "Titolo evento", 2, 160),
      summary: input.summary?.trim().slice(0, 2000) || null,
      metadata: sanitizeMetadata(input.metadata),
      actorUserId: input.actorUserId ?? null,
      actorType: input.actorType ?? (input.actorUserId ? "USER" : "SYSTEM"),
      actorRole: input.actorRole ?? null,
      sourceType: input.sourceType ?? "DOMAIN",
      sourceId: input.sourceId ?? null,
      reliability: input.reliability ?? "VERIFIED",
      impact: input.impact ?? "LOW",
    },
    update: {},
    select: { id: true, targetType: true, targetId: true, eventType: true, title: true, summary: true, actorType: true, occurredAt: true },
  });
}

export async function listContextTimeline(input: { targetType?: unknown; targetId?: unknown; take?: unknown }) {
  const { context } = await requireOrganizationDomainAccess("contextMessages:read");
  const scope = await getResourceScope(context);
  const target = parseOperationalTarget(input.targetType, input.targetId);
  await assertContextTargetAccessible(scope, target.targetType, target.targetId);
  const take = input.take === undefined ? 50 : Number(input.take);
  if (!Number.isSafeInteger(take) || take < 1 || take > 100) throw new AccessError("Dimensione timeline non valida.", 409);
  return db.contextTimelineEvent.findMany({
    where: { organizationId: scope.organizationId, targetType: target.targetType, targetId: target.targetId },
    select: { id: true, targetType: true, targetId: true, eventType: true, title: true, summary: true, actorType: true, occurredAt: true },
    orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
    take,
  });
}
