import "server-only";

import { db } from "@qoovex/db";
import type { DocumentPackageItemType } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { getPrivateBlob } from "./blob-storage-service";
import { recordProductAuditEventBestEffort } from "./product-audit-service";
import { hashShareToken } from "./share-token-service";

interface SharedDownloadResult {
  stream: ReadableStream<Uint8Array>;
  originalFileName: string;
  mimeType: string;
  size: number;
}

const sharedItemSelect = {
  id: true,
  organizationId: true,
  documentPackageId: true,
  itemType: true,
  documentId: true,
  documentVersionId: true,
  evidenceId: true,
  checklistId: true,
  note: true,
  position: true,
  document: { select: { id: true, title: true, status: true, archivedAt: true } },
  documentVersion: {
    select: {
      id: true,
      originalFileName: true,
      mimeType: true,
      size: true,
      archivedAt: true,
      document: { select: { id: true, title: true, status: true, archivedAt: true } },
    },
  },
  evidence: {
    select: {
      id: true,
      title: true,
      type: true,
      originalFileName: true,
      mimeType: true,
      size: true,
      blobKey: true,
      archivedAt: true,
    },
  },
  checklist: { select: { id: true, name: true, status: true, archivedAt: true } },
} as const;

async function getValidShareLink(token: string) {
  if (!token || typeof token !== "string") throw new AccessError("Link non disponibile.", 404);
  const tokenHash = hashShareToken(token);
  const shareLink = await db.shareLink.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      organizationId: true,
      documentPackageId: true,
      expiresAt: true,
      revokedAt: true,
      documentPackage: {
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          updatedAt: true,
          archivedAt: true,
        },
      },
    },
  });
  if (!shareLink || shareLink.revokedAt || shareLink.documentPackage.archivedAt) {
    throw new AccessError("Link non disponibile.", 404);
  }
  if (shareLink.expiresAt && shareLink.expiresAt.getTime() <= Date.now()) {
    throw new AccessError("Link non disponibile.", 404);
  }
  return shareLink;
}

function toSharedItem(item: {
  id: string;
  itemType: DocumentPackageItemType;
  position: number;
  note: string | null;
  document: { title: string; status: string; archivedAt: Date | null } | null;
  documentVersion: {
    originalFileName: string;
    mimeType: string;
    size: number;
    archivedAt: Date | null;
    document: { title: string; status: string; archivedAt: Date | null };
  } | null;
  evidence: {
    title: string;
    type: string;
    originalFileName: string | null;
    mimeType: string | null;
    size: number | null;
    blobKey: string | null;
    archivedAt: Date | null;
  } | null;
  checklist: { name: string; status: string; archivedAt: Date | null } | null;
}) {
  if (item.itemType === "DOCUMENT") {
    if (!item.document || item.document.archivedAt) return null;
    return { id: item.id, itemType: item.itemType, position: item.position, title: item.document.title, status: item.document.status, hasFile: false };
  }
  if (item.itemType === "DOCUMENT_VERSION") {
    if (!item.documentVersion || item.documentVersion.archivedAt || item.documentVersion.document.archivedAt) return null;
    return {
      id: item.id,
      itemType: item.itemType,
      position: item.position,
      title: item.documentVersion.document.title,
      status: item.documentVersion.document.status,
      hasFile: true,
      originalFileName: item.documentVersion.originalFileName,
      mimeType: item.documentVersion.mimeType,
      size: item.documentVersion.size,
    };
  }
  if (item.itemType === "EVIDENCE") {
    if (!item.evidence || item.evidence.archivedAt) return null;
    return {
      id: item.id,
      itemType: item.itemType,
      position: item.position,
      title: item.evidence.title,
      status: item.evidence.type,
      hasFile: Boolean(item.evidence.blobKey),
      originalFileName: item.evidence.originalFileName,
      mimeType: item.evidence.mimeType,
      size: item.evidence.size,
    };
  }
  if (item.itemType === "CHECKLIST") {
    if (!item.checklist || item.checklist.archivedAt) return null;
    return { id: item.id, itemType: item.itemType, position: item.position, title: item.checklist.name, status: item.checklist.status, hasFile: false };
  }
  return { id: item.id, itemType: item.itemType, position: item.position, note: item.note, hasFile: false };
}

