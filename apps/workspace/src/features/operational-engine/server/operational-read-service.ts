import "server-only";

import { db, Prisma } from "@qoovex/db";
import type {
  OperationalArtifactReferenceDto,
  OperationalArtifactType,
  OperationalCenterResponse,
  OperationalCenterItemDto,
  OperationalCenterFilters,
  OperationalCenterPage,
  OperationalDecisionDto,
  OperationalEventDto,
  OperationalExceptionDto,
  OperationalProcessDetail,
  OperationalProcessPage,
  OperationalProcessStatus,
  OperationalProcessSummary,
  OperationalProcessType,
  OperationalTimelinePage,
  OrganizationPermission,
  OrganizationRole,
  ResolveOperationalDecisionInput,
  ResolveOperationalExceptionInput,
  RetryOperationalStepInput,
} from "@qoovex/types";
import { operationalArtifactTypes, operationalProcessStatuses, operationalProcessTypes } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { requirePermission } from "@shared/server/access-context-service";
import { requireOrganizationDomainAccess } from "@shared/server/domain-access-service";
import { getResourceScope, type ResourceScope } from "@shared/server/resource-scope-service";
import { auditActorFromContext } from "@shared/server/product-audit-service";
import { getOperationalDefinition } from "./definitions";

const READ_ROLES = ["OWNER", "COLLABORATOR"] as const;
const MANUAL_EXCEPTION_TYPES = ["DATA_TO_VERIFY", "PARTIAL_RESULT"] as const;
const roleLabels: Record<OrganizationRole, string> = {
  OWNER: "Titolare",
  COLLABORATOR: "Collaboratore",
};

function jsonObject(value: Prisma.JsonValue | null): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

interface OperationalCursor {
  v: 1;
  sort: "PROCESS_CREATED" | "EVENT_OCCURRED";
  at: string;
  type: string;
  id: string;
}

function encodeCursor(cursor: OperationalCursor) {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

function decodeCursor(value: unknown, expectedSort: OperationalCursor["sort"]) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length > 500) throw new AccessError("Cursor operativo non valido.", 400);
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<OperationalCursor>;
    if (parsed.v !== 1 || parsed.sort !== expectedSort || typeof parsed.at !== "string" || Number.isNaN(Date.parse(parsed.at)) || typeof parsed.type !== "string" || !parsed.type || typeof parsed.id !== "string" || !parsed.id) throw new Error("invalid");
    return parsed as OperationalCursor;
  } catch {
    throw new AccessError("Cursor operativo non valido.", 400);
  }
}

function parseTake(value: unknown, fallback = 20) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = typeof value === "string" ? Number(value) : value;
  if (!Number.isSafeInteger(parsed) || Number(parsed) < 1 || Number(parsed) > 50) throw new AccessError("Dimensione pagina operativa non valida.", 400);
  return Number(parsed);
}

async function operationalAccess() {
  const access = await requireOrganizationDomainAccess("organization:read", READ_ROLES);
  return { ...access, scope: await getResourceScope(access.context) };
}

export async function processScopeWhere(scope: ResourceScope): Promise<Prisma.OperationalProcessWhereInput> {
  if (scope.fullAccess) return { organizationId: scope.organizationId };
  const jobSiteIds = scope.preset === "SITE_MANAGER" ? scope.siteManagerJobSiteIds : scope.workerJobSiteIds;
  const workerIds = scope.linkedWorker ? [scope.linkedWorker.id] : [];
  if (!jobSiteIds.length && !workerIds.length) return { organizationId: scope.organizationId, id: "__no_visible_process__" };
  const [documents, checklists, evidence] = await Promise.all([
    db.document.findMany({
      where: {
        organizationId: scope.organizationId,
        archivedAt: null,
        OR: [
          ...(workerIds.length ? [{ ownerType: "WORKER" as const, workerId: { in: workerIds } }] : []),
          ...(jobSiteIds.length ? [{ ownerType: "JOB_SITE" as const, jobSiteId: { in: jobSiteIds } }] : []),
        ],
      },
      select: { id: true },
    }),
    db.checklist.findMany({ where: { organizationId: scope.organizationId, archivedAt: null, jobSiteId: { in: jobSiteIds } }, select: { id: true } }),
    db.evidence.findMany({
      where: {
        organizationId: scope.organizationId,
        archivedAt: null,
        OR: [
          ...(workerIds.length ? [{ workerId: { in: workerIds } }] : []),
          ...(jobSiteIds.length ? [{ jobSiteId: { in: jobSiteIds } }] : []),
        ],
      },
      select: { id: true },
    }),
  ]);
  const allowed = [
    ...workerIds.map((id) => ({ artifactType: "WORKER" as const, artifactId: id })),
    ...jobSiteIds.map((id) => ({ artifactType: "JOB_SITE" as const, artifactId: id })),
    ...documents.map(({ id }) => ({ artifactType: "DOCUMENT" as const, artifactId: id })),
    ...checklists.map(({ id }) => ({ artifactType: "CHECKLIST" as const, artifactId: id })),
    ...evidence.map(({ id }) => ({ artifactType: "EVIDENCE" as const, artifactId: id })),
  ];
  return {
    organizationId: scope.organizationId,
    ...(allowed.length ? { artifactRefs: { some: {}, every: { OR: allowed } } } : { id: "__no_visible_process__" }),
  };
}

function artifactHref(type: string, id: string) {
  if (type === "DOCUMENT") return `/documents/${id}`;
  if (type === "WORKER") return `/workers/${id}`;
  if (type === "JOB_SITE") return `/job-sites/${id}`;
  if (type === "DEADLINE") return `/deadlines/${id}`;
  if (type === "CHECKLIST") return `/checklists/${id}`;
  if (type === "EVIDENCE") return `/evidence/${id}`;
  if (type === "DOCUMENT_PACKAGE") return `/document-packages/${id}`;
  return null;
}

