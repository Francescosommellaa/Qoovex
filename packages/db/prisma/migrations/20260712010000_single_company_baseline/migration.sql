-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AuthCodePurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_CHANGE');

-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('USER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'SAFETY_CONSULTANT', 'SITE_MANAGER', 'WORKER');

-- CreateEnum
CREATE TYPE "SupportAuditAction" AS ENUM ('READ', 'WRITE', 'SENSITIVE', 'EXPORT');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('DOCUMENT_CREATED', 'DOCUMENT_UPDATED', 'DOCUMENT_ARCHIVED', 'DOCUMENT_VERSION_UPLOADED', 'DOCUMENT_VERSION_DOWNLOADED', 'DOCUMENT_VERSION_ARCHIVED', 'DEADLINE_CREATED', 'DEADLINE_UPDATED', 'DEADLINE_ARCHIVED', 'WORKER_CREATED', 'WORKER_UPDATED', 'WORKER_ARCHIVED', 'JOB_SITE_CREATED', 'JOB_SITE_UPDATED', 'JOB_SITE_ARCHIVED', 'CHECKLIST_CREATED', 'CHECKLIST_UPDATED', 'CHECKLIST_ARCHIVED', 'CHECKLIST_ITEM_COMPLETED', 'EVIDENCE_CREATED', 'EVIDENCE_DOWNLOADED', 'EVIDENCE_ARCHIVED', 'DOCUMENT_PACKAGE_CREATED', 'DOCUMENT_PACKAGE_UPDATED', 'DOCUMENT_PACKAGE_ARCHIVED', 'DOCUMENT_PACKAGE_ITEM_ADDED', 'DOCUMENT_PACKAGE_ITEM_REMOVED', 'SHARE_LINK_CREATED', 'SHARE_LINK_REVOKED', 'SHARE_LINK_ACCESSED', 'NOTIFICATION_READ', 'NOTIFICATION_DISMISSED', 'EMAIL_DIGEST_SENT', 'EMAIL_DIGEST_FAILED', 'NOTIFICATION_PREFERENCES_UPDATED', 'SCHEDULED_EMAIL_DIGEST_RUN', 'WORKER_USER_LINK_CREATED', 'WORKER_USER_LINK_ARCHIVED', 'JOB_SITE_USER_ASSIGNMENT_CREATED', 'JOB_SITE_USER_ASSIGNMENT_ARCHIVED', 'JOB_SITE_WORKER_ASSIGNMENT_CREATED', 'JOB_SITE_WORKER_ASSIGNMENT_ARCHIVED', 'DATA_EXPORT_GENERATED', 'DATA_EXPORT_FAILED', 'DATA_CONTROL_JOB_CREATED', 'DATA_CONTROL_JOB_RUN', 'ORPHAN_BLOB_CLEANUP_RUN', 'ORGANIZATION_DELETE_REQUESTED', 'ORGANIZATION_DELETE_RUN', 'DOCUMENT_REQUIREMENT_CREATED', 'DOCUMENT_REQUIREMENT_UPDATED', 'DOCUMENT_REQUIREMENT_ARCHIVED', 'SECURITY_DENIED');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('DOCUMENT', 'DOCUMENT_VERSION', 'DEADLINE', 'WORKER', 'JOB_SITE', 'CHECKLIST', 'CHECKLIST_ITEM', 'EVIDENCE', 'DOCUMENT_PACKAGE', 'DOCUMENT_PACKAGE_ITEM', 'SHARE_LINK', 'NOTIFICATION', 'EMAIL_DELIVERY', 'NOTIFICATION_PREFERENCE', 'DATA_CONTROL_JOB', 'DOCUMENT_REQUIREMENT', 'WORKER_USER_LINK', 'JOB_SITE_USER_ASSIGNMENT', 'JOB_SITE_WORKER_ASSIGNMENT', 'ORGANIZATION', 'USER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AuditOutcome" AS ENUM ('SUCCESS', 'DENIED', 'FAILED');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PRESENT', 'MISSING', 'EXPIRED', 'EXPIRING_SOON', 'TO_REVIEW', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DeadlineStatus" AS ENUM ('SCHEDULED', 'EXPIRING_SOON', 'EXPIRED', 'DONE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChecklistItemStatus" AS ENUM ('OPEN', 'DONE', 'TO_REVIEW', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentPackageStatus" AS ENUM ('DRAFT', 'READY_FOR_REVIEW', 'SHARED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentOwnerType" AS ENUM ('ORGANIZATION', 'WORKER', 'JOB_SITE');

-- CreateEnum
CREATE TYPE "DocumentTypeAppliesTo" AS ENUM ('ORGANIZATION', 'WORKER', 'JOB_SITE', 'EVIDENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "RequirementTargetType" AS ENUM ('ORGANIZATION', 'WORKER', 'JOB_SITE');

-- CreateEnum
CREATE TYPE "DeadlineSourceType" AS ENUM ('DOCUMENT', 'CHECKLIST', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('PHOTO', 'FILE', 'NOTE');

-- CreateEnum
CREATE TYPE "DocumentPackageItemType" AS ENUM ('DOCUMENT', 'DOCUMENT_VERSION', 'EVIDENCE', 'CHECKLIST', 'NOTE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DEADLINE_OVERDUE', 'DEADLINE_UPCOMING', 'DOCUMENT_TO_REVIEW', 'DOCUMENT_EXPIRED', 'DOCUMENT_EXPIRING_SOON', 'PACKAGE_READY_FOR_REVIEW', 'SHARE_LINK_EXPIRING', 'SHARE_LINK_REVOKED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationSeverity" AS ENUM ('INFO', 'ATTENTION', 'WARNING');

-- CreateEnum
CREATE TYPE "NotificationSourceType" AS ENUM ('DOCUMENT', 'DEADLINE', 'WORKER', 'JOB_SITE', 'CHECKLIST', 'EVIDENCE', 'DOCUMENT_PACKAGE', 'SHARE_LINK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "EmailDigestFrequency" AS ENUM ('OFF', 'DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "NotificationEmailDeliveryType" AS ENUM ('DIGEST', 'SINGLE_NOTIFICATION');

-- CreateEnum
CREATE TYPE "NotificationEmailDeliveryStatus" AS ENUM ('SENT', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "JobSiteUserAssignmentRole" AS ENUM ('SITE_MANAGER');

-- CreateEnum
CREATE TYPE "DataControlJobType" AS ENUM ('METADATA_EXPORT', 'ORGANIZATION_DELETE', 'ORPHAN_BLOB_CLEANUP');

-- CreateEnum
CREATE TYPE "DataControlJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "RuntimeErrorStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT,
    "username" TEXT NOT NULL,
    "usernameOnboarded" BOOLEAN NOT NULL DEFAULT true,
    "profileOnboarded" BOOLEAN NOT NULL DEFAULT true,
    "avatarBlobPathname" TEXT,
    "phoneNumber" TEXT,
    "platformRole" "PlatformRole" NOT NULL DEFAULT 'USER',
    "authVersion" INTEGER NOT NULL DEFAULT 1,
    "suspendedAt" TIMESTAMP(3),
    "suspensionReason" TEXT,
    "organizationId" TEXT,
    "organizationRole" "OrganizationRole",
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "totpSecretEncrypted" TEXT,
    "totpSecretNonce" TEXT,
    "totpPendingSecretEncrypted" TEXT,
    "totpPendingSecretNonce" TEXT,
    "totpPendingCreatedAt" TIMESTAMP(3),
    "totpVerifiedAt" TIMESTAMP(3),
    "usernameChangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "roleLabel" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSite" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "clientName" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "JobSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerUserLink" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "linkedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "WorkerUserLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteUserAssignment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignmentRole" "JobSiteUserAssignmentRole" NOT NULL DEFAULT 'SITE_MANAGER',
    "assignedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "JobSiteUserAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteWorkerAssignment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "JobSiteWorkerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentType" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "appliesTo" "DocumentTypeAppliesTo" NOT NULL,
    "requiresExpiryDate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentTypeId" TEXT,
    "ownerType" "DocumentOwnerType" NOT NULL,
    "workerId" TEXT,
    "jobSiteId" TEXT,
    "title" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'TO_REVIEW',
    "expiryDate" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "blobKey" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "checksum" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentRequirement" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetType" "RequirementTargetType" NOT NULL,
    "documentTypeId" TEXT,
    "jobSiteId" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "DocumentRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deadline" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "sourceType" "DeadlineSourceType" NOT NULL,
    "documentId" TEXT,
    "workerId" TEXT,
    "jobSiteId" TEXT,
    "status" "DeadlineStatus" NOT NULL DEFAULT 'SCHEDULED',
    "remindAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Deadline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checklist" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "status" "ChecklistItemStatus" NOT NULL DEFAULT 'OPEN',
    "completedAt" TIMESTAMP(3),
    "completedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT,
    "workerId" TEXT,
    "checklistItemId" TEXT,
    "type" "EvidenceType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "blobKey" TEXT,
    "originalFileName" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentPackage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "DocumentPackageStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "DocumentPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentPackageItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentPackageId" TEXT NOT NULL,
    "itemType" "DocumentPackageItemType" NOT NULL,
    "documentId" TEXT,
    "documentVersionId" TEXT,
    "evidenceId" TEXT,
    "checklistId" TEXT,
    "note" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentPackageItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentPackageId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessedAt" TIMESTAMP(3),

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "NotificationType" NOT NULL,
    "severity" "NotificationSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sourceType" "NotificationSourceType" NOT NULL,
    "sourceId" TEXT,
    "dedupeKey" TEXT NOT NULL,
    "actionHref" TEXT,
    "readAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailDigestEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailDigestFrequency" "EmailDigestFrequency" NOT NULL DEFAULT 'OFF',
    "emailDigestHour" INTEGER NOT NULL DEFAULT 8,
    "deadlineNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "documentNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "packageNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "systemNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastDigestSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataControlJob" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "type" "DataControlJobType" NOT NULL,
    "status" "DataControlJobStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activeKey" TEXT,
    "blobKey" TEXT,
    "resultSummary" JSONB,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "DataControlJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationEmailDelivery" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT,
    "type" "NotificationEmailDeliveryType" NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "notificationCount" INTEGER NOT NULL DEFAULT 0,
    "status" "NotificationEmailDeliveryStatus" NOT NULL,
    "providerMessageId" TEXT,
    "errorCode" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationEmailDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationInvitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportSession" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sensitiveConfirmedUntil" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportAuditEvent" (
    "id" TEXT NOT NULL,
    "supportSessionId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "action" "SupportAuditAction" NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAuditEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorRole" "OrganizationRole",
    "action" "AuditAction" NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" TEXT,
    "outcome" "AuditOutcome" NOT NULL,
    "metadata" JSONB,
    "requestId" TEXT,
    "supportSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCredential" (
    "userId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "passwordResetRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCredential_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "AuthCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "purpose" "AuthCodePurpose" NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthRateLimit" (
    "key" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthRateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "SecurityAuditEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "type" TEXT NOT NULL,
    "ipHash" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuntimeErrorEvent" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "status" "RuntimeErrorStatus" NOT NULL DEFAULT 'OPEN',
    "source" TEXT NOT NULL,
    "routePath" TEXT,
    "requestMethod" TEXT,
    "errorName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stackPreview" TEXT,
    "digest" TEXT,
    "lastRequestId" TEXT,
    "occurrenceCount" INTEGER NOT NULL DEFAULT 1,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "resolutionNote" TEXT,

    CONSTRAINT "RuntimeErrorEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fingerprintHash" TEXT NOT NULL,
    "userAgentHash" TEXT,
    "label" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MfaBackupCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MfaBackupCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_organizationId_organizationRole_idx" ON "User"("organizationId", "organizationRole");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_code_key" ON "Organization"("code");

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name");

-- CreateIndex
CREATE INDEX "Worker_organizationId_status_idx" ON "Worker"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Worker_organizationId_displayName_idx" ON "Worker"("organizationId", "displayName");

-- CreateIndex
CREATE INDEX "Worker_organizationId_email_idx" ON "Worker"("organizationId", "email");

-- CreateIndex
CREATE INDEX "JobSite_organizationId_status_idx" ON "JobSite"("organizationId", "status");

-- CreateIndex
CREATE INDEX "JobSite_organizationId_name_idx" ON "JobSite"("organizationId", "name");

-- CreateIndex
CREATE INDEX "JobSite_organizationId_clientName_idx" ON "JobSite"("organizationId", "clientName");

-- CreateIndex
CREATE INDEX "WorkerUserLink_organizationId_workerId_archivedAt_idx" ON "WorkerUserLink"("organizationId", "workerId", "archivedAt");

-- CreateIndex
CREATE INDEX "WorkerUserLink_organizationId_userId_archivedAt_idx" ON "WorkerUserLink"("organizationId", "userId", "archivedAt");

-- CreateIndex
CREATE INDEX "WorkerUserLink_organizationId_createdAt_idx" ON "WorkerUserLink"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkerUserLink_linkedById_idx" ON "WorkerUserLink"("linkedById");

-- CreateIndex
CREATE INDEX "JobSiteUserAssignment_org_job_role_archived_idx" ON "JobSiteUserAssignment"("organizationId", "jobSiteId", "assignmentRole", "archivedAt");

-- CreateIndex
CREATE INDEX "JobSiteUserAssignment_org_user_role_archived_idx" ON "JobSiteUserAssignment"("organizationId", "userId", "assignmentRole", "archivedAt");

-- CreateIndex
CREATE INDEX "JobSiteUserAssignment_organizationId_createdAt_idx" ON "JobSiteUserAssignment"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "JobSiteUserAssignment_assignedById_idx" ON "JobSiteUserAssignment"("assignedById");

-- CreateIndex
CREATE INDEX "JobSiteWorkerAssignment_org_job_archived_idx" ON "JobSiteWorkerAssignment"("organizationId", "jobSiteId", "archivedAt");

-- CreateIndex
CREATE INDEX "JobSiteWorkerAssignment_org_worker_archived_idx" ON "JobSiteWorkerAssignment"("organizationId", "workerId", "archivedAt");

-- CreateIndex
CREATE INDEX "JobSiteWorkerAssignment_organizationId_createdAt_idx" ON "JobSiteWorkerAssignment"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "JobSiteWorkerAssignment_assignedById_idx" ON "JobSiteWorkerAssignment"("assignedById");

-- CreateIndex
CREATE INDEX "DocumentType_organizationId_appliesTo_idx" ON "DocumentType"("organizationId", "appliesTo");

-- CreateIndex
CREATE INDEX "DocumentType_organizationId_name_idx" ON "DocumentType"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Document_organizationId_status_idx" ON "Document"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Document_organizationId_ownerType_idx" ON "Document"("organizationId", "ownerType");

-- CreateIndex
CREATE INDEX "Document_organizationId_workerId_idx" ON "Document"("organizationId", "workerId");

-- CreateIndex
CREATE INDEX "Document_organizationId_jobSiteId_idx" ON "Document"("organizationId", "jobSiteId");

-- CreateIndex
CREATE INDEX "Document_organizationId_documentTypeId_idx" ON "Document"("organizationId", "documentTypeId");

-- CreateIndex
CREATE INDEX "Document_organizationId_expiryDate_idx" ON "Document"("organizationId", "expiryDate");

-- CreateIndex
CREATE INDEX "DocumentVersion_organizationId_documentId_createdAt_idx" ON "DocumentVersion"("organizationId", "documentId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentVersion_organizationId_uploadedById_idx" ON "DocumentVersion"("organizationId", "uploadedById");

-- CreateIndex
CREATE INDEX "DocumentVersion_organizationId_blobKey_idx" ON "DocumentVersion"("organizationId", "blobKey");

-- CreateIndex
CREATE INDEX "DocumentRequirement_organizationId_targetType_idx" ON "DocumentRequirement"("organizationId", "targetType");

-- CreateIndex
CREATE INDEX "DocumentRequirement_organizationId_documentTypeId_idx" ON "DocumentRequirement"("organizationId", "documentTypeId");

-- CreateIndex
CREATE INDEX "DocumentRequirement_organizationId_jobSiteId_idx" ON "DocumentRequirement"("organizationId", "jobSiteId");

-- CreateIndex
CREATE INDEX "Deadline_organizationId_status_idx" ON "Deadline"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Deadline_organizationId_dueDate_idx" ON "Deadline"("organizationId", "dueDate");

-- CreateIndex
CREATE INDEX "Deadline_organizationId_documentId_idx" ON "Deadline"("organizationId", "documentId");

-- CreateIndex
CREATE INDEX "Deadline_organizationId_workerId_idx" ON "Deadline"("organizationId", "workerId");

-- CreateIndex
CREATE INDEX "Deadline_organizationId_jobSiteId_idx" ON "Deadline"("organizationId", "jobSiteId");

-- CreateIndex
CREATE INDEX "Checklist_organizationId_status_idx" ON "Checklist"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Checklist_organizationId_jobSiteId_idx" ON "Checklist"("organizationId", "jobSiteId");

-- CreateIndex
CREATE INDEX "ChecklistItem_organizationId_checklistId_idx" ON "ChecklistItem"("organizationId", "checklistId");

-- CreateIndex
CREATE INDEX "ChecklistItem_organizationId_status_idx" ON "ChecklistItem"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ChecklistItem_organizationId_completedById_idx" ON "ChecklistItem"("organizationId", "completedById");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_type_idx" ON "Evidence"("organizationId", "type");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_jobSiteId_idx" ON "Evidence"("organizationId", "jobSiteId");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_workerId_idx" ON "Evidence"("organizationId", "workerId");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_checklistItemId_idx" ON "Evidence"("organizationId", "checklistItemId");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_createdAt_idx" ON "Evidence"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentPackage_organizationId_status_idx" ON "DocumentPackage"("organizationId", "status");

-- CreateIndex
CREATE INDEX "DocumentPackage_organizationId_jobSiteId_idx" ON "DocumentPackage"("organizationId", "jobSiteId");

-- CreateIndex
CREATE INDEX "DocumentPackage_organizationId_createdById_idx" ON "DocumentPackage"("organizationId", "createdById");

-- CreateIndex
CREATE INDEX "DocumentPackageItem_organizationId_documentPackageId_positi_idx" ON "DocumentPackageItem"("organizationId", "documentPackageId", "position");

-- CreateIndex
CREATE INDEX "DocumentPackageItem_organizationId_documentId_idx" ON "DocumentPackageItem"("organizationId", "documentId");

-- CreateIndex
CREATE INDEX "DocumentPackageItem_organizationId_documentVersionId_idx" ON "DocumentPackageItem"("organizationId", "documentVersionId");

-- CreateIndex
CREATE INDEX "DocumentPackageItem_organizationId_evidenceId_idx" ON "DocumentPackageItem"("organizationId", "evidenceId");

-- CreateIndex
CREATE INDEX "DocumentPackageItem_organizationId_checklistId_idx" ON "DocumentPackageItem"("organizationId", "checklistId");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_tokenHash_key" ON "ShareLink"("tokenHash");

-- CreateIndex
CREATE INDEX "ShareLink_organizationId_documentPackageId_idx" ON "ShareLink"("organizationId", "documentPackageId");

-- CreateIndex
CREATE INDEX "ShareLink_organizationId_revokedAt_expiresAt_idx" ON "ShareLink"("organizationId", "revokedAt", "expiresAt");

-- CreateIndex
CREATE INDEX "ShareLink_organizationId_createdById_idx" ON "ShareLink"("organizationId", "createdById");

-- CreateIndex
CREATE INDEX "Notification_organizationId_userId_dismissedAt_readAt_idx" ON "Notification"("organizationId", "userId", "dismissedAt", "readAt");

-- CreateIndex
CREATE INDEX "Notification_organizationId_type_sourceType_sourceId_idx" ON "Notification"("organizationId", "type", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "Notification_organizationId_severity_createdAt_idx" ON "Notification"("organizationId", "severity", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_organizationId_dedupeKey_key" ON "Notification"("organizationId", "dedupeKey");

-- CreateIndex
CREATE INDEX "NotificationPreference_organizationId_emailDigestEnabled_emailD" ON "NotificationPreference"("organizationId", "emailDigestEnabled", "emailDigestFrequency");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_updatedAt_idx" ON "NotificationPreference"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_organizationId_userId_key" ON "NotificationPreference"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "DataControlJob_activeKey_key" ON "DataControlJob"("activeKey");

-- CreateIndex
CREATE INDEX "DataControlJob_organizationId_status_createdAt_idx" ON "DataControlJob"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "DataControlJob_organizationId_type_status_idx" ON "DataControlJob"("organizationId", "type", "status");

-- CreateIndex
CREATE INDEX "DataControlJob_status_nextAttemptAt_createdAt_idx" ON "DataControlJob"("status", "nextAttemptAt", "createdAt");

-- CreateIndex
CREATE INDEX "DataControlJob_requestedById_createdAt_idx" ON "DataControlJob"("requestedById", "createdAt");

-- CreateIndex
CREATE INDEX "DataControlJob_blobKey_idx" ON "DataControlJob"("blobKey");

-- CreateIndex
CREATE INDEX "NotificationEmailDelivery_organizationId_userId_createdAt_idx" ON "NotificationEmailDelivery"("organizationId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationEmailDelivery_organizationId_status_createdAt_idx" ON "NotificationEmailDelivery"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationEmailDelivery_organizationId_type_createdAt_idx" ON "NotificationEmailDelivery"("organizationId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationEmailDelivery_notificationId_idx" ON "NotificationEmailDelivery"("notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInvitation_tokenHash_key" ON "OrganizationInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "OrganizationInvitation_organizationId_email_createdAt_idx" ON "OrganizationInvitation"("organizationId", "email", "createdAt");

-- CreateIndex
CREATE INDEX "OrganizationInvitation_email_expiresAt_idx" ON "OrganizationInvitation"("email", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SupportSession_tokenHash_key" ON "SupportSession"("tokenHash");

-- CreateIndex
CREATE INDEX "SupportSession_actorId_endedAt_expiresAt_idx" ON "SupportSession"("actorId", "endedAt", "expiresAt");

-- CreateIndex
CREATE INDEX "SupportSession_organizationId_createdAt_idx" ON "SupportSession"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "SupportAuditEvent_supportSessionId_createdAt_idx" ON "SupportAuditEvent"("supportSessionId", "createdAt");

-- CreateIndex
CREATE INDEX "SupportAuditEvent_organizationId_createdAt_idx" ON "SupportAuditEvent"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "SupportAuditEvent_actorId_createdAt_idx" ON "SupportAuditEvent"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductAuditEvent_organizationId_createdAt_idx" ON "ProductAuditEvent"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductAuditEvent_organizationId_action_createdAt_idx" ON "ProductAuditEvent"("organizationId", "action", "createdAt");

-- CreateIndex
CREATE INDEX "ProductAuditEvent_org_entity_entityId_created_idx" ON "ProductAuditEvent"("organizationId", "entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductAuditEvent_organizationId_outcome_createdAt_idx" ON "ProductAuditEvent"("organizationId", "outcome", "createdAt");

-- CreateIndex
CREATE INDEX "ProductAuditEvent_actorUserId_createdAt_idx" ON "ProductAuditEvent"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductAuditEvent_supportSessionId_createdAt_idx" ON "ProductAuditEvent"("supportSessionId", "createdAt");

-- CreateIndex
CREATE INDEX "AuthCode_email_purpose_createdAt_idx" ON "AuthCode"("email", "purpose", "createdAt");

-- CreateIndex
CREATE INDEX "AuthCode_userId_purpose_createdAt_idx" ON "AuthCode"("userId", "purpose", "createdAt");

-- CreateIndex
CREATE INDEX "AuthCode_expiresAt_idx" ON "AuthCode"("expiresAt");

-- CreateIndex
CREATE INDEX "AuthRateLimit_bucket_resetAt_idx" ON "AuthRateLimit"("bucket", "resetAt");

-- CreateIndex
CREATE INDEX "SecurityAuditEvent_userId_createdAt_idx" ON "SecurityAuditEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityAuditEvent_email_createdAt_idx" ON "SecurityAuditEvent"("email", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityAuditEvent_type_createdAt_idx" ON "SecurityAuditEvent"("type", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RuntimeErrorEvent_fingerprint_key" ON "RuntimeErrorEvent"("fingerprint");

-- CreateIndex
CREATE INDEX "RuntimeErrorEvent_status_lastSeenAt_idx" ON "RuntimeErrorEvent"("status", "lastSeenAt");

-- CreateIndex
CREATE INDEX "RuntimeErrorEvent_source_lastSeenAt_idx" ON "RuntimeErrorEvent"("source", "lastSeenAt");

-- CreateIndex
CREATE INDEX "RuntimeErrorEvent_resolvedById_resolvedAt_idx" ON "RuntimeErrorEvent"("resolvedById", "resolvedAt");

-- CreateIndex
CREATE INDEX "AuthDevice_userId_lastSeenAt_idx" ON "AuthDevice"("userId", "lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "AuthDevice_userId_fingerprintHash_key" ON "AuthDevice"("userId", "fingerprintHash");

-- CreateIndex
CREATE INDEX "MfaBackupCode_userId_usedAt_idx" ON "MfaBackupCode"("userId", "usedAt");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSite" ADD CONSTRAINT "JobSite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerUserLink" ADD CONSTRAINT "WorkerUserLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerUserLink" ADD CONSTRAINT "WorkerUserLink_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerUserLink" ADD CONSTRAINT "WorkerUserLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerUserLink" ADD CONSTRAINT "WorkerUserLink_linkedById_fkey" FOREIGN KEY ("linkedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteUserAssignment" ADD CONSTRAINT "JobSiteUserAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteUserAssignment" ADD CONSTRAINT "JobSiteUserAssignment_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteUserAssignment" ADD CONSTRAINT "JobSiteUserAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteUserAssignment" ADD CONSTRAINT "JobSiteUserAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteWorkerAssignment" ADD CONSTRAINT "JobSiteWorkerAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteWorkerAssignment" ADD CONSTRAINT "JobSiteWorkerAssignment_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteWorkerAssignment" ADD CONSTRAINT "JobSiteWorkerAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteWorkerAssignment" ADD CONSTRAINT "JobSiteWorkerAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentType" ADD CONSTRAINT "DocumentType_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequirement" ADD CONSTRAINT "DocumentRequirement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequirement" ADD CONSTRAINT "DocumentRequirement_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequirement" ADD CONSTRAINT "DocumentRequirement_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ChecklistItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackage" ADD CONSTRAINT "DocumentPackage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackage" ADD CONSTRAINT "DocumentPackage_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackage" ADD CONSTRAINT "DocumentPackage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_documentPackageId_fkey" FOREIGN KEY ("documentPackageId") REFERENCES "DocumentPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_documentVersionId_fkey" FOREIGN KEY ("documentVersionId") REFERENCES "DocumentVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_documentPackageId_fkey" FOREIGN KEY ("documentPackageId") REFERENCES "DocumentPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataControlJob" ADD CONSTRAINT "DataControlJob_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEmailDelivery" ADD CONSTRAINT "NotificationEmailDelivery_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEmailDelivery" ADD CONSTRAINT "NotificationEmailDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEmailDelivery" ADD CONSTRAINT "NotificationEmailDelivery_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportSession" ADD CONSTRAINT "SupportSession_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportSession" ADD CONSTRAINT "SupportSession_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportAuditEvent" ADD CONSTRAINT "SupportAuditEvent_supportSessionId_fkey" FOREIGN KEY ("supportSessionId") REFERENCES "SupportSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportAuditEvent" ADD CONSTRAINT "SupportAuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportAuditEvent" ADD CONSTRAINT "SupportAuditEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAuditEvent" ADD CONSTRAINT "ProductAuditEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAuditEvent" ADD CONSTRAINT "ProductAuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAuditEvent" ADD CONSTRAINT "ProductAuditEvent_supportSessionId_fkey" FOREIGN KEY ("supportSessionId") REFERENCES "SupportSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCredential" ADD CONSTRAINT "UserCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthCode" ADD CONSTRAINT "AuthCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAuditEvent" ADD CONSTRAINT "SecurityAuditEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuntimeErrorEvent" ADD CONSTRAINT "RuntimeErrorEvent_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthDevice" ADD CONSTRAINT "AuthDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MfaBackupCode" ADD CONSTRAINT "MfaBackupCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