export async function getSharedDocumentPackage(token: string) {
  const shareLink = await getValidShareLink(token);
  const items = await db.documentPackageItem.findMany({
    where: { organizationId: shareLink.organizationId, documentPackageId: shareLink.documentPackageId },
    select: sharedItemSelect,
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  await db.shareLink.update({ where: { id: shareLink.id }, data: { lastAccessedAt: new Date() }, select: { id: true } });
  await recordProductAuditEventBestEffort({
    organizationId: shareLink.organizationId,
    action: "SHARE_LINK_ACCESSED",
    entityType: "SHARE_LINK",
    entityId: shareLink.id,
    metadata: { reasonCode: "viewer-package-access" },
  });
  return {
    id: shareLink.documentPackage.id,
    title: shareLink.documentPackage.title,
    description: shareLink.documentPackage.description,
    status: shareLink.documentPackage.status,
    updatedAt: shareLink.documentPackage.updatedAt,
    items: items.map(toSharedItem).filter((item): item is NonNullable<typeof item> => item !== null),
  };
}

export async function getSharedPackageItemDownload(token: string, itemId: string): Promise<SharedDownloadResult> {
  const shareLink = await getValidShareLink(token);
  const item = await db.documentPackageItem.findFirst({
    where: { id: itemId, organizationId: shareLink.organizationId, documentPackageId: shareLink.documentPackageId },
    select: {
      id: true,
      itemType: true,
      documentVersionId: true,
      evidenceId: true,
    },
  });
  if (!item) throw new AccessError("File condiviso non trovato.", 404);

  if (item.itemType === "DOCUMENT_VERSION" && item.documentVersionId) {
    const version = await db.documentVersion.findFirst({
      where: { id: item.documentVersionId, organizationId: shareLink.organizationId, archivedAt: null, document: { is: { archivedAt: null } } },
      select: { blobKey: true, originalFileName: true, mimeType: true, size: true },
    });
    if (!version) throw new AccessError("File condiviso non trovato.", 404);
    const blob = await getPrivateBlob(version.blobKey);
    if (!blob) throw new AccessError("File condiviso non trovato.", 404);
    await db.shareLink.update({ where: { id: shareLink.id }, data: { lastAccessedAt: new Date() }, select: { id: true } });
    await recordProductAuditEventBestEffort({
      organizationId: shareLink.organizationId,
      action: "SHARE_LINK_ACCESSED",
      entityType: "SHARE_LINK",
      entityId: shareLink.id,
      metadata: { reasonCode: "viewer-file-download", itemType: item.itemType, mimeType: version.mimeType, size: version.size, hasFile: true },
    });
    return { stream: blob.stream, originalFileName: version.originalFileName, mimeType: version.mimeType, size: version.size };
  }

  if (item.itemType === "EVIDENCE" && item.evidenceId) {
    const evidence = await db.evidence.findFirst({
      where: { id: item.evidenceId, organizationId: shareLink.organizationId, archivedAt: null },
      select: { blobKey: true, originalFileName: true, mimeType: true, size: true },
    });
    if (!evidence?.blobKey || !evidence.originalFileName || !evidence.mimeType || evidence.size === null) {
      throw new AccessError("File condiviso non trovato.", 404);
    }
    const blob = await getPrivateBlob(evidence.blobKey);
    if (!blob) throw new AccessError("File condiviso non trovato.", 404);
    await db.shareLink.update({ where: { id: shareLink.id }, data: { lastAccessedAt: new Date() }, select: { id: true } });
    await recordProductAuditEventBestEffort({
      organizationId: shareLink.organizationId,
      action: "SHARE_LINK_ACCESSED",
      entityType: "SHARE_LINK",
      entityId: shareLink.id,
      metadata: { reasonCode: "viewer-file-download", itemType: item.itemType, mimeType: evidence.mimeType, size: evidence.size, hasFile: true },
    });
    return { stream: blob.stream, originalFileName: evidence.originalFileName, mimeType: evidence.mimeType, size: evidence.size };
  }

  throw new AccessError("File condiviso non trovato.", 404);
}