function toArtifactDto(value: { artifactType: OperationalArtifactReferenceDto["type"]; artifactId: string; label: string | null }): OperationalArtifactReferenceDto {
  return { type: value.artifactType, id: value.artifactId, label: value.label, href: artifactHref(value.artifactType, value.artifactId) };
}

function decisionOptions(value: Prisma.JsonValue): OperationalDecisionDto["options"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((option) => {
    const item = jsonObject(option);
    return typeof item.key === "string" && typeof item.label === "string"
      ? [{ key: item.key, label: item.label, description: typeof item.description === "string" ? item.description : null }]
      : [];
  });
}

function toDecisionDto(value: {
  id: string; processId: string; type: OperationalDecisionDto["type"]; status: OperationalDecisionDto["status"];
  question: string; explanation: string | null; options: Prisma.JsonValue; proposedOptionKey: string | null;
  selectedOptionKey: string | null; selectedValue: string | null; impact: OperationalDecisionDto["impact"];
  createdAt: Date; decidedAt: Date | null;
}, canResolve: boolean): OperationalDecisionDto {
  return {
    id: value.id,
    processId: value.processId,
    type: value.type,
    status: value.status,
    question: value.question,
    explanation: value.explanation,
    options: decisionOptions(value.options),
    proposedOptionKey: value.proposedOptionKey,
    selectedOptionKey: value.selectedOptionKey,
    selectedValue: value.selectedValue,
    impact: value.impact,
    createdAt: value.createdAt.toISOString(),
    decidedAt: value.decidedAt?.toISOString() ?? null,
    canResolve: canResolve && value.status === "OPEN",
  };
}

function toExceptionDto(value: {
  id: string; processId: string; type: OperationalExceptionDto["type"]; severity: OperationalExceptionDto["severity"];
  status: OperationalExceptionDto["status"]; title: string; explanation: string; nextStep: string; dueAt: Date | null;
  createdAt: Date; resolvedAt: Date | null; decisionId?: string | null;
}, canResolve: boolean): OperationalExceptionDto {
  return {
    id: value.id,
    processId: value.processId,
    type: value.type,
    severity: value.severity,
    status: value.status,
    title: value.title,
    explanation: value.explanation,
    nextStep: value.nextStep,
    dueAt: value.dueAt?.toISOString() ?? null,
    createdAt: value.createdAt.toISOString(),
    resolvedAt: value.resolvedAt?.toISOString() ?? null,
    canResolve: canResolve && value.status === "OPEN" && !value.decisionId && (MANUAL_EXCEPTION_TYPES as readonly string[]).includes(value.type),
  };
}

function toEventDto(value: {
  id: string; kind: OperationalEventDto["kind"]; title: string; summary: string | null;
  eventType: OperationalEventDto["eventType"]; actorType: OperationalEventDto["actorType"];
  actorRole: OperationalEventDto["actorRole"]; sourceType: OperationalEventDto["sourceType"]; sourceId: string | null;
  reliability: OperationalEventDto["reliability"]; impact: OperationalEventDto["impact"]; occurredAt: Date;
  metadata: Prisma.JsonValue | null;
  artifactRefs: Array<{ artifactType: OperationalArtifactReferenceDto["type"]; artifactId: string }>;
}): OperationalEventDto {
  const metadata = jsonObject(value.metadata);
  const text = (key: string) => typeof metadata[key] === "string" ? metadata[key] as string : null;
  return {
    id: value.id,
    kind: value.kind,
    eventType: value.eventType,
    title: value.title,
    summary: value.summary,
    actorType: value.actorType,
    actorRole: value.actorRole,
    sourceType: value.sourceType,
    sourceId: value.sourceId,
    reliability: value.reliability,
    impact: value.impact,
    artifacts: value.artifactRefs.map((item) => toArtifactDto({ ...item, label: null })),
    reason: text("reason"),
    previousState: text("previousState"),
    nextState: text("nextState"),
    result: text("result"),
    nextStep: text("nextStep"),
    occurredAt: value.occurredAt.toISOString(),
  };
}

const eventSelect = {
  id: true,
  kind: true,
  eventType: true,
  title: true,
  summary: true,
  metadata: true,
  actorType: true,
  actorRole: true,
  sourceType: true,
  sourceId: true,
  reliability: true,
  impact: true,
  occurredAt: true,
  artifactRefs: { select: { artifactType: true, artifactId: true }, orderBy: [{ artifactType: "asc" }, { artifactId: "asc" }] },
} satisfies Prisma.OperationalEventSelect;

function toProcessSummary(value: {
  id: string; type: OperationalProcessType; definitionVersion: number; status: OperationalProcessStatus;
  reliability: OperationalProcessSummary["reliability"]; impact: OperationalProcessSummary["impact"];
  resultSummary: Prisma.JsonValue | null; createdAt: Date; updatedAt: Date; completedAt: Date | null;
  _count: { decisions: number; exceptions: number };
}): OperationalProcessSummary {
  const result = jsonObject(value.resultSummary);
  const definition = getOperationalDefinition(value.type);
  return {
    id: value.id,
    type: value.type,
    definitionVersion: value.definitionVersion,
    status: value.status,
    title: definition.title,
    summary: typeof result.summary === "string" ? result.summary : null,
    reliability: value.reliability,
    impact: value.impact,
    openDecisionCount: value._count.decisions,
    openExceptionCount: value._count.exceptions,
    createdAt: value.createdAt.toISOString(),
    updatedAt: value.updatedAt.toISOString(),
    completedAt: value.completedAt?.toISOString() ?? null,
    href: `/operations/${value.id}`,
  };
}

const summarySelect = {
  id: true,
  organizationId: true,
  type: true,
  definitionVersion: true,
  status: true,
  reliability: true,
  impact: true,
  resultSummary: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  _count: { select: { decisions: { where: { status: "OPEN" as const } }, exceptions: { where: { status: "OPEN" as const } } } },
} as const;

