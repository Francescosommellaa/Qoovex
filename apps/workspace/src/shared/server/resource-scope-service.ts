import "server-only";

import { db } from "@qoovex/db";
import type { MyResourceScopeResponse, OrganizationRole, RecordStatus, ViewerContext } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";

const FULL_RESOURCE_SCOPE_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] as const;
const SCOPED_RESOURCE_ROLES = ["SITE_MANAGER", "WORKER"] as const;

export interface ResourceScope {
  context: ViewerContext;
  organizationId: string;
  actorRole: OrganizationRole;
  fullAccess: boolean;
  linkedWorker: {
    id: string;
    displayName: string;
    roleLabel: string | null;
    status: RecordStatus;
  } | null;
  siteManagerJobSiteIds: string[];
  workerJobSiteIds: string[];
  visibleJobSiteIds: string[];
}

function uniqueIds(ids: string[]) {
  return [...new Set(ids)];
}

export function isFullResourceScopeRole(role: OrganizationRole) {
  return (FULL_RESOURCE_SCOPE_ROLES as readonly OrganizationRole[]).includes(role);
}

export async function getResourceScope(context?: ViewerContext): Promise<ResourceScope> {
  if (!context) {
    const { getViewerContext } = await import("./access-context-service");
    context = await getViewerContext();
  }
  const actorRole: OrganizationRole | null = context.support ? "OWNER" : context.membership?.role ?? null;
  if (!actorRole) throw new AccessError("Risorsa non disponibile.", 404);
  const organizationId = context.support?.organization.id ?? context.membership?.organization.id;
  if (!organizationId) throw new AccessError("Nessuna azienda attiva.", 403);
  const fullAccess = isFullResourceScopeRole(actorRole);

  let linkedWorker: ResourceScope["linkedWorker"] = null;
  let siteManagerJobSiteIds: string[] = [];
  let workerJobSiteIds: string[] = [];

  if (actorRole === "SITE_MANAGER") {
    const assignments = await db.jobSiteUserAssignment.findMany({
      where: {
        organizationId,
        userId: context.userId,
        assignmentRole: "SITE_MANAGER",
        archivedAt: null,
        jobSite: { archivedAt: null },
      },
      select: { jobSiteId: true },
    });
    siteManagerJobSiteIds = assignments.map((assignment) => assignment.jobSiteId);
  }

  if (actorRole === "WORKER") {
    const link = await db.workerUserLink.findFirst({
      where: { organizationId, userId: context.userId, archivedAt: null, worker: { archivedAt: null } },
      select: { worker: { select: { id: true, displayName: true, roleLabel: true, status: true } } },
      orderBy: { createdAt: "desc" },
    });
    linkedWorker = link?.worker ?? null;
    if (linkedWorker) {
      const assignments = await db.jobSiteWorkerAssignment.findMany({
        where: {
          organizationId,
          workerId: linkedWorker.id,
          archivedAt: null,
          jobSite: { archivedAt: null },
        },
        select: { jobSiteId: true },
      });
      workerJobSiteIds = assignments.map((assignment) => assignment.jobSiteId);
    }
  }

  if (!fullAccess && !(SCOPED_RESOURCE_ROLES as readonly OrganizationRole[]).includes(actorRole)) {
    throw new AccessError("Risorsa non disponibile.", 404);
  }

  return {
    context,
    organizationId,
    actorRole,
    fullAccess,
    linkedWorker,
    siteManagerJobSiteIds: uniqueIds(siteManagerJobSiteIds),
    workerJobSiteIds: uniqueIds(workerJobSiteIds),
    visibleJobSiteIds: uniqueIds([...siteManagerJobSiteIds, ...workerJobSiteIds]),
  };
}

export function requireAssignedJobSite(scope: ResourceScope, jobSiteId: string | null | undefined) {
  if (scope.fullAccess) return;
  if (!jobSiteId || !scope.visibleJobSiteIds.includes(jobSiteId)) throw new AccessError("Risorsa non disponibile.", 404);
}

export function requireLinkedWorker(scope: ResourceScope, workerId: string | null | undefined) {
  if (scope.fullAccess) return;
  if (!workerId || scope.linkedWorker?.id !== workerId) throw new AccessError("Risorsa non disponibile.", 404);
}

export function canReadJobSite(scope: ResourceScope, jobSiteId: string) {
  return scope.fullAccess || scope.visibleJobSiteIds.includes(jobSiteId);
}

export function canReadWorker(scope: ResourceScope, workerId: string) {
  if (scope.fullAccess) return true;
  if (scope.actorRole === "WORKER") return scope.linkedWorker?.id === workerId;
  return false;
}

export function canReadSiteManagerWorker(scope: ResourceScope, workerJobSiteIds: string[]) {
  return scope.actorRole === "SITE_MANAGER" && workerJobSiteIds.some((jobSiteId) => scope.siteManagerJobSiteIds.includes(jobSiteId));
}

export function canReadDocument(scope: ResourceScope, document: { ownerType: string; workerId: string | null; jobSiteId: string | null }) {
  if (scope.fullAccess) return true;
  if (scope.actorRole === "SITE_MANAGER") return document.ownerType === "JOB_SITE" && !!document.jobSiteId && scope.siteManagerJobSiteIds.includes(document.jobSiteId);
  if (scope.actorRole === "WORKER") return document.ownerType === "WORKER" && !!document.workerId && scope.linkedWorker?.id === document.workerId;
  return false;
}

export function canReadDeadline(scope: ResourceScope, deadline: { workerId: string | null; jobSiteId: string | null; document?: { ownerType: string; workerId: string | null; jobSiteId: string | null } | null }) {
  if (scope.fullAccess) return true;
  if (scope.actorRole === "SITE_MANAGER") return !!deadline.jobSiteId && scope.siteManagerJobSiteIds.includes(deadline.jobSiteId);
  if (scope.actorRole === "WORKER") {
    if (deadline.workerId && deadline.workerId === scope.linkedWorker?.id) return true;
    return Boolean(deadline.document && canReadDocument(scope, deadline.document));
  }
  return false;
}

export function canReadEvidence(scope: ResourceScope, evidence: { workerId: string | null; jobSiteId: string | null; checklistItem?: { checklist: { jobSiteId: string | null } } | null }) {
  if (scope.fullAccess) return true;
  const checklistJobSiteId = evidence.checklistItem?.checklist.jobSiteId ?? null;
  if (scope.actorRole === "SITE_MANAGER") {
    const jobSiteId = evidence.jobSiteId ?? checklistJobSiteId;
    return !!jobSiteId && scope.siteManagerJobSiteIds.includes(jobSiteId);
  }
  if (scope.actorRole === "WORKER") {
    if (evidence.workerId && evidence.workerId === scope.linkedWorker?.id) return true;
    const jobSiteId = evidence.jobSiteId ?? checklistJobSiteId;
    return !!jobSiteId && scope.workerJobSiteIds.includes(jobSiteId);
  }
  return false;
}

export async function toMyResourceScopeResponse(scope: ResourceScope): Promise<MyResourceScopeResponse> {
  const jobSites = scope.visibleJobSiteIds.length
    ? await db.jobSite.findMany({
      where: { organizationId: scope.organizationId, id: { in: scope.visibleJobSiteIds }, archivedAt: null },
      select: { id: true, name: true, status: true },
      orderBy: [{ name: "asc" }],
    })
    : [];

  return {
    role: scope.actorRole,
    worker: scope.linkedWorker,
    jobSites,
    generatedAt: new Date().toISOString(),
  };
}
