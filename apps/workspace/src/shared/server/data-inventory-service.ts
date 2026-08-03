import "server-only";

import { db } from "@qoovex/db";
import type { DataInventoryResponse, DataRecordCount, FoundationDataInventoryCounts } from "@qoovex/types";
import { requireDataControlAccess } from "./data-control-access";

async function archived(model: { count(args: { where: Record<string, unknown> }): Promise<number> }, organizationId: string): Promise<DataRecordCount> {
  const [total, active] = await Promise.all([model.count({ where: { organizationId } }), model.count({ where: { organizationId, archivedAt: null } })]);
  return { total, active, archived: total - active };
}

async function total(model: { count(args: { where: Record<string, unknown> }): Promise<number> }, organizationId: string): Promise<DataRecordCount> {
  return { total: await model.count({ where: { organizationId } }) };
}

export async function buildDataInventoryForOrganization(organizationId: string, now = new Date()): Promise<DataInventoryResponse> {
  const members = await db.user.findMany({ where: { organizationMemberships: { some: { organizationId } } }, select: { id: true, email: true } });
  const userIds = members.map((value) => value.id);
  const emails = members.map((value) => value.email);
  const counts = {} as FoundationDataInventoryCounts;
  const values = await Promise.all([
    archived(db.worker, organizationId), archived(db.jobSite, organizationId), archived(db.document, organizationId), archived(db.documentVersion, organizationId), archived(db.evidence, organizationId),
    total(db.evidenceRevision, organizationId), total(db.documentJobSiteLink, organizationId), total(db.notification, organizationId), total(db.productAuditEvent, organizationId), archived(db.workerUserLink, organizationId),
    total(db.jobSiteParticipant, organizationId), archived(db.jobSiteWorkerAssignment, organizationId), total(db.jobSiteStep, organizationId), total(db.jobSiteTimelineEvent, organizationId), total(db.jobSiteAttachment, organizationId),
    total(db.jobSiteChangeProposal, organizationId), total(db.jobSitePaymentRequest, organizationId), total(db.jobSiteDispute, organizationId), total(db.jobSiteExport, organizationId), total(db.organizationMembership, organizationId),
    total(db.jobSiteClientInvitation, organizationId), db.clientProperty.count({ where: { jobSites: { some: { organizationId } } } }).then((total) => ({ total })), total(db.clientPropertyJobSiteLink, organizationId), total(db.jobSiteAuthorityGrant, organizationId),
    total(db.jobSiteInitialAgreement, organizationId), db.jobSiteInitialAgreementVersion.count({ where: { agreement: { organizationId } } }).then((total) => ({ total })), db.jobSiteInitialAgreementConsent.count({ where: { version: { agreement: { organizationId } } } }).then((total) => ({ total })),
    db.jobSiteStepUserAssignment.count({ where: { step: { organizationId } } }).then((total) => ({ total })), db.jobSiteStepWorkerAssignment.count({ where: { step: { organizationId } } }).then((total) => ({ total })), db.jobSiteTimelineArtifactReference.count({ where: { event: { organizationId } } }).then((total) => ({ total })),
    db.jobSiteAttachmentPublication.count({ where: { attachment: { organizationId } } }).then((total) => ({ total })), db.jobSiteTimelineEventAttachment.count({ where: { attachment: { organizationId } } }).then((total) => ({ total })), total(db.jobSiteRequest, organizationId),
    db.jobSiteChangeProposalVersion.count({ where: { proposal: { organizationId } } }).then((total) => ({ total })), db.jobSiteChangeProposalEffect.count({ where: { version: { proposal: { organizationId } } } }).then((total) => ({ total })), db.jobSiteChangeProposalConsent.count({ where: { version: { proposal: { organizationId } } } }).then((total) => ({ total })),
    total(db.organizationPaymentProfile, organizationId), db.organizationPaymentProfileVersion.count({ where: { profile: { organizationId } } }).then((total) => ({ total })), db.jobSitePaymentTransferDeclaration.count({ where: { paymentRequest: { organizationId } } }).then((total) => ({ total })), db.jobSitePaymentReview.count({ where: { paymentRequest: { organizationId } } }).then((total) => ({ total })),
    db.jobSiteDisputeArtifactReference.count({ where: { dispute: { organizationId } } }).then((total) => ({ total })), db.jobSiteDisputeConsent.count({ where: { dispute: { organizationId } } }).then((total) => ({ total })), db.jobSiteDisputePreservation.count({ where: { dispute: { organizationId } } }).then((total) => ({ total })), total(db.jobSiteClosure, organizationId),
    db.jobSiteClosureConsent.count({ where: { closure: { organizationId } } }).then((total) => ({ total })), total(db.jobSitePostClosureRequest, organizationId), total(db.jobSiteReopeningProposal, organizationId), db.jobSiteReopeningConsent.count({ where: { proposal: { organizationId } } }).then((total) => ({ total })),
    db.jobSiteExportAccessLink.count({ where: { export: { organizationId } } }).then((total) => ({ total })), db.jobSiteExportDownloadGrant.count({ where: { export: { organizationId } } }).then((total) => ({ total })), total(db.legalHold, organizationId), total(db.jobSiteActionReceipt, organizationId), total(db.jobSiteProcess, organizationId),
    db.jobSiteProcessStep.count({ where: { process: { organizationId } } }).then((total) => ({ total })), db.jobSiteProcessEvent.count({ where: { process: { organizationId } } }).then((total) => ({ total })), total(db.notificationPreference, organizationId), total(db.notificationDelivery, organizationId),
    total(db.organizationInvitation, organizationId), total(db.dataControlJob, organizationId), total(db.supportSession, organizationId), total(db.supportAuditEvent, organizationId),
    db.account.count({ where: { userId: { in: userIds } } }).then((total) => ({ total })), db.session.count({ where: { userId: { in: userIds } } }).then((total) => ({ total })),
    db.userCredential.count({ where: { userId: { in: userIds } } }).then((total) => ({ total })), db.authCode.count({ where: { OR: [{ userId: { in: userIds } }, { email: { in: emails } }] } }).then((total) => ({ total })),
    db.mfaRecoveryRequest.count({ where: { OR: [{ organizationId }, { userId: { in: userIds } }] } }).then((total) => ({ total })), db.authDevice.count({ where: { userId: { in: userIds } } }).then((total) => ({ total })),
    db.mfaBackupCode.count({ where: { userId: { in: userIds } } }).then((total) => ({ total })), db.securityAuditEvent.count({ where: { OR: [{ userId: { in: userIds } }, { email: { in: emails } }] } }).then((total) => ({ total })),
    db.authRateLimit.count({ where: { userId: { in: userIds } } }).then((total) => ({ total })),
  ]);
  const keys: Array<keyof FoundationDataInventoryCounts> = [
    "workers", "jobSites", "documents", "documentVersions", "evidence", "evidenceRevisions", "documentJobSiteLinks", "notifications", "auditEvents", "workerUserLinks",
    "jobSiteParticipants", "jobSiteWorkerAssignments", "jobSiteSteps", "timelineEvents", "attachments", "changeProposals", "paymentRequests", "disputes", "jobSiteExports", "memberships",
    "clientInvitations", "clientProperties", "clientPropertyLinks", "authorityGrants", "initialAgreements", "initialAgreementVersions", "initialAgreementConsents", "stepUserAssignments", "stepWorkerAssignments", "timelineReferences", "attachmentPublications", "timelineAttachments", "jobSiteRequests", "changeProposalVersions", "changeProposalEffects", "changeProposalConsents", "paymentProfiles", "paymentProfileVersions", "transferDeclarations", "paymentReviews", "disputeReferences", "disputeConsents", "disputePreservations", "closures", "closureConsents", "postClosureRequests", "reopeningProposals", "reopeningConsents", "exportAccessLinks", "exportDownloadGrants", "legalHolds", "actionReceipts", "jobSiteProcesses", "jobSiteProcessSteps", "jobSiteProcessEvents", "notificationPreferences", "notificationDeliveries",
    "invitations", "dataControlJobs", "supportSessions", "supportEvents", "authProviders", "authSessions", "authCredentials", "authCodes", "mfaRecoveryRequests", "authDevices", "mfaBackupCodes", "securityAuditEvents", "authRateLimits",
  ];
  keys.forEach((key, index) => { counts[key] = values[index]; });
  counts.memberProfiles = { total: members.length };
  return { generatedAt: now.toISOString(), counts };
}

export async function getDataInventory() {
  const { organizationId } = await requireDataControlAccess();
  return buildDataInventoryForOrganization(organizationId);
}
