import "server-only";
import { db } from "@qoovex/db";
import type { DataExportResponse } from "@qoovex/types";

export async function buildDataExportForOrganization(organizationId: string, generatedAt = new Date()): Promise<DataExportResponse> {
  const organization = await db.organization.findUnique({ where: { id: organizationId }, select: { id: true, name: true, code: true, createdAt: true, updatedAt: true, profile: true, contacts: { where: { archivedAt: null }, orderBy: { createdAt: "asc" } } } });
  if (!organization) throw new Error("Organizzazione non trovata.");
  const members = await db.organizationMembership.findMany({ where: { organizationId }, select: { id: true, userId: true, role: true, preset: true, permissionKeys: true, scopeMode: true, expiresAt: true, createdAt: true, updatedAt: true, revokedAt: true, user: { select: { email: true, firstName: true, lastName: true, username: true } } }, orderBy: { createdAt: "asc" } });
  const [workers, jobSites, workerUserLinks, jobSiteParticipants, jobSiteWorkerAssignments, documents, documentVersions, documentJobSiteLinks, evidence, evidenceRevisions, notifications, auditEvents, invitations, dataControlJobs, supportSessions, supportEvents] = await Promise.all([
    db.worker.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
    db.jobSite.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
    db.workerUserLink.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
    db.jobSiteParticipant.findMany({ where: { organizationId }, select: { id: true, organizationId: true, jobSiteId: true, userId: true, membershipId: true, kind: true, status: true, publicRoleLabel: true, invitedAt: true, activatedAt: true, suspendedAt: true, endedAt: true, revokedAt: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: "asc" } }),
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
  const [clientInvitations, authorityGrants, agreements, steps, timeline, attachments, requests, proposals, paymentProfiles, paymentRequests, disputes, closures, postClosureRequests, reopeningProposals, exports, legalHolds, actionReceipts, processes, notificationPreferences, notificationDeliveries] = await Promise.all([
    db.jobSiteClientInvitation.findMany({ where: { organizationId }, select: { id: true, jobSiteId: true, emailNormalized: true, status: true, invitedByUserId: true, expiresAt: true, acceptedAt: true, revokedAt: true, supersededAt: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: "asc" } }),
    db.jobSiteAuthorityGrant.findMany({ where: { organizationId }, select: { id: true, jobSiteId: true, participantId: true, capability: true, status: true, grantedByUserId: true, revokedByUserId: true, expiresAt: true, revokedAt: true, reason: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: "asc" } }),
    db.jobSiteInitialAgreement.findMany({ where: { organizationId }, include: { versions: { include: { consents: true }, orderBy: { version: "asc" } } }, orderBy: { createdAt: "asc" } }),
    db.jobSiteStep.findMany({ where: { organizationId }, include: { userAssignments: true, workerAssignments: true }, orderBy: [{ jobSiteId: "asc" }, { sortOrder: "asc" }] }),
    db.jobSiteTimelineEvent.findMany({ where: { organizationId }, include: { references: true, attachments: { select: { attachmentId: true, createdAt: true } } }, orderBy: [{ jobSiteId: "asc" }, { sequence: "asc" }] }),
    db.jobSiteAttachment.findMany({ where: { organizationId }, select: { id: true, jobSiteId: true, category: true, sourceKind: true, sourceId: true, originalFileName: true, mimeType: true, size: true, checksumSha256: true, uploadedByUserId: true, createdAt: true, archivedAt: true, publications: { select: { id: true, eventId: true, audience: true, disclosure: true, publishedByUserId: true, createdAt: true, withdrawnAt: true } } }, orderBy: { createdAt: "asc" } }),
    db.jobSiteRequest.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
    db.jobSiteChangeProposal.findMany({ where: { organizationId }, include: { versions: { include: { effects: true, consents: true }, orderBy: { version: "asc" } } }, orderBy: { createdAt: "asc" } }),
    db.organizationPaymentProfile.findMany({ where: { organizationId }, select: { id: true, currentVersionId: true, revision: true, createdAt: true, updatedAt: true, archivedAt: true, versions: { select: { id: true, version: true, accountHolder: true, ibanLast4: true, fingerprint: true, createdByUserId: true, createdAt: true } } } }),
    db.jobSitePaymentRequest.findMany({ where: { organizationId }, include: { stepLinks: true, proposalLinks: true, transferDeclarations: true, reviews: true }, orderBy: { createdAt: "asc" } }),
    db.jobSiteDispute.findMany({ where: { organizationId }, include: { references: true, consents: true, preservations: true }, orderBy: { openedAt: "asc" } }),
    db.jobSiteClosure.findMany({ where: { organizationId }, include: { consents: true }, orderBy: { proposedAt: "asc" } }),
    db.jobSitePostClosureRequest.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
    db.jobSiteReopeningProposal.findMany({ where: { organizationId }, include: { consents: true }, orderBy: { proposedAt: "asc" } }),
    db.jobSiteExport.findMany({ where: { organizationId }, select: { id: true, jobSiteId: true, audience: true, status: true, requestedByUserId: true, requestedByParticipantId: true, schemaVersion: true, size: true, checksumSha256: true, availableUntil: true, errorCode: true, createdAt: true, updatedAt: true, completedAt: true }, orderBy: { createdAt: "asc" } }),
    db.legalHold.findMany({ where: { organizationId }, orderBy: { placedAt: "asc" } }),
    db.jobSiteActionReceipt.findMany({ where: { organizationId }, select: { id: true, jobSiteId: true, action: true, result: true, actorUserId: true, actorParticipantId: true, expectedRevision: true, resultingRevision: true, createdAt: true }, orderBy: { createdAt: "asc" } }),
    db.jobSiteProcess.findMany({ where: { organizationId }, select: { id: true, jobSiteId: true, definitionKey: true, status: true, attemptCount: true, maxAttempts: true, nextAttemptAt: true, completedAt: true, createdAt: true, updatedAt: true, steps: true, events: true }, orderBy: { createdAt: "asc" } }),
    db.notificationPreference.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
    db.notificationDelivery.findMany({ where: { organizationId }, select: { id: true, userId: true, notificationId: true, channel: true, status: true, templateKey: true, attemptCount: true, nextAttemptAt: true, sentAt: true, failedAt: true, errorCode: true, createdAt: true }, orderBy: { createdAt: "asc" } }),
  ]);
  const vnext = { clientInvitations, authorityGrants, agreements, steps, timeline, attachments, requests, proposals, paymentProfiles, paymentRequests, disputes, closures, postClosureRequests, reopeningProposals, exports, legalHolds, actionReceipts, processes, notificationPreferences, notificationDeliveries };
  return { generatedAt: generatedAt.toISOString(), organization, members, workers, jobSites, workerUserLinks, jobSiteParticipants, jobSiteWorkerAssignments, documents, documentVersions, documentJobSiteLinks, evidence, evidenceRevisions, notifications, auditEvents, invitations, dataControlJobs, supportSessions, supportEvents, vnext } as unknown as DataExportResponse;
}