export async function listOperationalProcesses(input: { cursor?: unknown; take?: unknown; status?: unknown; type?: unknown; artifactType?: unknown; artifactId?: unknown } = {}): Promise<OperationalProcessPage> {
  const { scope } = await operationalAccess();
  const scopeWhere = await processScopeWhere(scope);
  const filters: Prisma.OperationalProcessWhereInput[] = [scopeWhere];
  if (input.status !== undefined) {
    if (typeof input.status !== "string" || !(operationalProcessStatuses as readonly string[]).includes(input.status)) throw new AccessError("Stato processo non valido.", 400);
    filters.push({ status: input.status as OperationalProcessStatus });
  }
  if (input.type !== undefined) {
    if (typeof input.type !== "string" || !(operationalProcessTypes as readonly string[]).includes(input.type)) throw new AccessError("Tipo processo non valido.", 400);
    filters.push({ type: input.type as OperationalProcessType });
  }
  if (input.artifactType !== undefined || input.artifactId !== undefined) {
    if (typeof input.artifactType !== "string" || !(operationalArtifactTypes as readonly string[]).includes(input.artifactType) || typeof input.artifactId !== "string" || !input.artifactId.trim() || input.artifactId.length > 200) throw new AccessError("Filtro artifact non valido.", 400);
    filters.push({ artifactRefs: { some: { artifactType: input.artifactType as OperationalArtifactType, artifactId: input.artifactId } } });
  }
  const take = parseTake(input.take);
  const cursor = decodeCursor(input.cursor, "PROCESS_CREATED");
  if (cursor) filters.push({ OR: [{ createdAt: { lt: new Date(cursor.at) } }, { createdAt: new Date(cursor.at), id: { lt: cursor.id } }] });
  const items = await db.operationalProcess.findMany({
    where: { AND: filters },
    select: summarySelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
  });
  const page = items.slice(0, take);
  const last = page.at(-1);
  return { items: page.map(toProcessSummary), nextCursor: items.length > take && last ? encodeCursor({ v: 1, sort: "PROCESS_CREATED", at: last.createdAt.toISOString(), type: last.type, id: last.id }) : null };
}

async function findVisibleProcess(processId: string) {
  const { scope, actorRole } = await operationalAccess();
  const scopeWhere = await processScopeWhere(scope);
  const process = await db.operationalProcess.findFirst({
    where: { AND: [scopeWhere, { id: processId }] },
    select: {
      ...summarySelect,
      artifactRefs: { select: { artifactType: true, artifactId: true, label: true }, orderBy: { createdAt: "asc" } },
      steps: { select: { id: true, key: true, position: true, status: true, attemptCount: true, nextAttemptAt: true, startedAt: true, completedAt: true }, orderBy: { position: "asc" } },
      decisions: { select: { id: true, processId: true, type: true, status: true, question: true, explanation: true, options: true, proposedOptionKey: true, selectedOptionKey: true, selectedValue: true, impact: true, createdAt: true, decidedAt: true }, orderBy: { createdAt: "asc" } },
      exceptions: { select: { id: true, processId: true, decisionId: true, type: true, severity: true, status: true, title: true, explanation: true, nextStep: true, dueAt: true, createdAt: true, resolvedAt: true }, orderBy: { createdAt: "asc" } },
      events: { where: { userVisible: true }, select: eventSelect, orderBy: [{ occurredAt: "desc" }, { id: "desc" }], take: 21 },
    },
  });
  if (!process) throw new AccessError("Processo operativo non trovato.", 404);
  return { process, actorRole, scope };
}

export async function getOperationalProcess(processId: string): Promise<OperationalProcessDetail> {
  const { process, scope } = await findVisibleProcess(processId);
  const definition = getOperationalDefinition(process.type);
  const canDecide = scope.context.permissions.includes("processes:decide");
  const canManuallyResolve = scope.context.permissions.includes("processes:exceptions:resolve");
  const timelineItems = process.events.slice(0, 20);
  return {
    ...toProcessSummary(process),
    artifacts: process.artifactRefs.map(toArtifactDto),
    steps: process.steps.map((step) => ({
      ...step,
      label: definition.steps.find((item) => item.key === step.key)?.label ?? step.key,
      nextAttemptAt: step.nextAttemptAt.toISOString(),
      startedAt: step.startedAt?.toISOString() ?? null,
      completedAt: step.completedAt?.toISOString() ?? null,
      canRetry: scope.context.permissions.includes("processes:retry") && step.status === "TECHNICAL_FAILURE",
    })),
    decisions: process.decisions.map((decision) => toDecisionDto(decision, canDecide)),
    exceptions: process.exceptions.map((exception) => toExceptionDto(exception, canManuallyResolve)),
    timeline: { items: timelineItems.map(toEventDto), nextCursor: process.events.length > 20 && timelineItems[19] ? encodeCursor({ v: 1, sort: "EVENT_OCCURRED", at: timelineItems[19].occurredAt.toISOString(), type: timelineItems[19].eventType, id: timelineItems[19].id }) : null },
  };
}

export async function listOperationalEvents(processId: string, input: { cursor?: unknown; take?: unknown } = {}): Promise<OperationalTimelinePage> {
  const { process } = await findVisibleProcess(processId);
  const take = parseTake(input.take);
  const cursor = decodeCursor(input.cursor, "EVENT_OCCURRED");
  const events = await db.operationalEvent.findMany({
    where: {
      organizationId: process.organizationId,
      processId: process.id,
      userVisible: true,
      ...(cursor ? { OR: [{ occurredAt: { lt: new Date(cursor.at) } }, { occurredAt: new Date(cursor.at), id: { lt: cursor.id } }] } : {}),
    },
    select: eventSelect,
    orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
    take: take + 1,
  });
  const page = events.slice(0, take);
  const last = page.at(-1);
  return { items: page.map(toEventDto), nextCursor: events.length > take && last ? encodeCursor({ v: 1, sort: "EVENT_OCCURRED", at: last.occurredAt.toISOString(), type: last.eventType, id: last.id }) : null };
}

