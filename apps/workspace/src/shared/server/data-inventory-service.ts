import "server-only";

import { db } from "@qoovex/db";
import type { DataInventoryResponse, DataRecordCount } from "@qoovex/types";
import { requireDataControlAccess } from "./data-control-access";

async function archivedCount(model: { count: (args: { where: Record<string, unknown> }) => Promise<number> }, organizationId: string): Promise<DataRecordCount> {
  const [total, active, archived] = await Promise.all([
    model.count({ where: { organizationId } }),
    model.count({ where: { organizationId, archivedAt: null } }),
    model.count({ where: { organizationId, archivedAt: { not: null } } }),
  ]);
  return { total, active, archived };
}

async function statusArchivedCount(model: { count: (args: { where: Record<string, unknown> }) => Promise<number> }, organizationId: string): Promise<DataRecordCount> {
  const [total, active, archived] = await Promise.all([
    model.count({ where: { organizationId } }),
    model.count({ where: { organizationId, status: { not: "ARCHIVED" } } }),
    model.count({ where: { organizationId, status: "ARCHIVED" } }),
  ]);
  return { total, active, archived };
}

async function totalCount(model: { count: (args: { where: Record<string, unknown> }) => Promise<number> }, organizationId: string): Promise<DataRecordCount> {
  return { total: await model.count({ where: { organizationId } }) };
}

export async function buildDataInventoryForOrganization(organizationId: string, now = new Date()): Promise<DataInventoryResponse> {
  const [
    workers,
    jobSites,
    documents,
    documentVersions,
    deadlines,
    checklists,
    checklistItems,
    evidence,
    documentPackages,
    documentPackageItems,
    shareLinksTotal,
    shareLinksActive,
    shareLinksExpired,
    shareLinksRevoked,
    notificationsTotal,
    notificationsUnread,
    notificationsRead,
    notificationsDismissed,
    notificationPreferences,
    emailDeliveries,
    auditEvents,
    workerUserLinks,
    jobSiteUserAssignments,
    jobSiteWorkerAssignments,
  ] = await Promise.all([
    archivedCount(db.worker, organizationId),
    archivedCount(db.jobSite, organizationId),
    archivedCount(db.document, organizationId),
    archivedCount(db.documentVersion, organizationId),
    archivedCount(db.deadline, organizationId),
    archivedCount(db.checklist, organizationId),
    statusArchivedCount(db.checklistItem, organizationId),
    archivedCount(db.evidence, organizationId),
    archivedCount(db.documentPackage, organizationId),
    totalCount(db.documentPackageItem, organizationId),
    db.shareLink.count({ where: { organizationId } }),
    db.shareLink.count({ where: { organizationId, revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } }),
    db.shareLink.count({ where: { organizationId, revokedAt: null, expiresAt: { lte: now } } }),
    db.shareLink.count({ where: { organizationId, revokedAt: { not: null } } }),
    db.notification.count({ where: { organizationId } }),
    db.notification.count({ where: { organizationId, readAt: null, dismissedAt: null } }),
    db.notification.count({ where: { organizationId, readAt: { not: null }, dismissedAt: null } }),
    db.notification.count({ where: { organizationId, dismissedAt: { not: null } } }),
    totalCount(db.notificationPreference, organizationId),
    totalCount(db.notificationEmailDelivery, organizationId),
    totalCount(db.productAuditEvent, organizationId),
    archivedCount(db.workerUserLink, organizationId),
    archivedCount(db.jobSiteUserAssignment, organizationId),
    archivedCount(db.jobSiteWorkerAssignment, organizationId),
  ]);

  return {
    generatedAt: now.toISOString(),
    counts: {
      workers,
      jobSites,
      documents,
      documentVersions,
      deadlines,
      checklists,
      checklistItems,
      evidence,
      documentPackages,
      documentPackageItems,
      shareLinks: { total: shareLinksTotal, active: shareLinksActive, expired: shareLinksExpired, revoked: shareLinksRevoked },
      notifications: { total: notificationsTotal, unread: notificationsUnread, read: notificationsRead, dismissed: notificationsDismissed },
      notificationPreferences,
      emailDeliveries,
      auditEvents,
      workerUserLinks,
      jobSiteUserAssignments,
      jobSiteWorkerAssignments,
    },
  };
}

export async function getDataInventory() {
  const { organizationId } = await requireDataControlAccess();
  return await buildDataInventoryForOrganization(organizationId);
}
