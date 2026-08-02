import type {
  DashboardHandledResult,
  DashboardIntervention,
  OperationalArtifactReferenceDto,
  OperationalDecisionType,
  OperationalEventSourceType,
  OperationalEventType,
  OrganizationPermission,
} from "@qoovex/types";

export const dashboardHandledEventTypes = [
  "AUTOMATION_COMPLETED",
  "DOCUMENT_LINKED",
  "DOCUMENT_VERSION_ADDED",
  "REQUIREMENT_SATISFIED",
  "RESULT_CREATED",
  "PACKAGE_PREPARED",
  "PROCESS_COMPLETED",
  "PROCESS_COMPLETED_WITH_EXCEPTIONS",
  "EVIDENCE_RECORDED",
  "DOCUMENT_LINKED_TO_JOB_SITE",
  "DOCUMENT_VERSION_REVIEWED",
] as const satisfies readonly OperationalEventType[];

const handledEventTypeSet = new Set<OperationalEventType>(dashboardHandledEventTypes);

export function requiredDashboardPermission(
  artifacts: Array<{ artifactType: string }>,
): OrganizationPermission {
  if (artifacts.some((item) => item.artifactType === "DOCUMENT" || item.artifactType === "DOCUMENT_VERSION")) return "documents:update";
  if (artifacts.some((item) => item.artifactType === "WORKER")) return "workers:update";
  if (artifacts.some((item) => item.artifactType === "JOB_SITE")) return "jobSites:update";
  if (artifacts.some((item) => item.artifactType === "DEADLINE")) return "deadlines:manage";
  if (artifacts.some((item) => item.artifactType === "CHECKLIST")) return "checklists:manage";
  if (artifacts.some((item) => item.artifactType === "EVIDENCE")) return "evidence:upload";
  if (artifacts.some((item) => item.artifactType === "DOCUMENT_PACKAGE")) return "documentPackages:create";
  return "organization:update";
}

export function requiredDashboardDecisionPermission(
  type: OperationalDecisionType,
  artifacts: Array<{ artifactType: string }>,
): OrganizationPermission {
  return type === "APPROVE_DOCUMENT_PACKAGE_SHARE"
    ? "documentPackages:share"
    : requiredDashboardPermission(artifacts);
}

export function canPerformDashboardAction(
  permissions: readonly OrganizationPermission[],
  permission: OrganizationPermission,
  supportSession: boolean,
) {
  return !supportSession && permissions.includes(permission);
}

function interventionKey(item: DashboardIntervention) {
  const context = item.context ? `${item.context.type}:${item.context.id}` : "PROCESS";
  return `${item.processId}:${context}`;
}

function interventionPriority(item: DashboardIntervention) {
  if (item.blocking) return 0;
  if (item.overdue) return 1;
  if (item.kind === "DECISION") return 2;
  if (item.kind === "EXCEPTION" && item.severity === "BLOCKING") return 3;
  if (item.kind === "SHARING") return 4;
  return 5;
}

export function deduplicateAndSortDashboardInterventions(items: DashboardIntervention[]) {
  const sorted = [...items].sort((left, right) => {
    const priority = interventionPriority(left) - interventionPriority(right);
    if (priority) return priority;
    const openedAt = left.openedAt.localeCompare(right.openedAt);
    if (openedAt) return openedAt;
    const kind = left.kind.localeCompare(right.kind);
    return kind || left.id.localeCompare(right.id);
  });
  const seen = new Set<string>();
  return sorted.filter((item) => {
    const key = interventionKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function isDashboardHandledEvent(value: {
  eventType: OperationalEventType;
  actorType: string;
  sourceType: OperationalEventSourceType;
}) {
  return value.actorType === "SYSTEM"
    && value.sourceType !== "USER_ACTION"
    && value.sourceType !== "SHARING_ACCESS"
    && handledEventTypeSet.has(value.eventType);
}

function handledResultKey(item: DashboardHandledResult) {
  const context = item.context ? `${item.context.type}:${item.context.id}` : "PROCESS";
  return `${item.processId}:${context}`;
}

export function selectDashboardHandledResults(
  eventResults: DashboardHandledResult[],
  completedProcessResults: DashboardHandledResult[],
  limit = 5,
) {
  const seen = new Set<string>();
  const deduplicated = [...eventResults, ...completedProcessResults].filter((item) => {
    const key = handledResultKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return deduplicated.sort((left, right) => {
    const occurredAt = right.occurredAt.localeCompare(left.occurredAt);
    if (occurredAt) return occurredAt;
    const source = Number(left.source !== "OPERATIONAL_EVENT") - Number(right.source !== "OPERATIONAL_EVENT");
    return source || left.id.localeCompare(right.id);
  }).slice(0, limit);
}

export function dashboardContext(
  artifact: { artifactType: OperationalArtifactReferenceDto["type"]; artifactId: string; label: string | null } | undefined,
  hrefForArtifact: (type: string, id: string) => string | null,
): OperationalArtifactReferenceDto | null {
  return artifact
    ? { type: artifact.artifactType, id: artifact.artifactId, label: artifact.label, href: hrefForArtifact(artifact.artifactType, artifact.artifactId) }
    : null;
}