export async function listOperationalArtifactEvents(
  artifactTypeValue: unknown,
  artifactIdValue: unknown,
  input: { cursor?: unknown; take?: unknown } = {},
): Promise<OperationalTimelinePage> {
  if (typeof artifactTypeValue !== "string" || !(operationalArtifactTypes as readonly string[]).includes(artifactTypeValue)) {
    throw new AccessError("Tipo artifact non valido.", 400);
  }
  if (typeof artifactIdValue !== "string" || !artifactIdValue.trim() || artifactIdValue.length > 200) {
    throw new AccessError("Artifact non valido.", 400);
  }
  const artifactType = artifactTypeValue as OperationalArtifactType;
  const artifactId = artifactIdValue.trim();
  const { context, scope } = await operationalAccess();
  if (artifactType === "DOCUMENT_PACKAGE" || artifactType === "SHARE_LINK") {
    requirePermission(context, "documentPackages:share");
    if (!scope.fullAccess) throw new AccessError("Risorsa non disponibile.", 404);
  }
  const processWhere = await processScopeWhere(scope);
  const take = parseTake(input.take);
  const cursor = decodeCursor(input.cursor, "EVENT_OCCURRED");
  const events = await db.operationalEvent.findMany({
    where: {
      organizationId: scope.organizationId,
      userVisible: true,
      artifactRefs: { some: { artifactType, artifactId } },
      process: { is: processWhere },
      ...(cursor ? { OR: [{ occurredAt: { lt: new Date(cursor.at) } }, { occurredAt: new Date(cursor.at), id: { lt: cursor.id } }] } : {}),
    },
    select: eventSelect,
    orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
    take: take + 1,
  });
  const page = events.slice(0, take);
  const last = page.at(-1);
  return {
    items: page.map(toEventDto),
    nextCursor: events.length > take && last
      ? encodeCursor({ v: 1, sort: "EVENT_OCCURRED", at: last.occurredAt.toISOString(), type: last.eventType, id: last.id })
      : null,
  };
}

