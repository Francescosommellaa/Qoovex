import "server-only";

import crypto from "node:crypto";
import { db, Prisma } from "@qoovex/db";
import type { DocumentPackageRevisionItemDto, SharedDocumentPackageResponse } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { getPrivateBlob } from "@shared/server/blob-storage-service";
import { ensureShareLinkOperationalProcess } from "@shared/server/document-package-share-proposal-service";
import { recordProductAuditEventBestEffort } from "@shared/server/product-audit-service";
import { hashShareToken } from "@shared/server/share-token-service";

interface SharedDownloadResult {
  stream: ReadableStream<Uint8Array>;
  originalFileName: string;
  mimeType: string;
  size: number;
}

interface RevisionManifest {
  schemaVersion: 1;
  package: { title: string; description: string | null };
  items: DocumentPackageRevisionItemDto[];
}

function readManifest(value: Prisma.JsonValue): RevisionManifest {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new AccessError("Link non disponibile.", 404);
  const manifest = value as unknown as RevisionManifest;
  if (manifest.schemaVersion !== 1 || !manifest.package || !Array.isArray(manifest.items)) throw new AccessError("Link non disponibile.", 404);
  return manifest;
}

async function getValidShareLink(token: string) {
  if (!token || typeof token !== "string" || token.length > 512) throw new AccessError("Link non disponibile.", 404);
  const tokenHash = hashShareToken(token);
  const shareLink = await db.shareLink.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      organizationId: true,
      documentPackageId: true,
      revisionId: true,
      allowDownload: true,
      expiresAt: true,
      expiredAt: true,
      revokedAt: true,
      proposal: { select: { processId: true } },
      revision: { select: { manifest: true, preparedAt: true } },
      documentPackage: { select: { archivedAt: true } },
    },
  });
  if (!shareLink || shareLink.revokedAt || shareLink.expiredAt || shareLink.documentPackage.archivedAt) throw new AccessError("Link non disponibile.", 404);
  if (shareLink.expiresAt && shareLink.expiresAt.getTime() <= Date.now()) throw new AccessError("Link non disponibile.", 404);
  return shareLink;
}

async function recordShareAccess(shareLink: Awaited<ReturnType<typeof getValidShareLink>>, input: { type: "OPEN" | "DOWNLOAD_REQUESTED"; item?: DocumentPackageRevisionItemDto }) {
  await db.$transaction(async (tx) => {
    const processId = await ensureShareLinkOperationalProcess(tx, shareLink);
    await tx.shareLink.update({ where: { id: shareLink.id }, data: { lastAccessedAt: new Date() }, select: { id: true } });
    await tx.operationalEvent.create({
      data: {
        organizationId: shareLink.organizationId,
        processId,
        eventKey: `${input.type === "OPEN" ? "share-link-opened" : "share-download-requested"}:${shareLink.id}:${crypto.randomUUID()}`,
        kind: "DOMAIN",
        eventType: input.type === "OPEN" ? "SHARE_LINK_OPENED" : "SHARE_DOWNLOAD_REQUESTED",
        title: input.type === "OPEN" ? "Link aperto" : "Download richiesto",
        summary: input.type === "OPEN" ? "La pagina condivisa e stata aperta." : "Il file autorizzato e stato richiesto tramite il download mediato.",
        metadata: input.item ? { sourceItemId: input.item.sourceItemId, itemType: input.item.itemType, outcome: "AUTHORIZED" } : { outcome: "AUTHORIZED" },
        actorType: "EXTERNAL",
        sourceType: "SHARING_ACCESS",
        sourceId: shareLink.id,
        reliability: "VERIFIED",
        impact: "LOW",
      },
    });
  });
  await recordProductAuditEventBestEffort({
    organizationId: shareLink.organizationId,
    action: "SHARE_LINK_ACCESSED",
    entityType: "SHARE_LINK",
    entityId: shareLink.id,
    metadata: input.item ? { reasonCode: "external-download-requested", itemType: input.item.itemType } : { reasonCode: "external-link-opened" },
  });
}

function toSharedItem(item: DocumentPackageRevisionItemDto) {
  return {
    id: item.sourceItemId,
    itemType: item.itemType,
    position: item.position,
    title: item.title ?? null,
    status: item.status ?? null,
    note: item.note ?? null,
    hasFile: item.hasFile,
    originalFileName: item.originalFileName ?? null,
    mimeType: item.mimeType ?? null,
    size: item.size ?? null,
  };
}

export async function getSharedDocumentPackage(token: string): Promise<SharedDocumentPackageResponse> {
  const shareLink = await getValidShareLink(token);
  const manifest = readManifest(shareLink.revision.manifest);
  await recordShareAccess(shareLink, { type: "OPEN" });
  return {
    id: shareLink.documentPackageId,
    title: manifest.package.title,
    description: manifest.package.description,
    status: "SHARED",
    updatedAt: shareLink.revision.preparedAt.toISOString(),
    expiresAt: shareLink.expiresAt?.toISOString() ?? null,
    allowDownload: shareLink.allowDownload,
    items: manifest.items.filter((item) => item.included).map(toSharedItem),
  };
}

export async function getSharedPackageItemDownload(token: string, itemId: string): Promise<SharedDownloadResult> {
  const shareLink = await getValidShareLink(token);
  if (!shareLink.allowDownload) throw new AccessError("Download non consentito per questo link.", 404);
  const manifest = readManifest(shareLink.revision.manifest);
  const item = manifest.items.find((candidate) => candidate.sourceItemId === itemId && candidate.included && candidate.hasFile);
  if (!item) throw new AccessError("File condiviso non trovato.", 404);

  if (item.itemType === "DOCUMENT_VERSION" && item.documentVersionId) {
    const version = await db.documentVersion.findFirst({
      where: { id: item.documentVersionId, organizationId: shareLink.organizationId, archivedAt: null, document: { is: { archivedAt: null, documentType: { is: { sensitivity: "STANDARD", categoryKey: { not: "UNCLASSIFIED" } } } } } },
      select: { blobKey: true, originalFileName: true, mimeType: true, size: true },
    });
    if (!version) throw new AccessError("File condiviso non trovato.", 404);
    const blob = await getPrivateBlob(version.blobKey);
    if (!blob) throw new AccessError("File condiviso non trovato.", 404);
    await recordShareAccess(shareLink, { type: "DOWNLOAD_REQUESTED", item });
    return { stream: blob.stream, originalFileName: version.originalFileName, mimeType: version.mimeType, size: version.size };
  }

  if (item.itemType === "EVIDENCE" && item.evidenceId) {
    const evidence = await db.evidence.findFirst({
      where: { id: item.evidenceId, organizationId: shareLink.organizationId, archivedAt: null },
      select: { blobKey: true, originalFileName: true, mimeType: true, size: true },
    });
    if (!evidence?.blobKey || !evidence.originalFileName || !evidence.mimeType || evidence.size === null) throw new AccessError("File condiviso non trovato.", 404);
    const blob = await getPrivateBlob(evidence.blobKey);
    if (!blob) throw new AccessError("File condiviso non trovato.", 404);
    await recordShareAccess(shareLink, { type: "DOWNLOAD_REQUESTED", item });
    return { stream: blob.stream, originalFileName: evidence.originalFileName, mimeType: evidence.mimeType, size: evidence.size };
  }

  throw new AccessError("File condiviso non trovato.", 404);
}
