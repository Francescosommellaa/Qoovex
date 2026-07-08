import "server-only";

import { db } from "@qoovex/db";
import type { DataRetentionCandidate, DataRetentionOverviewResponse } from "@qoovex/types";
import { requireDataControlAccess } from "./data-control-access";

export const READ_NOTIFICATION_REVIEW_DAYS = 180;
export const EMAIL_DELIVERY_REVIEW_DAYS = 365;
export const AUDIT_REVIEW_DAYS = 365;
export const RETENTION_NOTICE = "Le soglie sono default operativi modificabili, non requisiti legali.";

function daysAgo(days: number, now: Date) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export async function buildDataRetentionOverviewForOrganization(organizationId: string, now = new Date()): Promise<DataRetentionOverviewResponse> {
  const readNotificationCutoff = daysAgo(READ_NOTIFICATION_REVIEW_DAYS, now);
  const emailDeliveryCutoff = daysAgo(EMAIL_DELIVERY_REVIEW_DAYS, now);
  const auditCutoff = daysAgo(AUDIT_REVIEW_DAYS, now);
  const [
    archivedWorkers,
    archivedJobSites,
    archivedDocuments,
    archivedDocumentVersions,
    archivedDeadlines,
    archivedChecklists,
    archivedChecklistItems,
    archivedEvidence,
    archivedDocumentPackages,
    expiredShareLinks,
    revokedShareLinks,
    oldReadNotifications,
    oldDismissedNotifications,
    oldEmailDeliveries,
    oldAuditEvents,
  ] = await Promise.all([
    db.worker.count({ where: { organizationId, archivedAt: { not: null } } }),
    db.jobSite.count({ where: { organizationId, archivedAt: { not: null } } }),
    db.document.count({ where: { organizationId, archivedAt: { not: null } } }),
    db.documentVersion.count({ where: { organizationId, archivedAt: { not: null } } }),
    db.deadline.count({ where: { organizationId, archivedAt: { not: null } } }),
    db.checklist.count({ where: { organizationId, archivedAt: { not: null } } }),
    db.checklistItem.count({ where: { organizationId, status: "ARCHIVED" } }),
    db.evidence.count({ where: { organizationId, archivedAt: { not: null } } }),
    db.documentPackage.count({ where: { organizationId, archivedAt: { not: null } } }),
    db.shareLink.count({ where: { organizationId, revokedAt: null, expiresAt: { lte: now } } }),
    db.shareLink.count({ where: { organizationId, revokedAt: { not: null } } }),
    db.notification.count({ where: { organizationId, readAt: { lt: readNotificationCutoff }, dismissedAt: null } }),
    db.notification.count({ where: { organizationId, dismissedAt: { lt: readNotificationCutoff } } }),
    db.notificationEmailDelivery.count({ where: { organizationId, createdAt: { lt: emailDeliveryCutoff } } }),
    db.productAuditEvent.count({ where: { organizationId, createdAt: { lt: auditCutoff } } }),
  ]);

  const candidates: DataRetentionCandidate[] = [
    { key: "archived-records", title: "Record archiviati", description: "Record non attivi da rivedere manualmente prima di qualunque cancellazione.", count: archivedWorkers + archivedJobSites + archivedDocuments + archivedDocumentVersions + archivedDeadlines + archivedChecklists + archivedChecklistItems + archivedEvidence + archivedDocumentPackages },
    { key: "expired-share-links", title: "Link scaduti", description: "Link di condivisione scaduti da controllare o lasciare come storico operativo.", count: expiredShareLinks },
    { key: "revoked-share-links", title: "Link revocati", description: "Link revocati conservati come metadata operativo.", count: revokedShareLinks },
    { key: "old-notifications", title: "Notifiche lette o nascoste vecchie", description: `Notifiche lette o nascoste oltre ${READ_NOTIFICATION_REVIEW_DAYS} giorni.`, count: oldReadNotifications + oldDismissedNotifications },
    { key: "old-email-deliveries", title: "Invii email vecchi", description: `Delivery log email oltre ${EMAIL_DELIVERY_REVIEW_DAYS} giorni, senza corpo email.`, count: oldEmailDeliveries },
    { key: "old-audit-events", title: "Eventi audit vecchi", description: `Eventi audit oltre ${AUDIT_REVIEW_DAYS} giorni da mantenere o rivedere con cautela.`, count: oldAuditEvents },
  ];

  return {
    generatedAt: now.toISOString(),
    notice: RETENTION_NOTICE,
    thresholds: {
      readNotificationDays: READ_NOTIFICATION_REVIEW_DAYS,
      emailDeliveryDays: EMAIL_DELIVERY_REVIEW_DAYS,
      auditReviewDays: AUDIT_REVIEW_DAYS,
    },
    candidates,
  };
}

export async function getDataRetentionOverview() {
  const { organizationId } = await requireDataControlAccess();
  return await buildDataRetentionOverviewForOrganization(organizationId);
}
