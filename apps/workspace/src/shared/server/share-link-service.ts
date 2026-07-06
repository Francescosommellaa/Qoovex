import "server-only";

import { db } from "@qoovex/db";
import { AccessError } from "@shared/server/access-errors";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { parseOptionalDate } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { createShareToken, hashShareToken } from "./share-token-service";

const SHARE_LINK_ROLES = ["OWNER", "ADMIN"] as const;
const DEFAULT_SHARE_LINK_DAYS = 7;

const shareLinkSelect = {
  id: true,
  organizationId: true,
  documentPackageId: true,
  expiresAt: true,
  revokedAt: true,
  createdById: true,
  createdAt: true,
  lastAccessedAt: true,
} as const;

export interface CreateShareLinkInput extends Record<string, unknown> {
  expiresAt?: unknown;
}

function getDefaultExpiresAt() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + DEFAULT_SHARE_LINK_DAYS);
  return expiresAt;
}

function parseShareExpiresAt(value: unknown) {
  const expiresAt = parseOptionalDate(value, "Scadenza link") ?? getDefaultExpiresAt();
  if (expiresAt.getTime() <= Date.now()) throw new AccessError("Scadenza link non valida.", 409);
  return expiresAt;
}

async function findActivePackage(organizationId: string, packageId: string) {
  const documentPackage = await db.documentPackage.findFirst({
    where: { id: packageId, organizationId, archivedAt: null },
    select: { id: true, status: true },
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
    orderBy: { createdAt: "desc" },
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "share-links", resourceId: packageId });
  return links;
}

export async function createShareLink(packageId: string, input: CreateShareLinkInput = {}) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documentPackages:share", SHARE_LINK_ROLES);
  const documentPackage = await findActivePackage(organizationId, packageId);
  const expiresAt = parseShareExpiresAt(input.expiresAt);
  const token = createShareToken();
  const tokenHash = hashShareToken(token);

  const shareLink = await db.$transaction(async (tx) => {
    const created = await tx.shareLink.create({
      data: {
        organizationId,
        documentPackageId: documentPackage.id,
        tokenHash,
        expiresAt,
        createdById: context.userId,
      },
      select: shareLinkSelect,
    });
    if (documentPackage.status !== "SHARED") {
      await tx.documentPackage.update({ where: { id: documentPackage.id }, data: { status: "SHARED" }, select: { id: true } });
    }
    return created;
  });

  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "share-link", resourceId: shareLink.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "SHARE_LINK_CREATED",
    entityType: "SHARE_LINK",
    entityId: shareLink.id,
    metadata: { expiresAt: shareLink.expiresAt?.toISOString() ?? null },
  });
  return { shareLink, token };
}

export async function revokeShareLink(packageId: string, shareLinkId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documentPackages:share", SHARE_LINK_ROLES);
  await findActivePackage(organizationId, packageId);
  const existing = await db.shareLink.findFirst({
    where: { id: shareLinkId, organizationId, documentPackageId: packageId },
    select: { id: true },
  });
  if (!existing) throw new AccessError("Link di condivisione non trovato.", 404);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "share-link", resourceId: existing.id });
  const shareLink = await db.shareLink.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
    select: shareLinkSelect,
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "SHARE_LINK_REVOKED",
    entityType: "SHARE_LINK",
    entityId: shareLink.id,
    metadata: { reasonCode: "manual-revoke" },
  });
  return shareLink;
}
