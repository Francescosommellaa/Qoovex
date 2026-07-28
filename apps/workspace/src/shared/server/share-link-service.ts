import "server-only";

import { db, Prisma } from "@qoovex/db";
import { AccessError } from "@shared/server/access-errors";
import { ensureShareLinkOperationalProcess } from "@shared/server/document-package-share-proposal-service";
import { requireOrganizationDomainAccess } from "@shared/server/domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "@shared/server/product-audit-service";
import { recordSupportAccess } from "@shared/server/support-access-service";

const SHARE_LINK_ROLES = ["OWNER", "COLLABORATOR"] as const;

export const shareLinkSelect = {
  id: true,
  organizationId: true,
  documentPackageId: true,
  revisionId: true,
  proposalId: true,
  purpose: true,
  recipientLabel: true,
  allowDownload: true,
  expiresAt: true,
  expiredAt: true,
  revokedAt: true,
  createdById: true,
  createdAt: true,
  lastAccessedAt: true,
} as const;

async function findActivePackage(organizationId: string, packageId: string) {
  const documentPackage = await db.documentPackage.findFirst({
    where: { id: packageId, organizationId, archivedAt: null },
    select: { id: true },
  });
  if (!documentPackage) throw new AccessError("Pacchetto documentale non trovato.", 404);
  return documentPackage;
}

export async function listShareLinks(packageId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documentPackages:share", SHARE_LINK_ROLES);
  await findActivePackage(organizationId, packageId);
  const links = await db.shareLink.findMany({
    where: { organizationId, documentPackageId: packageId },
    select: shareLinkSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 100,
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "share-links", resourceId: packageId });
  return links;
}

export async function revokeShareLink(packageId: string, shareLinkId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documentPackages:share", SHARE_LINK_ROLES);
  await findActivePackage(organizationId, packageId);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "share-link", resourceId: shareLinkId });

  const result = await db.$transaction(async (tx) => {
    const existing = await tx.shareLink.findFirst({
      where: { id: shareLinkId, organizationId, documentPackageId: packageId },
      select: { id: true, organizationId: true, documentPackageId: true, revokedAt: true, proposal: { select: { processId: true } } },
    });
    if (!existing) throw new AccessError("Link di condivisione non trovato.", 404);
    const processId = await ensureShareLinkOperationalProcess(tx, existing);
    const updated = await tx.shareLink.updateMany({
      where: { id: existing.id, organizationId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    const shareLink = await tx.shareLink.findUnique({ where: { id: existing.id }, select: shareLinkSelect });
    if (!shareLink) throw new AccessError("Link di condivisione non trovato.", 404);
    if (updated.count) {
      await tx.operationalEvent.create({
        data: {
          organizationId,
          processId,
          eventKey: `share-link-revoked:${shareLink.id}`,
          kind: "DOMAIN",
          eventType: "SHARE_LINK_REVOKED",
          title: "Link revocato",
          summary: "Non sono consentiti nuovi accessi. Il pacchetto e i file non sono stati eliminati.",
          actorUserId: context.userId,
          actorType: context.support ? "SUPPORT" : "USER",
          actorRole,
          sourceType: "USER_ACTION",
          sourceId: shareLink.id,
          reliability: "VERIFIED",
          impact: "CONTROLLED",
        },
      });
    }
    return { shareLink, alreadyRevoked: updated.count === 0 };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  if (!result.alreadyRevoked) {
    await recordProductAuditEventBestEffort({
      organizationId,
      ...auditActorFromContext(context, actorRole),
      action: "SHARE_LINK_REVOKED",
      entityType: "SHARE_LINK",
      entityId: result.shareLink.id,
      metadata: { reasonCode: "manual-revoke" },
    });
  }
  return result;
}
