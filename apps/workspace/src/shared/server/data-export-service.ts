import "server-only";

import { db } from "@qoovex/db";
import type { AuditLogEventResponse, DataExportResponse } from "@qoovex/types";
import { auditActorFromContext, recordProductAuditEventBestEffort, sanitizeAuditMetadata } from "./product-audit-service";
import { requireDataControlAccess } from "./data-control-access";
import { buildDataInventoryForOrganization } from "./data-inventory-service";

function iso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function auditEvent(event: {
  id: string;
  actorUserId: string | null;
  actorRole: AuditLogEventResponse["actorRole"];
  action: AuditLogEventResponse["action"];
  entityType: AuditLogEventResponse["entityType"];
  entityId: string | null;
  outcome: AuditLogEventResponse["outcome"];
  metadata: unknown;
  requestId: string | null;
  supportSessionId: string | null;
  createdAt: Date;
}): AuditLogEventResponse {
  return {
    id: event.id,
    actorUserId: event.actorUserId,
    actorRole: event.actorRole,
    action: event.action,
    entityType: event.entityType,
    entityId: event.entityId,
    outcome: event.outcome,
    metadata: sanitizeAuditMetadata(event.metadata),
    requestId: event.requestId,
    supportSessionId: event.supportSessionId,
    createdAt: event.createdAt.toISOString(),
  };
}

