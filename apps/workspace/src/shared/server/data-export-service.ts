import "server-only";
import { db } from "@qoovex/db";
import type { DataExportResponse } from "@qoovex/types";

export async function buildDataExportForOrganization(organizationId: string, generatedAt = new Date()): Promise<DataExportResponse> {
  const organization = await db.organization.findUnique({ where: { id: organizationId }, select: { id: true, name: true, code: true, createdAt: true, updatedAt: true, profile: true, contacts: { where: { archivedAt: null }, orderBy: { createdAt: "asc" } } } });
  if (!organization) throw new Error("Organizzazione non trovata.");
  const members = await db.organizationMembership.findMany({ where: { organizationId }, select: { id: true, userId: true, role: true, preset: true, permissionKeys: true, scopeMode: true, expiresAt: true, createdAt: true, updatedAt: true, revokedAt: true, user: { select: { email: true, firstName: true, lastName: true, username: true } } }, orderBy: { createdAt: "asc" } });
  const [workers, jobSites, workerUserLinks, jobSiteUserAssignments, jobSiteWorkerAssignments, documents, documentVersions, documentJobSiteLinks, evidence, evidenceRevisions, notifications, auditEvents, invitations, dataControlJobs, supportSessions, supportEvents] = await Promise.all([
    db.worker.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
    db.jobSite.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
    db.workerUserLink.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
    db.jobSiteUserAssignment.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
    db.jobSiteWorkerAssignment.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
    db.document.findMany({ where: { organizationId }, select: { id: true, organizationId: true, currentVersionId: true, ownerType: true, workerId: true, jobSiteId: true, title: true, notes: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: { createdAt: "asc" } }),
    db.documentVersion.findMany({ where: { organizationId }, select: { id: true, organizationId: true, documentId: true, originalFileName: true, mimeType: true, size: true, checksum: true, uploadedById: true, createdAt: true, archivedAt: true }, orderBy: { createdAt: "asc" } }),
    db.documentJobSiteLink.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
    db.evidence.findMany({ where: { organizationId }, select: { id: true, organizationId: true, jobSiteId: true, workerId: true, type: true, title: true, description: true, capturedAt: true, originalFileName: true, mimeType: true, size: true, createdById: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: { createdAt: "asc" } }),
    db.evidenceRevision.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
    db.notification.findMany({ where: { organizationId }, select: { id: true, userId: true, type: true, severity: true, title: true, message: true, sourceType: true, sourceId: true, readAt: true, dismissedAt: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: "asc" } }),
    db.productAuditEvent.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
    db.organizationInvitation.findMany({ where: { organizationId }, select: { id: true, workerId: true, email: true, recipientName: true, role: true, preset: true, permissionKeys: true, scopeMode: true, invitedById: true, expiresAt: true, acceptedAt: true, declinedAt: true, revokedAt: true, accessExpiresAt: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: "asc" } }),
    db.dataControlJob.findMany({ where: { organizationId }, select: { id: true, requestedById: true, type: true, status: true, attemptCount: true, nextAttemptAt: true, resultSummary: true, errorCode: true, createdAt: true, startedAt: true, completedAt: true }, orderBy: { createdAt: "asc" } }),
    db.supportSession.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
    db.supportAuditEvent.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
  ]);
  return { generatedAt: generatedAt.toISOString(), organization, memberships: members, workers, jobSites, workerUserLinks, jobSiteUserAssignments, jobSiteWorkerAssignments, documents, documentVersions, documentJobSiteLinks, evidence, evidenceRevisions, notifications, auditEvents, invitations, dataControlJobs, supportSessions, supportEvents } as unknown as DataExportResponse;
}
