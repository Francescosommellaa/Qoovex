import "server-only";

import { db, Prisma } from "@qoovex/db";
import type {
  AuditAction,
  AuditEntityType,
  AuditLogEventResponse,
  AuditLogListResponse,
  AuditMetadata,
  AuditMetadataValue,
  AuditOutcome,
  OrganizationRole,
  ViewerContext,
} from "@qoovex/types";
import { auditActions, auditEntityTypes, auditOutcomes } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { requireOrganizationDomainAccess } from "./domain-access-service";

const AUDIT_READ_ROLES = ["OWNER"] as const;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

const ALLOWED_METADATA_KEYS = new Set([
  "previousStatus",
  "nextStatus",
  "mimeType",
  "size",
  "itemType",
  "entityType",
  "expiresAt",
  "notificationCount",
  "deliveryStatus",
  "emailDigestFrequency",
  "reasonCode",
  "trigger",
  "frequency",
  "scanned",
  "sent",
  "failed",
  "skipped",
  "hasFile",
]);

const SENSITIVE_METADATA_KEY_PARTS = [
  "blobkey",
  "tokenhash",
  "rawtoken",
  "token",
  "url",
  "downloadurl",
  "emailbody",
  "filecontent",
  "password",
  "secret",
  "taxcode",
  "fiscalcode",
  "healthdata",
  "medicaldata",
  "latitude",
  "longitude",
  "coordinates",
  "stack",
];

const auditEventSelect = {
  id: true,
  actorUserId: true,
  actorRole: true,
  action: true,
  entityType: true,
  entityId: true,
  outcome: true,
  metadata: true,
  requestId: true,
  supportSessionId: true,
  createdAt: true,
} as const;

interface ListProductAuditEventsInput {
  action?: unknown;
  entityType?: unknown;
  outcome?: unknown;
  from?: unknown;
  to?: unknown;
  cursor?: unknown;
  limit?: unknown;
}

function isAuditAction(value: unknown): value is AuditAction {
  return typeof value === "string" && (auditActions as readonly string[]).includes(value);
}

function isAuditEntityType(value: unknown): value is AuditEntityType {
  return typeof value === "string" && (auditEntityTypes as readonly string[]).includes(value);
}

function isAuditOutcome(value: unknown): value is AuditOutcome {
  return typeof value === "string" && (auditOutcomes as readonly string[]).includes(value);
}

function isSensitiveMetadataKey(key: string) {
  const normalized = key.toLowerCase();
  return SENSITIVE_METADATA_KEY_PARTS.some((part) => normalized.includes(part));
}

function normalizeMetadataValue(value: unknown): AuditMetadataValue | undefined {
  if (value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value.slice(0, 500);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "boolean") return value;
  return undefined;
}

export function sanitizeAuditMetadata(metadata: unknown): AuditMetadata | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const safe: AuditMetadata = {};
  for (const [key, value] of Object.entries(metadata as Record<string, unknown>)) {
    if (!ALLOWED_METADATA_KEYS.has(key) || isSensitiveMetadataKey(key)) continue;
    const normalized = normalizeMetadataValue(value);
    if (normalized !== undefined) safe[key] = normalized;
  }
  return Object.keys(safe).length ? safe : null;
}

function toAuditLogEventResponse(event: {
  id: string;
  actorUserId: string | null;
  actorRole: OrganizationRole | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string | null;
  outcome: AuditOutcome;
  metadata: Prisma.JsonValue | null;
  requestId: string | null;
  supportSessionId: string | null;
  createdAt: Date;
}): AuditLogEventResponse {
  return {
    id: event.id,
    actorUserId: event.actorUserId,
    actorRole: event.actorRole,
    action: event.action,
    entityType: event.entityType,
    entityId: event.entityId,
    outcome: event.outcome,
    metadata: sanitizeAuditMetadata(event.metadata),
    requestId: event.requestId,
    supportSessionId: event.supportSessionId,
    createdAt: event.createdAt.toISOString(),
  };
}