export async function getOperationalCenter(): Promise<OperationalCenterResponse> {
  const { context, actorRole, scope } = await operationalAccess();
  const where = await processScopeWhere(scope);
  const activeStatuses: OperationalProcessStatus[] = ["RECEIVED", "READY", "RUNNING", "WAITING_FOR_DECISION", "BLOCKED", "RETRY_SCHEDULED", "TECHNICAL_FAILURE"];
  const canShare = scope.fullAccess && context.permissions.includes("documentPackages:share");
  const openDeadlineStatuses = ["SCHEDULED", "EXPIRING_SOON", "EXPIRED"] as const;
  const deadlineWhere: Prisma.DeadlineWhereInput = scope.fullAccess
    ? { organizationId: scope.organizationId, archivedAt: null, status: { in: [...openDeadlineStatuses] } }
    : scope.preset === "SITE_MANAGER"
      ? { organizationId: scope.organizationId, archivedAt: null, status: { in: [...openDeadlineStatuses] }, jobSiteId: { in: scope.siteManagerJobSiteIds } }
      : { organizationId: scope.organizationId, archivedAt: null, status: { in: [...openDeadlineStatuses] }, OR: [
          ...(scope.linkedWorker ? [{ workerId: scope.linkedWorker.id }] : []),
          ...(scope.workerJobSiteIds.length ? [{ jobSiteId: { in: scope.workerJobSiteIds } }] : []),
        ] };
  // Keep the bounded read model sequential on one request. The local guarded
  // PostgreSQL runtime has a ten-connection ceiling, while the shell also loads
  // auth and notification data; issuing every center query concurrently can
  // exhaust the pool before the page becomes actionable.
  const decisions = await db.operationalDecision.findMany({ where: { organizationId: scope.organizationId, status: "OPEN", process: { is: where } }, select: { id: true, processId: true, type: true, status: true, question: true, explanation: true, options: true, proposedOptionKey: true, selectedOptionKey: true, selectedValue: true, impact: true, createdAt: true, decidedAt: true, process: { select: { artifactRefs: { select: { artifactType: true, artifactId: true, label: true }, orderBy: { createdAt: "asc" }, take: 1 } } } }, orderBy: { createdAt: "asc" }, take: 10 });
  const exceptions = await db.operationalException.findMany({ where: { organizationId: scope.organizationId, status: "OPEN", process: { is: where } }, select: { id: true, processId: true, decisionId: true, type: true, severity: true, status: true, title: true, explanation: true, nextStep: true, dueAt: true, createdAt: true, resolvedAt: true, process: { select: { artifactRefs: { select: { artifactType: true, artifactId: true, label: true }, orderBy: { createdAt: "asc" }, take: 1 } } } }, orderBy: [{ severity: "desc" }, { createdAt: "asc" }], take: 10 });
  const activeProcesses = await db.operationalProcess.findMany({ where: { AND: [where, { status: { in: activeStatuses } }] }, select: summarySelect, orderBy: { updatedAt: "desc" }, take: 10 });
  const recentResults = await db.operationalProcess.findMany({ where: { AND: [where, { status: { in: ["COMPLETED", "COMPLETED_WITH_EXCEPTIONS"] } }] }, select: summarySelect, orderBy: { completedAt: "desc" }, take: 8 });
  const deadlines = await db.deadline.findMany({ where: deadlineWhere, select: { id: true, title: true, status: true, dueDate: true, createdAt: true, documentId: true, workerId: true, jobSiteId: true }, orderBy: [{ dueDate: "asc" }, { id: "asc" }], take: 10 });
  const shareProposals = canShare ? await db.documentPackageShareProposal.findMany({
    where: { organizationId: scope.organizationId, status: { in: ["PREPARING", "READY_FOR_REVIEW", "BLOCKED", "APPROVED"] } },
    select: { id: true, documentPackageId: true, processId: true, status: true, expiresAt: true, createdAt: true, documentPackage: { select: { title: true } }, revision: { select: { manifest: true } } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: 10,
  }) : [];
  const decisionCount = await db.operationalDecision.count({ where: { organizationId: scope.organizationId, status: "OPEN", process: { is: where } } });
  const exceptionCount = await db.operationalException.count({ where: { organizationId: scope.organizationId, status: "OPEN", process: { is: where } } });
  const blocked = await db.operationalProcess.count({ where: { AND: [where, { status: { in: ["BLOCKED", "WAITING_FOR_DECISION", "TECHNICAL_FAILURE"] } }] } });
  const running = await db.operationalProcess.count({ where: { AND: [where, { status: { in: ["RECEIVED", "READY", "RUNNING", "RETRY_SCHEDULED"] } }] } });
  const canDecide = ["OWNER", "COLLABORATOR"].includes(actorRole);
  const canManuallyResolve = ["OWNER", "COLLABORATOR"].includes(actorRole);
  const now = Date.now();
  const decisionItems: OperationalCenterItemDto[] = decisions.map((item) => ({
    id: item.id,
    kind: "DECISION",
    title: item.question,
    summary: item.explanation ?? "Conferma umana richiesta prima di continuare.",
    status: item.status,
    blocking: true,
    overdue: false,
    severity: null,
    dueAt: null,
    openedAt: item.createdAt.toISOString(),
    artifact: item.process.artifactRefs[0] ? toArtifactDto(item.process.artifactRefs[0]) : null,
    href: `/operations/${item.processId}`,
    timelineHref: `/operations/${item.processId}#timeline`,
    primaryActionLabel: canDecide ? "Decidi" : null,
    priorityReason: "Decisione richiesta",
  }));
  const exceptionItems: OperationalCenterItemDto[] = exceptions.map((item) => ({
    id: item.id,
    kind: "EXCEPTION",
    title: item.title,
    summary: item.nextStep,
    status: item.status,
    blocking: item.severity === "BLOCKING",
    overdue: Boolean(item.dueAt && item.dueAt.getTime() < now),
    severity: item.severity,
    dueAt: item.dueAt?.toISOString() ?? null,
    openedAt: item.createdAt.toISOString(),
    artifact: item.process.artifactRefs[0] ? toArtifactDto(item.process.artifactRefs[0]) : null,
    href: `/operations/${item.processId}`,
    timelineHref: `/operations/${item.processId}#timeline`,
    primaryActionLabel: canManuallyResolve && !item.decisionId && (MANUAL_EXCEPTION_TYPES as readonly string[]).includes(item.type) ? "Risolvi" : null,
    priorityReason: item.dueAt && item.dueAt.getTime() < now ? "Scaduto" : item.severity === "BLOCKING" ? "Bloccante" : "Da verificare",
  }));
  const processItems: OperationalCenterItemDto[] = activeProcesses.map((item) => ({
    id: item.id,
    kind: "PROCESS",
    title: getOperationalDefinition(item.type).title,
    summary: typeof jsonObject(item.resultSummary).summary === "string" ? String(jsonObject(item.resultSummary).summary) : "Processo operativo in corso.",
    status: item.status,
    blocking: ["BLOCKED", "WAITING_FOR_DECISION", "TECHNICAL_FAILURE"].includes(item.status),
    overdue: false,
    severity: null,
    dueAt: null,
    openedAt: item.createdAt.toISOString(),
    artifact: null,
    href: `/operations/${item.id}`,
    timelineHref: `/operations/${item.id}#timeline`,
    primaryActionLabel: "Apri",
    priorityReason: ["BLOCKED", "WAITING_FOR_DECISION", "TECHNICAL_FAILURE"].includes(item.status) ? "Processo bloccato" : "In corso",
  }));
  const deadlineItems: OperationalCenterItemDto[] = deadlines.map((item) => {
    const artifact = item.documentId
      ? toArtifactDto({ artifactType: "DOCUMENT", artifactId: item.documentId, label: item.title })
      : item.workerId
        ? toArtifactDto({ artifactType: "WORKER", artifactId: item.workerId, label: item.title })
        : item.jobSiteId
          ? toArtifactDto({ artifactType: "JOB_SITE", artifactId: item.jobSiteId, label: item.title })
          : toArtifactDto({ artifactType: "DEADLINE", artifactId: item.id, label: item.title });
    const overdue = item.dueDate.getTime() < now;
    return {
      id: item.id,
      kind: "DEADLINE" as const,
      title: item.title,
      summary: overdue ? "Scadenza superata." : "Scadenza operativa in avvicinamento.",
      status: item.status,
      blocking: overdue,
      overdue,
      severity: overdue ? "BLOCKING" as const : "ATTENTION" as const,
      dueAt: item.dueDate.toISOString(),
      openedAt: item.createdAt.toISOString(),
      artifact,
      href: `/deadlines/${item.id}`,
      timelineHref: `${artifact.href ?? `/deadlines/${item.id}`}#timeline`,
      primaryActionLabel: "Apri",
      priorityReason: overdue ? "Scaduto" : "In scadenza",
    };
  });
  const sharingItems: OperationalCenterItemDto[] = shareProposals.map((item) => {
    const manifest = jsonObject(item.revision.manifest);
    const issues = Array.isArray(manifest.issues) ? manifest.issues : [];
    const blockingIssues = issues.filter((entry) => jsonObject(entry as Prisma.JsonValue).severity === "BLOCKING").length;
    return {
      id: item.id,
      kind: "SHARING" as const,
      title: item.documentPackage.title,
      summary: blockingIssues ? `${blockingIssues} problemi bloccanti nella revisione.` : "Revisione pronta per il controllo umano.",
      status: item.status,
      blocking: item.status === "BLOCKED" || blockingIssues > 0,
      overdue: item.expiresAt.getTime() < now,
      severity: item.status === "BLOCKED" || blockingIssues > 0 ? "BLOCKING" as const : "ATTENTION" as const,
      dueAt: item.expiresAt.toISOString(),
      openedAt: item.createdAt.toISOString(),
      artifact: toArtifactDto({ artifactType: "DOCUMENT_PACKAGE", artifactId: item.documentPackageId, label: item.documentPackage.title }),
      href: `/document-packages/${item.documentPackageId}?proposal=${item.id}`,
      timelineHref: `/operations/${item.processId}#timeline`,
      primaryActionLabel: item.status === "READY_FOR_REVIEW" ? "Rivedi" : "Apri",
      priorityReason: item.status === "BLOCKED" ? "Condivisione bloccata" : "Condivisione da controllare",
    };
  });
  const resultItems: OperationalCenterItemDto[] = recentResults.map((item) => ({
    id: item.id,
    kind: "RESULT" as const,
    title: getOperationalDefinition(item.type).title,
    summary: typeof jsonObject(item.resultSummary).summary === "string" ? String(jsonObject(item.resultSummary).summary) : "Risultato operativo recente.",
    status: item.status,
    blocking: false,
    overdue: false,
    severity: null,
    dueAt: item.completedAt?.toISOString() ?? null,
    openedAt: item.createdAt.toISOString(),
    artifact: null,
    href: `/operations/${item.id}`,
    timelineHref: `/operations/${item.id}#timeline`,
    primaryActionLabel: "Apri",
    priorityReason: "Completato di recente",
  }));
  return {
    generatedAt: new Date().toISOString(),
    organization: {
      name: context.support?.organization.name ?? context.company?.organization.name ?? "Azienda",
      role: actorRole,
      roleLabel: roleLabels[actorRole],
      viewLabel: scope.fullAccess ? "Tutta l'azienda" : scope.preset === "SITE_MANAGER" ? "Cantieri assegnati" : "I miei dati",
    },
    counts: { decisions: decisionCount, exceptions: exceptionCount, blocked, running },
    decisions: decisions.map((item) => toDecisionDto(item, canDecide)),
    exceptions: exceptions.map((item) => toExceptionDto(item, canManuallyResolve)),
    activeProcesses: activeProcesses.map(toProcessSummary),
    recentResults: recentResults.map(toProcessSummary),
    workItems: [...decisionItems, ...exceptionItems, ...deadlineItems, ...sharingItems, ...processItems, ...resultItems].sort(compareCenterItems),
  };
}

const severityPriority: Record<string, number> = { BLOCKING: 0, WARNING: 1, ATTENTION: 2, INFO: 3 };

function centerSortTuple(item: OperationalCenterItemDto) {
  return [
    item.blocking ? 0 : 1,
    item.overdue ? 0 : 1,
    item.kind === "DECISION" ? 0 : 1,
    item.dueAt ?? "9999-12-31T23:59:59.999Z",
    severityPriority[item.severity ?? "INFO"] ?? 3,
    item.openedAt,
    item.kind,
    item.id,
  ] as const;
}

function compareCenterItems(a: OperationalCenterItemDto, b: OperationalCenterItemDto) {
  const left = centerSortTuple(a);
  const right = centerSortTuple(b);
  for (let index = 0; index < left.length; index += 1) {
    const comparison = String(left[index]).localeCompare(String(right[index]));
    if (comparison) return comparison;
  }
  return 0;
}

function centerViewMatches(item: OperationalCenterItemDto, filters: OperationalCenterFilters) {
  if (filters.view === "TO_DECIDE" && item.kind !== "DECISION") return false;
  if (filters.view === "TO_VERIFY" && !(item.kind === "EXCEPTION" || item.status === "TO_REVIEW")) return false;
  if (filters.view === "OVERDUE" && !item.overdue) return false;
  if (filters.view === "EXPIRING" && (!item.dueAt || item.overdue)) return false;
  if (filters.view === "BLOCKED" && !item.blocking) return false;
  if (filters.view === "IN_PROGRESS" && item.kind !== "PROCESS") return false;
  if (filters.view === "RECENTLY_COMPLETED" && item.kind !== "RESULT") return false;
  if (filters.view === "SHARING" && item.kind !== "SHARING") return false;
  if (filters.artifactType && item.artifact?.type !== filters.artifactType) return false;
  if (filters.status && item.status !== filters.status) return false;
  if (filters.from && item.openedAt < filters.from) return false;
  if (filters.to && item.openedAt > filters.to) return false;
  if (filters.workerId && !(item.artifact?.type === "WORKER" && item.artifact.id === filters.workerId)) return false;
  if (filters.jobSiteId && !(item.artifact?.type === "JOB_SITE" && item.artifact.id === filters.jobSiteId)) return false;
  return true;
}

function validateCenterFilters(filters: OperationalCenterFilters) {
  const views = ["ALL", "TO_DECIDE", "TO_VERIFY", "OVERDUE", "EXPIRING", "BLOCKED", "IN_PROGRESS", "RECENTLY_COMPLETED", "SHARING"];
  if (filters.view && !views.includes(filters.view)) throw new AccessError("Vista inbox non valida.", 400);
  if (filters.artifactType && !(operationalArtifactTypes as readonly string[]).includes(filters.artifactType)) throw new AccessError("Filtro artifact non valido.", 400);
  for (const value of [filters.workerId, filters.jobSiteId, filters.status]) {
    if (value !== undefined && (typeof value !== "string" || !value.trim() || value.length > 200)) throw new AccessError("Filtro inbox non valido.", 400);
  }
  for (const value of [filters.from, filters.to]) {
    if (value !== undefined && (typeof value !== "string" || Number.isNaN(Date.parse(value)))) throw new AccessError("Intervallo inbox non valido.", 400);
  }
}

function compareCenterTuples(left: readonly unknown[], right: readonly unknown[]) {
  for (let index = 0; index < left.length; index += 1) {
    const comparison = String(left[index]).localeCompare(String(right[index]));
    if (comparison) return comparison;
  }
  return 0;
}

export function paginateOperationalCenter(center: OperationalCenterResponse, input: { filters?: OperationalCenterFilters; cursor?: unknown; take?: unknown } = {}): OperationalCenterPage {
  const take = parseTake(input.take);
  const filters = input.filters ?? {};
  validateCenterFilters(filters);
  let items = center.workItems.filter((item) => centerViewMatches(item, filters));
  if (input.cursor) {
    if (typeof input.cursor !== "string" || input.cursor.length > 1000) throw new AccessError("Cursor inbox non valido.", 400);
    try {
      const tuple = JSON.parse(Buffer.from(input.cursor, "base64url").toString("utf8")) as unknown;
      if (!Array.isArray(tuple) || tuple.length !== 8) throw new Error("invalid");
      items = items.filter((item) => compareCenterTuples(centerSortTuple(item), tuple) > 0);
    } catch {
      throw new AccessError("Cursor inbox non valido.", 400);
    }
  }
  const page = items.slice(0, take);
  const last = page.at(-1);
  return {
    generatedAt: center.generatedAt,
    items: page,
    nextCursor: items.length > take && last ? Buffer.from(JSON.stringify(centerSortTuple(last)), "utf8").toString("base64url") : null,
  };
}

export async function getOperationalInbox(input: { filters?: OperationalCenterFilters; cursor?: unknown; take?: unknown } = {}): Promise<OperationalCenterPage> {
  return paginateOperationalCenter(await getOperationalCenter(), input);
}

function validateReason(value: unknown, required: boolean) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new AccessError("Motivazione richiesta.", 400);
    return null;
  }
  if (typeof value !== "string") throw new AccessError("Motivazione non valida.", 400);
  const trimmed = value.trim();
  if ((required && trimmed.length < 3) || trimmed.length > 1000) throw new AccessError("Motivazione non valida.", 400);
  return trimmed || null;
}

