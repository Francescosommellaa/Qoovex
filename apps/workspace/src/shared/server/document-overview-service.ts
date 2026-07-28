import "server-only";

import { db, type Prisma } from "@qoovex/db";
import type { DocumentOwnerType, DocumentStatus } from "@qoovex/types";
import { documentOwnerTypes, documentStatuses } from "@qoovex/types";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { buildMissingDocumentRequirementItemsForScope } from "./document-requirement-service";
import { documentListSelect, toDocumentListRecord } from "./document-service";
import { getResourceScope } from "./resource-scope-service";
import { recordSupportAccess } from "./support-access-service";

const DOCUMENT_READ_ROLES = ["OWNER", "COLLABORATOR"] as const;
const ATTENTION_STATUSES: DocumentStatus[] = ["EXPIRED", "EXPIRING_SOON", "MISSING", "TO_REVIEW"];

function scopedDocumentWhere(input: {
  organizationId: string;
  preset: string | null;
  canReadSensitive: boolean;
  fullAccess: boolean;
  siteManagerJobSiteIds: string[];
  linkedWorkerId?: string;
}): Prisma.DocumentWhereInput {
  const where: Prisma.DocumentWhereInput = { organizationId: input.organizationId, archivedAt: null };
  if (!input.fullAccess) {
    if (input.preset === "SITE_MANAGER") where.OR = [{ ownerType: "JOB_SITE", jobSiteId: { in: input.siteManagerJobSiteIds } }];
    if (input.preset === "LIMITED_UPLOAD" && input.linkedWorkerId) where.OR = [{ ownerType: "WORKER", workerId: input.linkedWorkerId }];
    if (!where.OR) where.id = { in: [] };
  }
  if (!input.canReadSensitive) {
    where.AND = [{ OR: [{ documentTypeId: null }, { documentType: { is: { sensitivity: "STANDARD" } } }] }];
  }
  return where;
}

export async function getDocumentOverview(visibleTargets?: {
  workers: ReadonlyArray<{ id: string; displayName: string }>;
  jobSites: ReadonlyArray<{ id: string; name: string }>;
}) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:read", DOCUMENT_READ_ROLES);
  const scope = await getResourceScope(context);
  const where = scopedDocumentWhere({
    organizationId,
    preset: scope.preset,
    canReadSensitive: context.permissions.includes("documents:sensitive:read"),
    fullAccess: scope.fullAccess,
    siteManagerJobSiteIds: scope.siteManagerJobSiteIds,
    linkedWorkerId: scope.linkedWorker?.id,
  });

  const [groups, unclassifiedCount, attention, missing] = await Promise.all([
    db.document.groupBy({
      by: ["ownerType", "status"],
      where,
      _count: { _all: true },
    }),
    db.document.count({
      where: { AND: [where, { OR: [{ documentTypeId: null }, { documentType: { is: { categoryKey: "UNCLASSIFIED" } } }] }] },
    }),
    db.document.findMany({
      where: { AND: [where, { status: { in: ATTENTION_STATUSES } }] },
      select: documentListSelect,
      orderBy: [{ expiryDate: "asc" }, { updatedAt: "desc" }],
      take: 6,
    }),
    buildMissingDocumentRequirementItemsForScope({ organizationId, scope, visibleTargets }),
  ]);

  const byOwner = Object.fromEntries(documentOwnerTypes.map((ownerType) => [ownerType, 0])) as Record<DocumentOwnerType, number>;
  const byStatus = Object.fromEntries(documentStatuses.map((status) => [status, 0])) as Record<DocumentStatus, number>;
  for (const group of groups) {
    byOwner[group.ownerType] += group._count._all;
    byStatus[group.status] += group._count._all;
  }

  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "document-overview" });
  return {
    byOwner,
    byStatus,
    unclassifiedCount,
    missingCount: missing.length,
    missing: missing.slice(0, 6),
    attention: attention.map(toDocumentListRecord),
  };
}