function parseLimit(value: unknown) {
  if (value === undefined || value === null || value === "") return DEFAULT_LIMIT;
  const numeric = typeof value === "string" ? Number(value) : value;
  if (typeof numeric !== "number" || !Number.isInteger(numeric) || numeric < 1 || numeric > MAX_LIMIT) {
    throw new AccessError("Limite audit non valido.", 409);
  }
  return numeric;
}

function parseOptionalDate(value: unknown, label: string) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw new AccessError(`${label} non valida.`, 409);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new AccessError(`${label} non valida.`, 409);
  return date;
}

function parseAuditFilters(input: ListProductAuditEventsInput = {}) {
  const action = typeof input.action === "string" && input.action.length ? input.action : undefined;
  const entityType = typeof input.entityType === "string" && input.entityType.length ? input.entityType : undefined;
  const outcome = typeof input.outcome === "string" && input.outcome.length ? input.outcome : undefined;
  if (action !== undefined && !isAuditAction(action)) throw new AccessError("Azione audit non valida.", 409);
  if (entityType !== undefined && !isAuditEntityType(entityType)) throw new AccessError("Tipo entita audit non valido.", 409);
  if (outcome !== undefined && !isAuditOutcome(outcome)) throw new AccessError("Esito audit non valido.", 409);
  const from = parseOptionalDate(input.from, "Data iniziale");
  const to = parseOptionalDate(input.to, "Data finale");
  if (from && to && to < from) throw new AccessError("Intervallo date audit non valido.", 409);
  return {
    action,
    entityType,
    outcome,
    from,
    to,
    cursor: typeof input.cursor === "string" && input.cursor.trim() ? input.cursor.trim() : undefined,
    limit: parseLimit(input.limit),
  };
}

export async function recordProductAuditEvent(input: {
  organizationId: string;
  actorUserId?: string | null;
  actorRole?: OrganizationRole | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  outcome?: AuditOutcome;
  metadata?: Record<string, unknown> | null;
  requestId?: string | null;
  supportSessionId?: string | null;
}) {
  const metadata = sanitizeAuditMetadata(input.metadata);
  await db.productAuditEvent.create({
    data: {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId ?? null,
      actorRole: input.actorRole ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      outcome: input.outcome ?? "SUCCESS",
      metadata: metadata as Prisma.InputJsonValue | undefined,
      requestId: input.requestId ?? null,
      supportSessionId: input.supportSessionId ?? null,
    },
    select: { id: true },
  });
}

export async function recordProductAuditEventBestEffort(input: Parameters<typeof recordProductAuditEvent>[0]) {
  try {
    await recordProductAuditEvent(input);
  } catch {
    // Audit prodotto ordinario e best-effort: non blocca il flusso utente.
  }
}

export function auditActorFromContext(context: ViewerContext, actorRole: OrganizationRole | null) {
  return {
    actorUserId: context.userId,
    actorRole,
    supportSessionId: context.support?.sessionId ?? null,
  };
}

export async function listProductAuditEvents(input: ListProductAuditEventsInput = {}): Promise<AuditLogListResponse> {
  const { organizationId } = await requireOrganizationDomainAccess("auditLog:read", AUDIT_READ_ROLES);
  const filters = parseAuditFilters(input);
  const where: {
    organizationId: string;
    action?: AuditAction;
    entityType?: AuditEntityType;
    outcome?: AuditOutcome;
    createdAt?: { gte?: Date; lte?: Date };
  } = { organizationId };
  if (filters.action) where.action = filters.action;
  if (filters.entityType) where.entityType = filters.entityType;
  if (filters.outcome) where.outcome = filters.outcome;
  if (filters.from || filters.to) where.createdAt = { gte: filters.from, lte: filters.to };

  const events = await db.productAuditEvent.findMany({
    where,
    select: auditEventSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    cursor: filters.cursor ? { id: filters.cursor } : undefined,
    skip: filters.cursor ? 1 : 0,
    take: filters.limit + 1,
  });
  const next = events.length > filters.limit ? events.pop() : undefined;
  return {
    events: events.map(toAuditLogEventResponse),
    nextCursor: next?.id ?? null,
    generatedAt: new Date().toISOString(),
  };
}