function requiredPermissionForArtifacts(artifacts: Array<{ artifactType: string }>): OrganizationPermission {
  if (artifacts.some((item) => item.artifactType === "DOCUMENT" || item.artifactType === "DOCUMENT_VERSION")) return "documents:update";
  if (artifacts.some((item) => item.artifactType === "WORKER")) return "workers:update";
  if (artifacts.some((item) => item.artifactType === "JOB_SITE")) return "jobSites:update";
  if (artifacts.some((item) => item.artifactType === "DEADLINE")) return "deadlines:manage";
  if (artifacts.some((item) => item.artifactType === "CHECKLIST")) return "checklists:manage";
  if (artifacts.some((item) => item.artifactType === "EVIDENCE")) return "evidence:upload";
  if (artifacts.some((item) => item.artifactType === "DOCUMENT_PACKAGE")) return "documentPackages:create";
  return "organization:update";
}

async function mutationContextForProcess(processId: string) {
  const visible = await findVisibleProcess(processId);
  requirePermission(visible.scope.context, requiredPermissionForArtifacts(visible.process.artifactRefs));
  return visible;
}

export async function resolveOperationalDecision(decisionId: string, input: ResolveOperationalDecisionInput) {
  if (!input || typeof input !== "object" || !["SELECT_OPTION", "CONFIRM_DATE"].includes(input.kind) || typeof input.optionKey !== "string" || !input.optionKey.trim()) throw new AccessError("Risposta decisione non valida.", 400);
  const decision = await db.operationalDecision.findFirst({ where: { id: decisionId, status: "OPEN" }, select: { id: true, processId: true, stepId: true, type: true, options: true } });
  if (!decision) throw new AccessError("Decisione operativa non trovata.", 404);
  if (!decision.stepId) throw new AccessError("Decisione senza step operativo associato.", 409);
  const stepId = decision.stepId;
  const { scope } = await mutationContextForProcess(decision.processId);
  const optionKey = input.optionKey.trim();
  if (!decisionOptions(decision.options).some((option) => option.key === optionKey)) throw new AccessError("Opzione decisione non valida.", 400);
  const reason = validateReason(input.reason, false);
  let selectedValue: string | null = null;
  if (decision.type === "CONFIRM_EXPIRY_DATE") {
    if (input.kind !== "CONFIRM_DATE" || typeof input.value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.value) || Number.isNaN(new Date(`${input.value}T00:00:00.000Z`).getTime())) throw new AccessError("Data confermata non valida.", 400);
    selectedValue = input.value;
  } else if (input.kind !== "SELECT_OPTION") {
    throw new AccessError("Valore aggiuntivo non consentito.", 400);
  }
  await db.$transaction(async (tx) => {
    const resolved = await tx.operationalDecision.updateMany({
      where: { id: decision.id, processId: decision.processId, organizationId: scope.organizationId, status: "OPEN" },
      data: { status: "RESOLVED", activeDedupeKey: null, selectedOptionKey: optionKey, selectedValue, reason, decidedById: scope.context.userId, decidedAt: new Date() },
    });
    if (!resolved.count) throw new AccessError("Decisione gia risolta.", 409);
    await tx.operationalStep.updateMany({ where: { id: stepId, processId: decision.processId, status: "BLOCKED" }, data: { status: "READY", nextAttemptAt: new Date(), lastErrorCode: null } });
    await tx.operationalProcess.updateMany({ where: { id: decision.processId, organizationId: scope.organizationId, status: "WAITING_FOR_DECISION" }, data: { status: "READY", blockedAt: null } });
    await tx.operationalEvent.create({ data: { organizationId: scope.organizationId, processId: decision.processId, stepId, eventKey: `decision-resolved:${decision.id}`, kind: "DECISION", eventType: "DECISION_RESOLVED", title: "Decisione registrata", summary: "Il processo puo riprendere con la risposta confermata.", actorUserId: scope.context.userId, actorType: scope.context.support ? "SUPPORT" : "USER", actorRole: scope.actorRole, sourceType: "USER_ACTION", sourceId: decision.id, metadata: { reason, nextState: "READY" }, reliability: "VERIFIED", impact: "CONTROLLED" } });
    await tx.productAuditEvent.create({ data: { organizationId: scope.organizationId, ...auditActorFromContext(scope.context, scope.actorRole), action: "OPERATIONAL_DECISION_RESOLVED", entityType: "OPERATIONAL_DECISION", entityId: decision.id, outcome: "SUCCESS", metadata: { processId: decision.processId, decisionType: decision.type } } });
  });
  return { resolved: true as const, processId: decision.processId };
}

