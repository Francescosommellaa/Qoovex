import "server-only";

import { db } from "@qoovex/db";
import { deletePrivateBlobs } from "./blob-storage-service";

const CLEANUP_BATCH = 25;

export async function runJobSiteRetentionCleanup(now = new Date()) {
  await Promise.all([
    db.jobSiteClientInvitation.updateMany({ where: { status: "PENDING", expiresAt: { lte: now } }, data: { status: "EXPIRED", activeKey: null } }),
    db.jobSiteExportAccessLink.updateMany({ where: { expiresAt: { lte: now }, revokedAt: null }, data: { revokedAt: now, activeKey: null } }),
    db.jobSiteExportDownloadGrant.updateMany({ where: { expiresAt: { lte: now }, revokedAt: null }, data: { revokedAt: now, activeKey: null } }),
  ]);

  const archives = await db.jobSiteExport.findMany({
    where: {
      status: "READY",
      availableUntil: { lte: now },
      blobKey: { not: null },
      jobSite: {
        legalHolds: { none: { status: "ACTIVE" } },
        disputes: { none: { preservations: { some: {} } } },
      },
    },
    select: { id: true, blobKey: true },
    orderBy: { availableUntil: "asc" },
    take: CLEANUP_BATCH,
  });
  let expiredArchives = 0;
  for (const archive of archives) {
    if (!archive.blobKey) continue;
    await deletePrivateBlobs([archive.blobKey]);
    const updated = await db.jobSiteExport.updateMany({ where: { id: archive.id, status: "READY", blobKey: archive.blobKey }, data: { status: "EXPIRED", blobKey: null } });
    expiredArchives += updated.count;
  }
  return { expiredArchives, generatedAt: now.toISOString() };
}
