import "server-only";

import { db } from "@qoovex/db";
import type { OperationalArtifactType, OrganizationPermission } from "@qoovex/types";
import { getWorkspaceAccessContext } from "@shared/server/access-context-service";
import { getResourceScope } from "@shared/server/resource-scope-service";
import { dryRunOperationalAction, readOperationalIntelligenceRuntimeConfig } from "./action-executor";

async function resolveArtifactOrganization(input: { artifactType: string; artifactId: string }) {
  const id = input.artifactId;
  switch (input.artifactType as OperationalArtifactType) {
    case "ORGANIZATION": return (await db.organization.findUnique({ where: { id }, select: { id: true } }))?.id ?? null;
    case "DOCUMENT": return (await db.document.findUnique({ where: { id }, select: { organizationId: true } }))?.organizationId ?? null;
    case "DOCUMENT_VERSION": return (await db.documentVersion.findUnique({ where: { id }, select: { organizationId: true } }))?.organizationId ?? null;
    case "DOCUMENT_REQUIREMENT": return (await db.documentRequirement.findUnique({ where: { id }, select: { organizationId: true } }))?.organizationId ?? null;
    case "WORKER": return (await db.worker.findUnique({ where: { id }, select: { organizationId: true } }))?.organizationId ?? null;
    case "JOB_SITE": return (await db.jobSite.findUnique({ where: { id }, select: { organizationId: true } }))?.organizationId ?? null;
    case "DEADLINE": return (await db.deadline.findUnique({ where: { id }, select: { organizationId: true } }))?.organizationId ?? null;
    case "CHECKLIST": return (await db.checklist.findUnique({ where: { id }, select: { organizationId: true } }))?.organizationId ?? null;
    case "EVIDENCE": return (await db.evidence.findUnique({ where: { id }, select: { organizationId: true } }))?.organizationId ?? null;
    case "DOCUMENT_PACKAGE": return (await db.documentPackage.findUnique({ where: { id }, select: { organizationId: true } }))?.organizationId ?? null;
    case "SHARE_LINK": return (await db.shareLink.findUnique({ where: { id }, select: { organizationId: true } }))?.organizationId ?? null;
    case "OPERATIONAL_REQUEST": return (await db.operationalRequest.findUnique({ where: { id }, select: { organizationId: true } }))?.organizationId ?? null;
    case "CONTEXT_MESSAGE": return (await db.contextMessage.findUnique({ where: { id }, select: { organizationId: true } }))?.organizationId ?? null;
    case "DOCUMENT_SOURCE": return (await db.documentSourcePolicy.findUnique({ where: { id }, select: { organizationId: true } }))?.organizationId ?? null;
  }
}

export async function dryRunOperationalDomainAction(proposal: unknown) {
  const context = await getWorkspaceAccessContext();
  const scope = await getResourceScope(context);
  const artifacts: Partial<Record<OperationalArtifactType, readonly string[]>> = {
    JOB_SITE: scope.visibleJobSiteIds,
    WORKER: scope.linkedWorker ? [scope.linkedWorker.id] : scope.grantedResourceIds.WORKER,
    DOCUMENT: scope.grantedResourceIds.DOCUMENT,
    DOCUMENT_PACKAGE: scope.grantedResourceIds.DOCUMENT_PACKAGE,
  };
  return dryRunOperationalAction({
    proposal,
    authorization: { organizationId: scope.organizationId, permissions: context.permissions as readonly OrganizationPermission[], scope: { mode: scope.fullAccess ? "FULL" : "ASSIGNED", artifacts } },
    config: readOperationalIntelligenceRuntimeConfig(),
    dependencies: { resolveArtifactOrganization },
  });
}