export async function buildDataExportForOrganization(organizationId: string): Promise<DataExportResponse> {
    const inventory = await buildDataInventoryForOrganization(organizationId);
    const [
      organization,
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
      shareLinks,
      notifications,
      notificationPreferences,
      emailDeliveries,
      auditEvents,
      workerUserLinks,
      jobSiteUserAssignments,
      jobSiteWorkerAssignments,
    ] = await Promise.all([
      db.organization.findUniqueOrThrow({ where: { id: organizationId }, select: { id: true, name: true, code: true, createdAt: true, updatedAt: true } }),
      db.worker.findMany({ where: { organizationId }, select: { id: true, displayName: true, roleLabel: true, status: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: { createdAt: "asc" } }),
      db.jobSite.findMany({ where: { organizationId }, select: { id: true, name: true, address: true, clientName: true, status: true, startDate: true, endDate: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: { createdAt: "asc" } }),
      db.document.findMany({ where: { organizationId }, select: { id: true, documentTypeId: true, ownerType: true, workerId: true, jobSiteId: true, title: true, status: true, expiryDate: true, reviewedAt: true, reviewedById: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: { createdAt: "asc" } }),
      db.documentVersion.findMany({ where: { organizationId }, select: { id: true, documentId: true, originalFileName: true, mimeType: true, size: true, checksum: true, uploadedById: true, createdAt: true, archivedAt: true }, orderBy: { createdAt: "asc" } }),
      db.deadline.findMany({ where: { organizationId }, select: { id: true, title: true, dueDate: true, sourceType: true, documentId: true, workerId: true, jobSiteId: true, status: true, remindAt: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: { createdAt: "asc" } }),
      db.checklist.findMany({ where: { organizationId }, select: { id: true, jobSiteId: true, name: true, status: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: { createdAt: "asc" } }),
      db.checklistItem.findMany({ where: { organizationId }, select: { id: true, checklistId: true, label: true, status: true, completedAt: true, completedById: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: "asc" } }),
      db.evidence.findMany({ where: { organizationId }, select: { id: true, jobSiteId: true, workerId: true, checklistItemId: true, type: true, title: true, originalFileName: true, mimeType: true, size: true, createdById: true, createdAt: true, archivedAt: true }, orderBy: { createdAt: "asc" } }),
      db.documentPackage.findMany({ where: { organizationId }, select: { id: true, jobSiteId: true, title: true, status: true, createdById: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: { createdAt: "asc" } }),
      db.documentPackageItem.findMany({ where: { organizationId }, select: { id: true, documentPackageId: true, itemType: true, documentId: true, documentVersionId: true, evidenceId: true, checklistId: true, position: true, createdAt: true }, orderBy: { createdAt: "asc" } }),
      db.shareLink.findMany({ where: { organizationId }, select: { id: true, documentPackageId: true, expiresAt: true, revokedAt: true, createdById: true, createdAt: true, lastAccessedAt: true }, orderBy: { createdAt: "asc" } }),
      db.notification.findMany({ where: { organizationId }, select: { id: true, userId: true, type: true, severity: true, title: true, message: true, sourceType: true, sourceId: true, actionHref: true, readAt: true, dismissedAt: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: "asc" } }),
      db.notificationPreference.findMany({ where: { organizationId }, select: { id: true, userId: true, emailDigestEnabled: true, emailDigestFrequency: true, emailDigestHour: true, lastDigestSentAt: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: "asc" } }),
      db.notificationEmailDelivery.findMany({ where: { organizationId }, select: { id: true, userId: true, notificationId: true, type: true, notificationCount: true, status: true, errorCode: true, sentAt: true, createdAt: true }, orderBy: { createdAt: "asc" } }),
      db.productAuditEvent.findMany({ where: { organizationId }, select: { id: true, actorUserId: true, actorRole: true, action: true, entityType: true, entityId: true, outcome: true, metadata: true, requestId: true, supportSessionId: true, createdAt: true }, orderBy: { createdAt: "asc" } }),
      db.workerUserLink.findMany({ where: { organizationId }, select: { id: true, workerId: true, userId: true, linkedById: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: { createdAt: "asc" } }),
      db.jobSiteUserAssignment.findMany({ where: { organizationId }, select: { id: true, jobSiteId: true, userId: true, assignmentRole: true, assignedById: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: { createdAt: "asc" } }),
      db.jobSiteWorkerAssignment.findMany({ where: { organizationId }, select: { id: true, jobSiteId: true, workerId: true, assignedById: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: { createdAt: "asc" } }),
    ]);

    const exportedAt = new Date().toISOString();
    const response: DataExportResponse = {
      exportedAt,
      organization: { ...organization, createdAt: organization.createdAt.toISOString(), updatedAt: organization.updatedAt.toISOString() },
      counts: inventory.counts,
      workers: workers.map((worker) => ({ ...worker, createdAt: worker.createdAt.toISOString(), updatedAt: worker.updatedAt.toISOString(), archivedAt: iso(worker.archivedAt) })),
      jobSites: jobSites.map((jobSite) => ({ ...jobSite, startDate: iso(jobSite.startDate), endDate: iso(jobSite.endDate), createdAt: jobSite.createdAt.toISOString(), updatedAt: jobSite.updatedAt.toISOString(), archivedAt: iso(jobSite.archivedAt) })),
      documents: documents.map((document) => ({ ...document, expiryDate: iso(document.expiryDate), reviewedAt: iso(document.reviewedAt), createdAt: document.createdAt.toISOString(), updatedAt: document.updatedAt.toISOString(), archivedAt: iso(document.archivedAt) })),
      documentVersions: documentVersions.map((version) => ({ ...version, createdAt: version.createdAt.toISOString(), archivedAt: iso(version.archivedAt) })),
      deadlines: deadlines.map((deadline) => ({ ...deadline, dueDate: deadline.dueDate.toISOString(), remindAt: iso(deadline.remindAt), createdAt: deadline.createdAt.toISOString(), updatedAt: deadline.updatedAt.toISOString(), archivedAt: iso(deadline.archivedAt) })),
      checklists: checklists.map((checklist) => ({ ...checklist, createdAt: checklist.createdAt.toISOString(), updatedAt: checklist.updatedAt.toISOString(), archivedAt: iso(checklist.archivedAt) })),
      checklistItems: checklistItems.map((item) => ({ ...item, completedAt: iso(item.completedAt), createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() })),
      evidence: evidence.map((item) => ({ ...item, createdAt: item.createdAt.toISOString(), archivedAt: iso(item.archivedAt) })),
      documentPackages: documentPackages.map((documentPackage) => ({ ...documentPackage, createdAt: documentPackage.createdAt.toISOString(), updatedAt: documentPackage.updatedAt.toISOString(), archivedAt: iso(documentPackage.archivedAt) })),
      documentPackageItems: documentPackageItems.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
      shareLinks: shareLinks.map((link) => ({ ...link, expiresAt: iso(link.expiresAt), revokedAt: iso(link.revokedAt), createdAt: link.createdAt.toISOString(), lastAccessedAt: iso(link.lastAccessedAt) })),
      notifications: notifications.map((notification) => ({ ...notification, readAt: iso(notification.readAt), dismissedAt: iso(notification.dismissedAt), createdAt: notification.createdAt.toISOString(), updatedAt: notification.updatedAt.toISOString() })),
      notificationPreferences: notificationPreferences.map((preference) => ({ ...preference, lastDigestSentAt: iso(preference.lastDigestSentAt), createdAt: preference.createdAt.toISOString(), updatedAt: preference.updatedAt.toISOString() })),
      emailDeliveries: emailDeliveries.map((delivery) => ({ ...delivery, sentAt: iso(delivery.sentAt), createdAt: delivery.createdAt.toISOString() })),
      auditEvents: auditEvents.map(auditEvent),
      assignments: {
        workerUserLinks: workerUserLinks.map((link) => ({ ...link, createdAt: link.createdAt.toISOString(), updatedAt: link.updatedAt.toISOString(), archivedAt: iso(link.archivedAt) })),
        jobSiteUserAssignments: jobSiteUserAssignments.map((assignment) => ({ ...assignment, createdAt: assignment.createdAt.toISOString(), updatedAt: assignment.updatedAt.toISOString(), archivedAt: iso(assignment.archivedAt) })),
        jobSiteWorkerAssignments: jobSiteWorkerAssignments.map((assignment) => ({ ...assignment, createdAt: assignment.createdAt.toISOString(), updatedAt: assignment.updatedAt.toISOString(), archivedAt: iso(assignment.archivedAt) })),
      },
    };

    return response;
}

export async function buildDataExport(): Promise<DataExportResponse> {
  const { context, organizationId, actorRole } = await requireDataControlAccess();
  try {
    const response = await buildDataExportForOrganization(organizationId);

    await recordProductAuditEventBestEffort({
      organizationId,
      ...auditActorFromContext(context, actorRole),
      action: "DATA_EXPORT_GENERATED",
      entityType: "ORGANIZATION",
      entityId: organizationId,
      metadata: { reasonCode: "metadata-export", scanned: JSON.stringify(response).length },
    });

    return response;
  } catch (error) {
    await recordProductAuditEventBestEffort({
      organizationId,
      ...auditActorFromContext(context, actorRole),
      action: "DATA_EXPORT_FAILED",
      entityType: "ORGANIZATION",
      entityId: organizationId,
      outcome: "FAILED",
      metadata: { reasonCode: "metadata-export-failed", failed: 1 },
    });
    throw error;
  }
}
