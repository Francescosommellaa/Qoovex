import "server-only";

import { db } from "@qoovex/db";
import type { MyResourceScopeResponse, OrganizationAccessPreset, OrganizationResourceType, OrganizationRole, RecordStatus, WorkspaceAccessContext } from "@qoovex/types";
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
  grantedResourceIds: Partial<Record<OrganizationResourceType, string[]>>;
}

function uniqueIds(ids: string[]) {
  return [...new Set(ids)];
}

export function isFullResourceScopeRole(role: OrganizationRole) {
  return role === "OWNER";
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
  const preset = context.support ? null : context.company?.preset ?? null;
  const fullAccess = Boolean(context.support) || (context.company?.scopeMode === undefined ? isFullResourceScopeRole(actorRole) : context.company.scopeMode === "FULL");
  const scopeUserId = context.userId;

  const membership = fullAccess ? null : await db.organizationMembership.findFirst({
    where: { organizationId, userId: scopeUserId, revokedAt: null },
    select: { id: true, resourceGrants: { select: { resourceType: true, resourceId: true } } },
  });
  const grantedJobSiteIds = membership?.resourceGrants?.filter((grant) => grant.resourceType === "JOB_SITE").map((grant) => grant.resourceId) ?? [];
  const grantedWorkerIds = membership?.resourceGrants?.filter((grant) => grant.resourceType === "WORKER").map((grant) => grant.resourceId) ?? [];
  const grantedResourceIds = (membership?.resourceGrants ?? []).reduce<Partial<Record<OrganizationResourceType, string[]>>>((result, grant) => {
    result[grant.resourceType] = [...(result[grant.resourceType] ?? []), grant.resourceId];
    return result;
  }, {});

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
    visibleJobSiteIds: uniqueIds([...grantedJobSiteIds, ...siteManagerJobSiteIds, ...workerJobSiteIds]),
    grantedResourceIds,
  };
}

export function hasResourceGrant(scope: ResourceScope, resourceType: OrganizationResourceType, resourceId: string | null | undefined) {
  return Boolean(resourceId && scope.grantedResourceIds[resourceType]?.includes(resourceId));
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
  return scope.fullAccess || hasResourceGrant(scope, "JOB_SITE", jobSiteId) || scope.visibleJobSiteIds.includes(jobSiteId);
}

export function canReadWorker(scope: ResourceScope, workerId: string) {
  if (scope.fullAccess) return true;
  if (hasResourceGrant(scope, "WORKER", workerId)) return true;
  if (scope.preset === "LIMITED_UPLOAD") return scope.linkedWorker?.id === workerId;
  return scope.preset === "SITE_MANAGER" && scope.siteManagerJobSiteIds.length > 0;
}

export function canReadSiteManagerWorker(scope: ResourceScope, workerJobSiteIds: string[]) {
  return scope.preset === "SITE_MANAGER" && workerJobSiteIds.some((jobSiteId) => scope.siteManagerJobSiteIds.includes(jobSiteId));
}

export function canReadDocument(scope: ResourceScope, document: { id?: string; documentTypeId?: string | null; ownerType: string; workerId: string | null; jobSiteId: string | null }) {
  if (scope.fullAccess) return true;
  if (hasResourceGrant(scope, "DOCUMENT", document.id) || hasResourceGrant(scope, "DOCUMENT_TYPE", document.documentTypeId)) return true;
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

export function canReadEvidence(scope: ResourceScope, evidence: { id?: string; workerId: string | null; jobSiteId: string | null; checklistItem?: { checklist: { jobSiteId: string | null } } | null }) {
  if (scope.fullAccess) return true;
  if (hasResourceGrant(scope, "EVIDENCE", evidence.id)) return true;
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