export async function resolveOperationalException(exceptionId: string, input: ResolveOperationalExceptionInput) {
  if (input?.kind !== "MANUAL_EXCEPTION_RESOLUTION") throw new AccessError("Risoluzione eccezione non valida.", 400);
  const reason = validateReason(input?.reason, true);
  const exception = await db.operationalException.findFirst({ where: { id: exceptionId, status: "OPEN" }, select: { id: true, processId: true, type: true, decisionId: true } });
  if (!exception) throw new AccessError("Eccezione operativa non trovata.", 404);
  if (exception.decisionId || !(MANUAL_EXCEPTION_TYPES as readonly string[]).includes(exception.type)) throw new AccessError("Questa eccezione viene chiusa solo da una condizione oggettiva o dalla decisione collegata.", 409);
  const { scope } = await mutationContextForProcess(exception.processId);
  await db.$transaction(async (tx) => {
    const result = await tx.operationalException.updateMany({ where: { id: exception.id, organizationId: scope.organizationId, status: "OPEN" }, data: { status: "RESOLVED", activeDedupeKey: null, resolutionReason: reason, resolvedById: scope.context.userId, resolvedAt: new Date() } });
    if (!result.count) throw new AccessError("Eccezione gia risolta.", 409);
    await tx.operationalEvent.create({ data: { organizationId: scope.organizationId, processId: exception.processId, eventKey: `exception-manually-resolved:${exception.id}`, kind: "RECONCILIATION", eventType: "EXCEPTION_RESOLVED", title: "Eccezione risolta", summary: "La risoluzione manuale consentita e stata motivata e registrata.", actorUserId: scope.context.userId, actorType: scope.context.support ? "SUPPORT" : "USER", actorRole: scope.actorRole, sourceType: "USER_ACTION", sourceId: exception.id, metadata: { reason, nextState: "RESOLVED" }, reliability: "VERIFIED", impact: "CONTROLLED" } });
    await tx.productAuditEvent.create({ data: { organizationId: scope.organizationId, ...auditActorFromContext(scope.context, scope.actorRole), action: "OPERATIONAL_EXCEPTION_RESOLVED", entityType: "OPERATIONAL_EXCEPTION", entityId: exception.id, outcome: "SUCCESS", metadata: { processId: exception.processId, exceptionType: exception.type } } });
  });
  return { resolved: true as const, processId: exception.processId };
}

