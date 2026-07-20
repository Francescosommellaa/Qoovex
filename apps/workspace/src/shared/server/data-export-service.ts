import "server-only";

import { db } from "@qoovex/db";
import type { AuditLogEventResponse, AuditMetadata, DataExportResponse } from "@qoovex/types";
import { auditActorFromContext, recordProductAuditEventBestEffort, sanitizeAuditMetadata } from "./product-audit-service";
import { requireDataControlAccess } from "./data-control-access";
import { buildDataInventoryForOrganization } from "./data-inventory-service";

function iso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

const EXPORT_SENSITIVE_METADATA_PARTS = [
  "password", "secret", "token", "hash", "blob", "pathname", "url", "emailbody", "filecontent",
  "credential", "totp", "otp", "backupcode", "sessiontoken", "providerkey",
];

function sanitizeExportMetadata(value: unknown): AuditMetadata | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const output: AuditMetadata = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    const normalizedKey = key.toLowerCase();
    if (EXPORT_SENSITIVE_METADATA_PARTS.some((part) => normalizedKey.includes(part))) continue;
    if (item === null || typeof item === "string" || typeof item === "boolean") output[key] = item;
    else if (typeof item === "number" && Number.isFinite(item)) output[key] = item;
    else if (item instanceof Date) output[key] = item.toISOString();
  }
  return Object.keys(output).length ? output : null;
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
  const memberProfiles = await db.user.findMany({
    where: { organizationMembership: { is: { organizationId } } },
    select: {
      id: true, name: true, email: true, emailVerified: true, firstName: true, lastName: true, username: true,
      usernameOnboarded: true, profileOnboarded: true, avatarBlobPathname: true, phoneNumber: true,
      platformRole: true, authVersion: true, suspendedAt: true, suspensionReason: true, mfaEnabled: true,
      totpPendingCreatedAt: true, totpVerifiedAt: true, usernameChangedAt: true, createdAt: true, updatedAt: true,
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  const memberUserIds = memberProfiles.map((member) => member.id);
  const memberEmails = memberProfiles.map((member) => member.email);
  const memberWhere = { in: memberUserIds };

  const [
    organization, memberships, invitations, documentTypes, documentRequirements, workers, jobSites, documents,
    documentVersions, deadlines, calendarEvents, checklists, checklistItems, evidence, documentPackages, documentPackageItems,
    shareLinks, notifications, notificationPreferences, emailDeliveries, auditEvents, dataControlJobs,
    supportSessions, supportEvents, providers, authSessions, credentials, authCodes, mfaRecoveryRequests,
    authDevices, backupCodes, securityEvents, authRateLimits, workerUserLinks, jobSiteUserAssignments,
    jobSiteWorkerAssignments,
  ] = await Promise.all([
    db.organization.findUniqueOrThrow({ where: { id: organizationId }, select: { id: true, name: true, code: true, createdById: true, createdAt: true, updatedAt: true } }),
    db.organizationMembership.findMany({ where: { organizationId }, select: { id: true, userId: true, role: true, createdAt: true, updatedAt: true, revokedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.organizationInvitation.findMany({ where: { organizationId }, select: { id: true, email: true, role: true, invitedById: true, expiresAt: true, acceptedAt: true, revokedAt: true, createdAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.documentType.findMany({ where: { organizationId }, select: { id: true, organizationId: true, name: true, description: true, appliesTo: true, requiresExpiryDate: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.documentRequirement.findMany({ where: { organizationId }, select: { id: true, organizationId: true, name: true, description: true, targetType: true, documentTypeId: true, jobSiteId: true, isRequired: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.worker.findMany({ where: { organizationId }, select: { id: true, organizationId: true, displayName: true, email: true, phone: true, roleLabel: true, status: true, notes: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.jobSite.findMany({ where: { organizationId }, select: { id: true, organizationId: true, name: true, address: true, clientName: true, status: true, startDate: true, endDate: true, notes: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.document.findMany({ where: { organizationId }, select: { id: true, organizationId: true, documentTypeId: true, ownerType: true, workerId: true, jobSiteId: true, title: true, status: true, expiryDate: true, notes: true, reviewedAt: true, reviewedById: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.documentVersion.findMany({ where: { organizationId }, select: { id: true, organizationId: true, documentId: true, originalFileName: true, mimeType: true, size: true, checksum: true, uploadedById: true, createdAt: true, archivedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.deadline.findMany({ where: { organizationId }, select: { id: true, organizationId: true, title: true, dueDate: true, sourceType: true, documentId: true, workerId: true, jobSiteId: true, status: true, remindAt: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.calendarEvent.findMany({ where: { organizationId }, select: { id: true, organizationId: true, title: true, description: true, startAt: true, endAt: true, allDay: true, kind: true, priority: true, status: true, source: true, externalUid: true, assignedToId: true, jobSiteId: true, createdById: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.checklist.findMany({ where: { organizationId }, select: { id: true, organizationId: true, jobSiteId: true, name: true, description: true, status: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.checklistItem.findMany({ where: { organizationId }, select: { id: true, organizationId: true, checklistId: true, label: true, description: true, status: true, completedAt: true, completedById: true, createdAt: true, updatedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.evidence.findMany({ where: { organizationId }, select: { id: true, organizationId: true, jobSiteId: true, workerId: true, checklistItemId: true, type: true, title: true, description: true, originalFileName: true, mimeType: true, size: true, createdById: true, createdAt: true, archivedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.documentPackage.findMany({ where: { organizationId }, select: { id: true, organizationId: true, jobSiteId: true, title: true, description: true, status: true, createdById: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.documentPackageItem.findMany({ where: { organizationId }, select: { id: true, organizationId: true, documentPackageId: true, itemType: true, documentId: true, documentVersionId: true, evidenceId: true, checklistId: true, note: true, position: true, createdAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.shareLink.findMany({ where: { organizationId }, select: { id: true, organizationId: true, documentPackageId: true, expiresAt: true, revokedAt: true, createdById: true, createdAt: true, lastAccessedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.notification.findMany({ where: { organizationId }, select: { id: true, userId: true, type: true, severity: true, title: true, message: true, sourceType: true, sourceId: true, actionHref: true, readAt: true, dismissedAt: true, createdAt: true, updatedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.notificationPreference.findMany({ where: { organizationId }, select: { id: true, userId: true, emailDigestEnabled: true, emailDigestFrequency: true, emailDigestHour: true, deadlineNotificationsEnabled: true, documentNotificationsEnabled: true, packageNotificationsEnabled: true, systemNotificationsEnabled: true, lastDigestSentAt: true, createdAt: true, updatedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.notificationEmailDelivery.findMany({ where: { organizationId }, select: { id: true, userId: true, recipientEmail: true, notificationId: true, type: true, notificationCount: true, status: true, errorCode: true, sentAt: true, createdAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.productAuditEvent.findMany({ where: { organizationId }, select: { id: true, actorUserId: true, actorRole: true, action: true, entityType: true, entityId: true, outcome: true, metadata: true, requestId: true, supportSessionId: true, createdAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.dataControlJob.findMany({ where: { organizationId }, select: { id: true, organizationId: true, requestedById: true, type: true, status: true, attemptCount: true, nextAttemptAt: true, resultSummary: true, errorCode: true, createdAt: true, startedAt: true, completedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.supportSession.findMany({ where: { organizationId }, select: { id: true, actorId: true, reason: true, expiresAt: true, sensitiveConfirmedUntil: true, endedAt: true, createdAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.supportAuditEvent.findMany({ where: { organizationId }, select: { id: true, supportSessionId: true, actorId: true, action: true, resourceType: true, resourceId: true, metadata: true, createdAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.account.findMany({ where: { userId: memberWhere }, select: { userId: true, type: true, provider: true }, orderBy: [{ userId: "asc" }, { provider: "asc" }] }),
    db.session.findMany({ where: { userId: memberWhere }, select: { userId: true, expires: true }, orderBy: [{ expires: "asc" }, { id: "asc" }] }),
    db.userCredential.findMany({ where: { userId: memberWhere }, select: { userId: true, passwordUpdatedAt: true, passwordResetRequired: true, createdAt: true, updatedAt: true }, orderBy: { userId: "asc" } }),
    db.authCode.findMany({ where: { OR: [{ userId: memberWhere }, { email: { in: memberEmails } }] }, select: { id: true, userId: true, email: true, purpose: true, attempts: true, maxAttempts: true, expiresAt: true, consumedAt: true, metadata: true, createdAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.mfaRecoveryRequest.findMany({ where: { OR: [{ organizationId }, { userId: memberWhere }] }, select: { id: true, userId: true, mode: true, status: true, emailVerifiedAt: true, expiresAt: true, approvedById: true, approvedAt: true, deniedById: true, deniedAt: true, setupStartedAt: true, completedAt: true, createdAt: true, updatedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.authDevice.findMany({ where: { userId: memberWhere }, select: { id: true, userId: true, label: true, firstSeenAt: true, lastSeenAt: true, createdAt: true, updatedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.mfaBackupCode.findMany({ where: { userId: memberWhere }, select: { id: true, userId: true, usedAt: true, createdAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.securityAuditEvent.findMany({ where: { OR: [{ userId: memberWhere }, { email: { in: memberEmails } }] }, select: { id: true, userId: true, email: true, type: true, metadata: true, createdAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.authRateLimit.findMany({ where: { userId: memberWhere }, select: { userId: true, bucket: true, count: true, resetAt: true, createdAt: true, updatedAt: true }, orderBy: [{ createdAt: "asc" }, { bucket: "asc" }] }),
    db.workerUserLink.findMany({ where: { organizationId }, select: { id: true, workerId: true, userId: true, linkedById: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.jobSiteUserAssignment.findMany({ where: { organizationId }, select: { id: true, jobSiteId: true, userId: true, assignmentRole: true, assignedById: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.jobSiteWorkerAssignment.findMany({ where: { organizationId }, select: { id: true, jobSiteId: true, workerId: true, assignedById: true, createdAt: true, updatedAt: true, archivedAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    organization: { ...organization, createdAt: organization.createdAt.toISOString(), updatedAt: organization.updatedAt.toISOString() },
    counts: inventory.counts,
    memberProfiles: memberProfiles.map(({ avatarBlobPathname, ...member }) => ({ ...member, emailVerified: iso(member.emailVerified), suspendedAt: iso(member.suspendedAt), totpPendingCreatedAt: iso(member.totpPendingCreatedAt), totpVerifiedAt: iso(member.totpVerifiedAt), usernameChangedAt: iso(member.usernameChangedAt), hasAvatar: Boolean(avatarBlobPathname), createdAt: member.createdAt.toISOString(), updatedAt: member.updatedAt.toISOString() })),
    memberships: memberships.map((item) => ({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), revokedAt: iso(item.revokedAt) })),
    invitations: invitations.map((item) => ({ ...item, expiresAt: item.expiresAt.toISOString(), acceptedAt: iso(item.acceptedAt), revokedAt: iso(item.revokedAt), createdAt: item.createdAt.toISOString() })),
    documentTypes: documentTypes.map((item) => ({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), archivedAt: iso(item.archivedAt) })),
    documentRequirements: documentRequirements.map((item) => ({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), archivedAt: iso(item.archivedAt) })),
    workers: workers.map((item) => ({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), archivedAt: iso(item.archivedAt) })),
    jobSites: jobSites.map((item) => ({ ...item, startDate: iso(item.startDate), endDate: iso(item.endDate), createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), archivedAt: iso(item.archivedAt) })),
    documents: documents.map((item) => ({ ...item, expiryDate: iso(item.expiryDate), reviewedAt: iso(item.reviewedAt), createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), archivedAt: iso(item.archivedAt) })),
    documentVersions: documentVersions.map((item) => ({ ...item, createdAt: item.createdAt.toISOString(), archivedAt: iso(item.archivedAt) })),
    deadlines: deadlines.map((item) => ({ ...item, dueDate: item.dueDate.toISOString(), remindAt: iso(item.remindAt), createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), archivedAt: iso(item.archivedAt) })),
    calendarEvents: calendarEvents.map((item) => ({ ...item, startAt: item.startAt.toISOString(), endAt: item.endAt.toISOString(), createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), archivedAt: iso(item.archivedAt) })),
    checklists: checklists.map((item) => ({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), archivedAt: iso(item.archivedAt) })),
    checklistItems: checklistItems.map((item) => ({ ...item, completedAt: iso(item.completedAt), createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() })),
    evidence: evidence.map((item) => ({ ...item, hasFile: Boolean(item.originalFileName || item.mimeType || item.size), createdAt: item.createdAt.toISOString(), archivedAt: iso(item.archivedAt) })),
    documentPackages: documentPackages.map((item) => ({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), archivedAt: iso(item.archivedAt) })),
    documentPackageItems: documentPackageItems.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
    shareLinks: shareLinks.map((item) => ({ ...item, expiresAt: iso(item.expiresAt), revokedAt: iso(item.revokedAt), createdAt: item.createdAt.toISOString(), lastAccessedAt: iso(item.lastAccessedAt) })),
    notifications: notifications.map((item) => ({ ...item, readAt: iso(item.readAt), dismissedAt: iso(item.dismissedAt), createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() })),
    notificationPreferences: notificationPreferences.map((item) => ({ ...item, lastDigestSentAt: iso(item.lastDigestSentAt), createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() })),
    emailDeliveries: emailDeliveries.map((item) => ({ ...item, sentAt: iso(item.sentAt), createdAt: item.createdAt.toISOString() })),
    auditEvents: auditEvents.map(auditEvent),
    dataControlJobs: dataControlJobs.map((item) => ({ ...item, resultSummary: sanitizeExportMetadata(item.resultSummary), nextAttemptAt: item.nextAttemptAt.toISOString(), createdAt: item.createdAt.toISOString(), startedAt: iso(item.startedAt), completedAt: iso(item.completedAt) })),
    supportSessions: supportSessions.map((item) => ({ ...item, expiresAt: item.expiresAt.toISOString(), sensitiveConfirmedUntil: iso(item.sensitiveConfirmedUntil), endedAt: iso(item.endedAt), createdAt: item.createdAt.toISOString() })),
    supportEvents: supportEvents.map((item) => ({ ...item, metadata: sanitizeExportMetadata(item.metadata), createdAt: item.createdAt.toISOString() })),
    auth: {
      providers,
      sessions: authSessions.map((item) => ({ userId: item.userId, expiresAt: item.expires.toISOString() })),
      credentials: credentials.map((item) => ({ ...item, passwordUpdatedAt: item.passwordUpdatedAt.toISOString(), createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() })),
      codes: authCodes.map((item) => ({ ...item, expiresAt: item.expiresAt.toISOString(), consumedAt: iso(item.consumedAt), metadata: sanitizeExportMetadata(item.metadata), createdAt: item.createdAt.toISOString() })),
      mfaRecoveryRequests: mfaRecoveryRequests.map((item) => ({ ...item, emailVerifiedAt: item.emailVerifiedAt.toISOString(), expiresAt: item.expiresAt.toISOString(), approvedAt: iso(item.approvedAt), deniedAt: iso(item.deniedAt), setupStartedAt: iso(item.setupStartedAt), completedAt: iso(item.completedAt), createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() })),
      devices: authDevices.map((item) => ({ ...item, firstSeenAt: item.firstSeenAt.toISOString(), lastSeenAt: item.lastSeenAt.toISOString(), createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() })),
      backupCodes: backupCodes.map((item) => ({ ...item, usedAt: iso(item.usedAt), createdAt: item.createdAt.toISOString() })),
      securityEvents: securityEvents.map((item) => ({ ...item, metadata: sanitizeExportMetadata(item.metadata), createdAt: item.createdAt.toISOString() })),
      rateLimits: authRateLimits.map((item) => ({ ...item, userId: item.userId!, resetAt: item.resetAt.toISOString(), createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() })),
    },
    assignments: {
      workerUserLinks: workerUserLinks.map((item) => ({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), archivedAt: iso(item.archivedAt) })),
      jobSiteUserAssignments: jobSiteUserAssignments.map((item) => ({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), archivedAt: iso(item.archivedAt) })),
      jobSiteWorkerAssignments: jobSiteWorkerAssignments.map((item) => ({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), archivedAt: iso(item.archivedAt) })),
    },
  };
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
