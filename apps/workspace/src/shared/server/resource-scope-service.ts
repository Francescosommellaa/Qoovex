import "server-only";

import { db } from "@qoovex/db";
import type { MyResourceScopeResponse, OrganizationAccessPreset, OrganizationRole, RecordStatus, WorkspaceAccessContext } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";

export interface ResourceScope {
  context: WorkspaceAccessContext;
  organizationId: string;
  actorRole: OrganizationRole;
  preset: OrganizationAccessPreset | null;
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
  return role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT";
}

async function getScopeUserId(context: WorkspaceAccessContext, organizationId: string, preset: OrganizationAccessPreset | null) {
  if (!(preset === "SITE_MANAGER" || preset === "LIMITED_UPLOAD")) return context.userId;
  if (context.platformRole !== "SUPER_ADMIN") return context.userId;
  const { isCurrentDevAuthIdentity } = await import("./dev-auth");
  if (!(await isCurrentDevAuthIdentity(context.userId))) return context.userId;
  const legacyRole = preset === "SITE_MANAGER" ? "SITE_MANAGER" : "WORKER";
  const scopedMembership = await db.organizationMembership.findFirst({
    where: { organizationId, role: legacyRole, revokedAt: null, user: { suspendedAt: null } },
    select: { userId: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  return scopedMembership?.userId ?? context.userId;
}

export async function getResourceScope(context?: WorkspaceAccessContext): Promise<ResourceScope> {
  if (!context) {
    const { getWorkspaceAccessContext } = await import("./access-context-service");
    context = await getWorkspaceAccessContext();
  }
  const actorRole: OrganizationRole | null = context.support ? "OWNER" : context.company?.role ?? null;
  if (!actorRole) throw new AccessError("Risorsa non disponibile.", 404);
  const organizationId = context.support?.organization.id ?? context.company?.organization.id;
  if (!organizationId) throw new AccessError("Nessuna azienda configurata.", 403);
  const preset = context.support ? null : context.company?.preset ?? (actorRole === "SITE_MANAGER" ? "SITE_MANAGER" : actorRole === "WORKER" ? "LIMITED_UPLOAD" : null);
  const fullAccess = Boolean(context.support) || (context.company?.scopeMode === undefined ? isFullResourceScopeRole(actorRole) : context.company.scopeMode === "FULL");
  const scopeUserId = await getScopeUserId(context, organizationId, preset);

  const membership = context.support || context.company?.scopeMode === undefined ? null : await db.organizationMembership.findFirst({
    where: { userId: scopeUserId, revokedAt: null },
    select: { id: true, resourceGrants: { select: { resourceType: true, resourceId: true } } },
  });
  const grantedJobSiteIds = membership?.resourceGrants?.filter((grant) => grant.resourceType === "JOB_SITE").map((grant) => grant.resourceId) ?? [];
  const grantedWorkerIds = membership?.resourceGrants?.filter((grant) => grant.resourceType === "WORKER").map((grant) => grant.resourceId) ?? [];

  let linkedWorker: ResourceScope["linkedWorker"] = null;
  let siteManagerJobSiteIds: string[] = [];
  let workerJobSiteIds: string[] = [];

  if (preset === "SITE_MANAGER") {
    const assignments = await db.jobSiteUserAssignment.findMany({
      where: {
        organizationId,
        userId: scopeUserId,
        assignmentRole: "SITE_MANAGER",
        archivedAt: null,
        jobSite: { archivedAt: null },
      },
      select: { jobSiteId: true },
    });
    siteManagerJobSiteIds = uniqueIds([...grantedJobSiteIds, ...assignments.map((assignment) => assignment.jobSiteId)]);
  }

  if (preset === "LIMITED_UPLOAD") {
    const link = await db.workerUserLink.findFirst({
      where: { organizationId, userId: scopeUserId, archivedAt: null, worker: { archivedAt: null } },
      select: { worker: { select: { id: true, displayName: true, roleLabel: true, status: true } } },
      orderBy: { createdAt: "desc" },
    });
    linkedWorker = link?.worker ?? (grantedWorkerIds[0] ? await db.worker.findFirst({ where: { id: grantedWorkerIds[0], organizationId, archivedAt: null }, select: { id: true, displayName: true, roleLabel: true, status: true } }) : null);
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

  return {
    context,
    organizationId,
    actorRole,
    preset,
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
  if (scope.preset === "LIMITED_UPLOAD") return scope.linkedWorker?.id === workerId;
  return scope.preset === "SITE_MANAGER" && scope.siteManagerJobSiteIds.length > 0;
}

export function canReadSiteManagerWorker(scope: ResourceScope, workerJobSiteIds: string[]) {
  return scope.preset === "SITE_MANAGER" && workerJobSiteIds.some((jobSiteId) => scope.siteManagerJobSiteIds.includes(jobSiteId));
}

export function canReadDocument(scope: ResourceScope, document: { ownerType: string; workerId: string | null; jobSiteId: string | null }) {
  if (scope.fullAccess) return true;
  if (scope.preset === "SITE_MANAGER") return document.ownerType === "JOB_SITE" && !!document.jobSiteId && scope.siteManagerJobSiteIds.includes(document.jobSiteId);
  if (scope.preset === "LIMITED_UPLOAD") return document.ownerType === "WORKER" && !!document.workerId && scope.linkedWorker?.id === document.workerId;
  return false;
}

export function canReadDeadline(scope: ResourceScope, deadline: { workerId: string | null; jobSiteId: string | null; document?: { ownerType: string; workerId: string | null; jobSiteId: string | null } | null }) {
  if (scope.fullAccess) return true;
  if (scope.preset === "SITE_MANAGER") return !!deadline.jobSiteId && scope.siteManagerJobSiteIds.includes(deadline.jobSiteId);
  if (scope.preset === "LIMITED_UPLOAD") {
    if (deadline.workerId && deadline.workerId === scope.linkedWorker?.id) return true;
    return Boolean(deadline.document && canReadDocument(scope, deadline.document));
  }
  return false;
}

export function canReadEvidence(scope: ResourceScope, evidence: { workerId: string | null; jobSiteId: string | null; checklistItem?: { checklist: { jobSiteId: string | null } } | null }) {
  if (scope.fullAccess) return true;
  const checklistJobSiteId = evidence.checklistItem?.checklist.jobSiteId ?? null;
  if (scope.preset === "SITE_MANAGER") {
    const jobSiteId = evidence.jobSiteId ?? checklistJobSiteId;
    return !!jobSiteId && scope.siteManagerJobSiteIds.includes(jobSiteId);
  }
  if (scope.preset === "LIMITED_UPLOAD") {
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