export async function retryOperationalStep(stepId: string, input: RetryOperationalStepInput) {
  if (input?.kind !== "RETRY_TECHNICAL_STEP") throw new AccessError("Richiesta retry non valida.", 400);
  const step = await db.operationalStep.findFirst({ where: { id: stepId }, select: { id: true, processId: true, status: true } });
  if (!step) throw new AccessError("Step operativo non trovato.", 404);
  const { scope } = await mutationContextForProcess(step.processId);
  if (step.status !== "TECHNICAL_FAILURE") throw new AccessError("Lo step non e disponibile per un retry manuale.", 409);
  await db.$transaction(async (tx) => {
    const updated = await tx.operationalStep.updateMany({ where: { id: step.id, processId: step.processId, organizationId: scope.organizationId, status: "TECHNICAL_FAILURE" }, data: { status: "READY", nextAttemptAt: new Date(), lastErrorCode: null, claimToken: null, claimedAt: null, leaseExpiresAt: null } });
    if (!updated.count) throw new AccessError("Retry non disponibile.", 409);
    await tx.operationalProcess.updateMany({ where: { id: step.processId, organizationId: scope.organizationId, status: "TECHNICAL_FAILURE" }, data: { status: "READY", blockedAt: null } });
    await tx.operationalException.updateMany({ where: { processId: step.processId, stepId: step.id, status: "OPEN", type: "PERSISTENT_TECHNICAL_ERROR" }, data: { status: "RESOLVED", activeDedupeKey: null, resolutionReason: "Retry manuale autorizzato.", resolvedById: scope.context.userId, resolvedAt: new Date() } });
    await tx.operationalEvent.create({ data: { organizationId: scope.organizationId, processId: step.processId, stepId: step.id, eventKey: `manual-retry:${step.id}:${Date.now()}`, kind: "RETRY", eventType: "RETRY_SCHEDULED", title: "Retry autorizzato", summary: "Lo step tecnico e stato rimesso in coda.", actorUserId: scope.context.userId, actorType: scope.context.support ? "SUPPORT" : "USER", actorRole: scope.actorRole, sourceType: "USER_ACTION", sourceId: step.id, metadata: { nextState: "READY" }, reliability: "VERIFIED", impact: "LOW" } });
    await tx.productAuditEvent.create({ data: { organizationId: scope.organizationId, ...auditActorFromContext(scope.context, scope.actorRole), action: "OPERATIONAL_RETRY_SCHEDULED", entityType: "OPERATIONAL_STEP", entityId: step.id, outcome: "SUCCESS", metadata: { processId: step.processId } } });
  });
  return { retried: true as const, processId: step.processId };
}
