-- Qoovex vNext starts from an intentionally empty product database.
-- The user explicitly authorized irreversible cleanup of Local, Preview and Production
-- because none of those targets contains real data. Keeping the reset inside this
-- migration makes the one-time rollout deterministic and auditable; later deploys are no-ops.
TRUNCATE TABLE
  "accounts",
  "sessions",
  "verification_tokens",
  "User",
  "Organization",
  "Worker",
  "JobSite",
  "WorkerUserLink",
  "JobSiteUserAssignment",
  "JobSiteWorkerAssignment",
  "DocumentType",
  "Document",
  "DocumentVersion",
  "DocumentRequirement",
  "Deadline",
  "Checklist",
  "ChecklistItem",
  "Evidence",
  "DocumentPackage",
  "DocumentPackageItem",
  "ShareLink",
  "Notification",
  "NotificationPreference",
  "DataControlJob",
  "NotificationEmailDelivery",
  "OrganizationMembership",
  "OrganizationInvitation",
  "SupportSession",
  "SupportAuditEvent",
  "ProductAuditEvent",
  "UserCredential",
  "AuthCode",
  "MfaRecoveryRequest",
  "AuthRateLimit",
  "SecurityAuditEvent",
  "RuntimeErrorEvent",
  "AuthDevice",
  "MfaBackupCode"
RESTART IDENTITY CASCADE;

-- CreateEnum
CREATE TYPE "OrganizationAccessPreset" AS ENUM ('READ_ONLY', 'OPERATIONAL_COLLABORATION', 'SITE_MANAGER', 'DOCUMENT_REVIEWER', 'LIMITED_UPLOAD', 'CUSTOM');

-- CreateEnum
CREATE TYPE "OrganizationScopeMode" AS ENUM ('FULL', 'ASSIGNED');

-- CreateEnum
CREATE TYPE "OrganizationResourceType" AS ENUM ('JOB_SITE', 'WORKER', 'DOCUMENT', 'EVIDENCE');

-- CreateEnum
CREATE TYPE "OrganizationContactKind" AS ENUM ('GENERAL', 'ADMINISTRATION', 'SAFETY', 'TECHNICAL');

-- CreateEnum
CREATE TYPE "JobSiteStatus" AS ENUM ('DRAFT', 'WAITING_FOR_CLIENT', 'PENDING_INITIAL_CONFIRMATION', 'ACTIVE', 'CLOSURE_PROPOSED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "JobSiteParticipantKind" AS ENUM ('ORGANIZATION_MEMBER', 'CLIENT');

-- CreateEnum
CREATE TYPE "JobSiteParticipantStatus" AS ENUM ('INVITED', 'PENDING', 'ACTIVE', 'SUSPENDED', 'ENDED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ClientInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('DRAFT', 'PENDING_CLIENT_CONFIRMATION', 'CONFIRMED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "ConsentDecision" AS ENUM ('ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "JobSiteStepStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'WAITING', 'WORK_COMPLETED', 'CHANGES_REQUESTED', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TimelineAudience" AS ENUM ('INTERNAL', 'SHARED');

-- CreateEnum
CREATE TYPE "TimelineDisclosure" AS ENUM ('GENERAL', 'COMMERCIAL', 'RESTRICTED_COMMERCIAL');

-- CreateEnum
CREATE TYPE "TimelineActorKind" AS ENUM ('ORGANIZATION_MEMBER', 'CLIENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('JOB_SITE_CREATED', 'WORK_UPDATE', 'COMMENT', 'EVIDENCE', 'SHARED_EXPENSE', 'SHARED_DOCUMENT', 'STEP_CREATED', 'STEP_UPDATED', 'STEP_READY_FOR_REVIEW', 'STEP_CONFIRMED', 'STEP_REOPENED', 'CHANGE_PROPOSED', 'CHANGE_COUNTERED', 'CHANGE_ACCEPTED', 'CHANGE_REJECTED', 'CHANGE_WITHDRAWN', 'CLARIFICATION_REQUESTED', 'CLARIFICATION_RESPONDED', 'ISSUE_REPORTED', 'PAYMENT_REQUESTED', 'PAYMENT_TRANSFER_DECLARED', 'PAYMENT_CONFIRMED', 'PAYMENT_DISPUTED', 'CLOSURE_PROPOSED', 'CLOSURE_CONFIRMED', 'POST_CLOSURE_REQUESTED', 'JOB_SITE_REOPENED', 'JOB_SITE_ARCHIVED', 'EXPORT_CREATED', 'SYSTEM_BACKFILL');

-- CreateEnum
CREATE TYPE "AttachmentCategory" AS ENUM ('PHOTO', 'VIDEO', 'DOCUMENT', 'EVIDENCE', 'EXPENSE_RECEIPT', 'PAYMENT_RECEIPT', 'PROPOSAL', 'REQUEST', 'DISPUTE', 'CLOSURE', 'OTHER');

-- CreateEnum
CREATE TYPE "AttachmentSourceKind" AS ENUM ('DOCUMENT_VERSION', 'EVIDENCE', 'DIRECT_UPLOAD');

-- CreateEnum
CREATE TYPE "JobSiteRequestStatus" AS ENUM ('OPEN', 'RESPONDED', 'RESOLVED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "JobSiteRequestType" AS ENUM ('CLARIFICATION', 'INFORMATION', 'WORK_UPDATE', 'DOCUMENT', 'ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "ChangeProposalStatus" AS ENUM ('DRAFT', 'PROPOSED', 'COUNTERED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'SUPERSEDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ChangeEffectType" AS ENUM ('STEP_CREATE', 'STEP_UPDATE', 'STEP_CANCEL', 'STEP_ASSIGN_USER', 'STEP_UNASSIGN_USER', 'STEP_ASSIGN_WORKER', 'STEP_UNASSIGN_WORKER', 'ESTIMATED_COMPLETION_UPDATE', 'COMMERCIAL_DELTA');

-- CreateEnum
CREATE TYPE "AuthorityCapability" AS ENUM ('COMMERCIAL_NEGOTIATE', 'COMMERCIAL_ACCEPT', 'PAYMENT_REQUEST', 'PAYMENT_CONFIRM_RECEIPT', 'CLOSURE_PROPOSE');

-- CreateEnum
CREATE TYPE "AuthorityGrantStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentRequestStatus" AS ENUM ('DRAFT', 'REQUESTED', 'TRANSFER_DECLARED', 'UNDER_REVIEW', 'CONFIRMED', 'DISPUTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentReviewOutcome" AS ENUM ('CONFIRMED_RECEIVED', 'NOT_RECEIVED', 'AMOUNT_MISMATCH', 'CLARIFICATION_REQUIRED');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'IN_DISCUSSION', 'RESOLVED_BY_AGREEMENT', 'WITHDRAWN', 'CLOSED_WITHOUT_AGREEMENT');

-- CreateEnum
CREATE TYPE "ClosureStatus" AS ENUM ('DRAFT', 'PENDING_CLIENT_CONFIRMATION', 'CLIENT_CONFIRMED', 'FINALIZED', 'REJECTED', 'CANCELLED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "PostClosureRequestStatus" AS ENUM ('OPEN', 'IN_DISCUSSION', 'RESOLVED', 'WITHDRAWN', 'CLOSED_WITHOUT_AGREEMENT');

-- CreateEnum
CREATE TYPE "ReopeningStatus" AS ENUM ('PROPOSED', 'COUNTERPARTY_CONFIRMED', 'FINALIZED', 'REJECTED', 'CANCELLED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "JobSiteExportAudience" AS ENUM ('CLIENT', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "JobSiteExportStatus" AS ENUM ('PENDING', 'RUNNING', 'READY', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "LegalHoldStatus" AS ENUM ('ACTIVE', 'RELEASED');

-- CreateEnum
CREATE TYPE "JobSiteProcessStatus" AS ENUM ('PENDING', 'RUNNING', 'WAITING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JobSiteProcessStepStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "JobSiteProcessEventType" AS ENUM ('ENQUEUED', 'CLAIMED', 'STEP_STARTED', 'STEP_COMPLETED', 'STEP_FAILED', 'RETRY_SCHEDULED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL');

-- CreateEnum
CREATE TYPE "NotificationFrequency" AS ENUM ('IMMEDIATE', 'DAILY_DIGEST', 'DISABLED');

-- CreateEnum
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ArtifactReferenceType" AS ENUM ('ATTACHMENT', 'TIMELINE_EVENT', 'STEP', 'REQUEST', 'CHANGE_PROPOSAL', 'PAYMENT_REQUEST', 'DISPUTE', 'CLOSURE', 'EXPORT');

-- AlterEnum
BEGIN;
CREATE TYPE "AuditAction_new" AS ENUM ('DOCUMENT_CREATED', 'DOCUMENT_UPDATED', 'DOCUMENT_ARCHIVED', 'DOCUMENT_VERSION_UPLOADED', 'DOCUMENT_VERSION_DOWNLOADED', 'DOCUMENT_VERSION_ARCHIVED', 'WORKER_CREATED', 'WORKER_UPDATED', 'WORKER_ARCHIVED', 'JOB_SITE_CREATED', 'JOB_SITE_UPDATED', 'JOB_SITE_ARCHIVED', 'EVIDENCE_CREATED', 'EVIDENCE_UPDATED', 'EVIDENCE_DOWNLOADED', 'EVIDENCE_ARCHIVED', 'NOTIFICATION_READ', 'NOTIFICATION_DISMISSED', 'WORKER_USER_LINK_CREATED', 'WORKER_USER_LINK_ARCHIVED', 'JOB_SITE_PARTICIPANT_CREATED', 'JOB_SITE_PARTICIPANT_UPDATED', 'JOB_SITE_PARTICIPANT_ENDED', 'JOB_SITE_WORKER_ASSIGNMENT_CREATED', 'JOB_SITE_WORKER_ASSIGNMENT_ARCHIVED', 'ORGANIZATION_PROFILE_UPDATED', 'ORGANIZATION_CONTACT_CREATED', 'ORGANIZATION_CONTACT_UPDATED', 'ORGANIZATION_CONTACT_ARCHIVED', 'DOCUMENT_JOB_SITE_LINK_CREATED', 'DOCUMENT_JOB_SITE_LINK_ARCHIVED', 'ORGANIZATION_INVITATION_CREATED', 'ORGANIZATION_INVITATION_REVOKED', 'ORGANIZATION_INVITATION_ACCEPTED', 'ORGANIZATION_MEMBERSHIP_REVOKED', 'DATA_EXPORT_GENERATED', 'DATA_EXPORT_FAILED', 'DATA_CONTROL_JOB_CREATED', 'DATA_CONTROL_JOB_RUN', 'ORPHAN_BLOB_CLEANUP_RUN', 'JOB_SITE_ACTION_EXECUTED', 'JOB_SITE_TIMELINE_APPENDED', 'JOB_SITE_ATTACHMENT_DOWNLOADED', 'JOB_SITE_ATTACHMENT_UPLOADED', 'JOB_SITE_AUTHORITY_GRANTED', 'JOB_SITE_AUTHORITY_REVOKED', 'JOB_SITE_EXPORT_DOWNLOADED', 'PAYMENT_PROFILE_UPDATED', 'LEGAL_HOLD_PLACED', 'LEGAL_HOLD_RELEASED', 'SECURITY_DENIED');
ALTER TABLE "ProductAuditEvent" ALTER COLUMN "action" TYPE "AuditAction_new" USING ("action"::text::"AuditAction_new");
ALTER TYPE "AuditAction" RENAME TO "AuditAction_old";
ALTER TYPE "AuditAction_new" RENAME TO "AuditAction";
DROP TYPE "public"."AuditAction_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "AuditEntityType_new" AS ENUM ('DOCUMENT', 'DOCUMENT_VERSION', 'WORKER', 'JOB_SITE', 'EVIDENCE', 'NOTIFICATION', 'DATA_CONTROL_JOB', 'WORKER_USER_LINK', 'JOB_SITE_PARTICIPANT', 'JOB_SITE_WORKER_ASSIGNMENT', 'JOB_SITE_ATTACHMENT', 'JOB_SITE_TIMELINE_EVENT', 'JOB_SITE_CHANGE_PROPOSAL', 'JOB_SITE_PAYMENT_REQUEST', 'JOB_SITE_DISPUTE', 'JOB_SITE_CLOSURE', 'JOB_SITE_EXPORT', 'LEGAL_HOLD', 'ORGANIZATION_PAYMENT_PROFILE', 'ORGANIZATION_INVITATION', 'ORGANIZATION_MEMBERSHIP', 'ORGANIZATION', 'ORGANIZATION_PROFILE', 'ORGANIZATION_CONTACT', 'DOCUMENT_JOB_SITE_LINK', 'EVIDENCE_REVISION', 'USER', 'SYSTEM');
ALTER TABLE "ProductAuditEvent" ALTER COLUMN "entityType" TYPE "AuditEntityType_new" USING ("entityType"::text::"AuditEntityType_new");
ALTER TYPE "AuditEntityType" RENAME TO "AuditEntityType_old";
ALTER TYPE "AuditEntityType_new" RENAME TO "AuditEntityType";
DROP TYPE "public"."AuditEntityType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "DataControlJobType_new" AS ENUM ('METADATA_EXPORT', 'ORPHAN_BLOB_CLEANUP');
ALTER TABLE "DataControlJob" ALTER COLUMN "type" TYPE "DataControlJobType_new" USING ("type"::text::"DataControlJobType_new");
ALTER TYPE "DataControlJobType" RENAME TO "DataControlJobType_old";
ALTER TYPE "DataControlJobType_new" RENAME TO "DataControlJobType";
DROP TYPE "public"."DataControlJobType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationSourceType_new" AS ENUM ('SYSTEM', 'JOB_SITE', 'CHANGE_PROPOSAL', 'PAYMENT_REQUEST', 'DISPUTE', 'EXPORT');
ALTER TABLE "Notification" ALTER COLUMN "sourceType" TYPE "NotificationSourceType_new" USING ("sourceType"::text::"NotificationSourceType_new");
ALTER TYPE "NotificationSourceType" RENAME TO "NotificationSourceType_old";
ALTER TYPE "NotificationSourceType_new" RENAME TO "NotificationSourceType";
DROP TYPE "public"."NotificationSourceType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('SYSTEM', 'JOB_SITE_ACTION_REQUIRED', 'JOB_SITE_ACTIVITY', 'PAYMENT_ACTIVITY', 'DISPUTE_ACTIVITY', 'EXPORT_READY');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrganizationRole_new" AS ENUM ('OWNER', 'COLLABORATOR');
ALTER TABLE "OrganizationMembership" ALTER COLUMN "role" TYPE "OrganizationRole_new" USING ("role"::text::"OrganizationRole_new");
ALTER TABLE "OrganizationInvitation" ALTER COLUMN "role" TYPE "OrganizationRole_new" USING ("role"::text::"OrganizationRole_new");
ALTER TABLE "ProductAuditEvent" ALTER COLUMN "actorRole" TYPE "OrganizationRole_new" USING ("actorRole"::text::"OrganizationRole_new");
ALTER TYPE "OrganizationRole" RENAME TO "OrganizationRole_old";
ALTER TYPE "OrganizationRole_new" RENAME TO "OrganizationRole";
DROP TYPE "public"."OrganizationRole_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PlatformRole_new" AS ENUM ('USER', 'SUPPORT_AGENT', 'PLATFORM_ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "platformRole" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "platformRole" TYPE "PlatformRole_new" USING ("platformRole"::text::"PlatformRole_new");
ALTER TYPE "PlatformRole" RENAME TO "PlatformRole_old";
ALTER TYPE "PlatformRole_new" RENAME TO "PlatformRole";
DROP TYPE "public"."PlatformRole_old";
ALTER TABLE "User" ALTER COLUMN "platformRole" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "CalendarEvent" DROP CONSTRAINT "CalendarEvent_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "CalendarEvent" DROP CONSTRAINT "CalendarEvent_createdById_fkey";

-- DropForeignKey
ALTER TABLE "CalendarEvent" DROP CONSTRAINT "CalendarEvent_jobSiteId_fkey";

-- DropForeignKey
ALTER TABLE "CalendarEvent" DROP CONSTRAINT "CalendarEvent_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Checklist" DROP CONSTRAINT "Checklist_jobSiteId_fkey";

-- DropForeignKey
ALTER TABLE "Checklist" DROP CONSTRAINT "Checklist_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "ChecklistItem" DROP CONSTRAINT "ChecklistItem_checklistId_fkey";

-- DropForeignKey
ALTER TABLE "ChecklistItem" DROP CONSTRAINT "ChecklistItem_completedById_fkey";

-- DropForeignKey
ALTER TABLE "ChecklistItem" DROP CONSTRAINT "ChecklistItem_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Deadline" DROP CONSTRAINT "Deadline_documentId_fkey";

-- DropForeignKey
ALTER TABLE "Deadline" DROP CONSTRAINT "Deadline_jobSiteId_fkey";

-- DropForeignKey
ALTER TABLE "Deadline" DROP CONSTRAINT "Deadline_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Deadline" DROP CONSTRAINT "Deadline_workerId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_documentTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_reviewedById_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackage" DROP CONSTRAINT "DocumentPackage_createdById_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackage" DROP CONSTRAINT "DocumentPackage_jobSiteId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackage" DROP CONSTRAINT "DocumentPackage_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_checklistId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_documentPackageId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_documentVersionId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_evidenceId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentRequirement" DROP CONSTRAINT "DocumentRequirement_documentTypeId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentRequirement" DROP CONSTRAINT "DocumentRequirement_jobSiteId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentRequirement" DROP CONSTRAINT "DocumentRequirement_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentType" DROP CONSTRAINT "DocumentType_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Evidence" DROP CONSTRAINT "Evidence_checklistItemId_fkey";

-- DropForeignKey
ALTER TABLE "JobSite" DROP CONSTRAINT "JobSite_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "JobSiteUserAssignment" DROP CONSTRAINT "JobSiteUserAssignment_assignedById_fkey";

-- DropForeignKey
ALTER TABLE "JobSiteUserAssignment" DROP CONSTRAINT "JobSiteUserAssignment_jobSiteId_fkey";

-- DropForeignKey
ALTER TABLE "JobSiteUserAssignment" DROP CONSTRAINT "JobSiteUserAssignment_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "JobSiteUserAssignment" DROP CONSTRAINT "JobSiteUserAssignment_userId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationEmailDelivery" DROP CONSTRAINT "NotificationEmailDelivery_notificationId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationEmailDelivery" DROP CONSTRAINT "NotificationEmailDelivery_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationEmailDelivery" DROP CONSTRAINT "NotificationEmailDelivery_userId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationPreference" DROP CONSTRAINT "NotificationPreference_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationPreference" DROP CONSTRAINT "NotificationPreference_userId_fkey";

-- DropForeignKey
ALTER TABLE "ShareLink" DROP CONSTRAINT "ShareLink_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ShareLink" DROP CONSTRAINT "ShareLink_documentPackageId_fkey";

-- DropForeignKey
ALTER TABLE "ShareLink" DROP CONSTRAINT "ShareLink_organizationId_fkey";

-- DropIndex
DROP INDEX "Document_organizationId_documentTypeId_idx";

-- DropIndex
DROP INDEX "Document_organizationId_expiryDate_idx";

-- DropIndex
DROP INDEX "Document_organizationId_status_idx";

-- DropIndex
DROP INDEX "Evidence_organizationId_checklistItemId_idx";

-- DropIndex
DROP INDEX "JobSite_organizationId_clientName_idx";

-- DropIndex
DROP INDEX "JobSite_organizationId_status_idx";

-- DropIndex
DROP INDEX "NotificationPreference_organizationId_emailDigestEnabled_emailD";

-- DropIndex
DROP INDEX "NotificationPreference_organizationId_userId_key";

-- DropIndex
DROP INDEX "NotificationPreference_userId_updatedAt_idx";

-- DropIndex
DROP INDEX "OrganizationMembership_userId_key";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "documentTypeId",
DROP COLUMN "expiryDate",
DROP COLUMN "reviewedAt",
DROP COLUMN "reviewedById",
DROP COLUMN "status",
ADD COLUMN     "currentVersionId" TEXT;

-- AlterTable
ALTER TABLE "Evidence" DROP COLUMN "checklistItemId",
ADD COLUMN     "capturedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "JobSite" DROP COLUMN "clientName",
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "estimatedCompletionAt" TIMESTAMP(3),
ADD COLUMN     "estimatedCompletionAuthorId" TEXT,
ADD COLUMN     "estimatedCompletionSetAt" TIMESTAMP(3),
ADD COLUMN     "historicalCreatorUserId" TEXT,
ADD COLUMN     "responsibleParticipantId" TEXT,
ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "timelineSequence" BIGINT NOT NULL DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" "JobSiteStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "JobSiteWorkerAssignment" ADD COLUMN     "endReason" TEXT,
ADD COLUMN     "endedById" TEXT,
ADD COLUMN     "endsAt" TIMESTAMP(3),
ADD COLUMN     "operationalRoleLabel" TEXT,
ADD COLUMN     "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "taskLabel" TEXT;

-- AlterTable
ALTER TABLE "NotificationPreference" DROP COLUMN "deadlineNotificationsEnabled",
DROP COLUMN "documentNotificationsEnabled",
DROP COLUMN "emailDigestEnabled",
DROP COLUMN "emailDigestFrequency",
DROP COLUMN "emailDigestHour",
DROP COLUMN "lastDigestSentAt",
DROP COLUMN "packageNotificationsEnabled",
DROP COLUMN "systemNotificationsEnabled",
ADD COLUMN     "channel" "NotificationChannel" NOT NULL,
ADD COLUMN     "frequency" "NotificationFrequency" NOT NULL DEFAULT 'IMMEDIATE',
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- AlterTable
ALTER TABLE "OrganizationInvitation" ADD COLUMN     "accessExpiresAt" TIMESTAMP(3),
ADD COLUMN     "accessUpdatedById" TEXT,
ADD COLUMN     "accessVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "activeKey" TEXT,
ADD COLUMN     "declinedAt" TIMESTAMP(3),
ADD COLUMN     "message" TEXT,
ADD COLUMN     "permissionKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "preset" "OrganizationAccessPreset",
ADD COLUMN     "recipientName" TEXT,
ADD COLUMN     "scopeMode" "OrganizationScopeMode" NOT NULL DEFAULT 'ASSIGNED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "workerId" TEXT;

-- AlterTable
ALTER TABLE "OrganizationMembership" ADD COLUMN     "accessUpdatedById" TEXT,
ADD COLUMN     "accessVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "permissionKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "preset" "OrganizationAccessPreset",
ADD COLUMN     "scopeMode" "OrganizationScopeMode" NOT NULL DEFAULT 'ASSIGNED';

-- DropTable
DROP TABLE "CalendarEvent";

-- DropTable
DROP TABLE "Checklist";

-- DropTable
DROP TABLE "ChecklistItem";

-- DropTable
DROP TABLE "Deadline";

-- DropTable
DROP TABLE "DocumentPackage";

-- DropTable
DROP TABLE "DocumentPackageItem";

-- DropTable
DROP TABLE "DocumentRequirement";

-- DropTable
DROP TABLE "DocumentType";

-- DropTable
DROP TABLE "JobSiteUserAssignment";

-- DropTable
DROP TABLE "NotificationEmailDelivery";

-- DropTable
DROP TABLE "ShareLink";

-- DropEnum
DROP TYPE "CalendarEventKind";

-- DropEnum
DROP TYPE "CalendarEventPriority";

-- DropEnum
DROP TYPE "CalendarEventSource";

-- DropEnum
DROP TYPE "CalendarEventStatus";

-- DropEnum
DROP TYPE "ChecklistItemStatus";

-- DropEnum
DROP TYPE "DeadlineSourceType";

-- DropEnum
DROP TYPE "DeadlineStatus";

-- DropEnum
DROP TYPE "DocumentPackageItemType";

-- DropEnum
DROP TYPE "DocumentPackageStatus";

-- DropEnum
DROP TYPE "DocumentStatus";

-- DropEnum
DROP TYPE "DocumentTypeAppliesTo";

-- DropEnum
DROP TYPE "EmailDigestFrequency";

-- DropEnum
DROP TYPE "JobSiteUserAssignmentRole";

-- DropEnum
DROP TYPE "NotificationEmailDeliveryStatus";

-- DropEnum
DROP TYPE "NotificationEmailDeliveryType";

-- DropEnum
DROP TYPE "RequirementTargetType";

-- CreateTable
CREATE TABLE "OrganizationProfile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "legalName" TEXT,
    "taxCode" TEXT,
    "vatNumber" TEXT,
    "registeredOfficeAddress" TEXT,
    "operatingDescription" TEXT,
    "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationContact" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "kind" "OrganizationContactKind" NOT NULL DEFAULT 'GENERAL',
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "OrganizationContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentJobSiteLink" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "purpose" TEXT,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "linkedById" TEXT NOT NULL,
    "unlinkedAt" TIMESTAMP(3),
    "unlinkedById" TEXT,
    "unlinkReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentJobSiteLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceRevision" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "capturedAt" TIMESTAMP(3),
    "reason" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteParticipant" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "membershipId" TEXT,
    "kind" "JobSiteParticipantKind" NOT NULL,
    "status" "JobSiteParticipantStatus" NOT NULL DEFAULT 'PENDING',
    "accessVersion" INTEGER NOT NULL DEFAULT 1,
    "publicRoleLabel" TEXT,
    "activeKey" TEXT,
    "primaryClientKey" TEXT,
    "userSideKey" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "endedByUserId" TEXT,
    "endReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSiteParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteClientInvitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "emailNormalized" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "activeKey" TEXT,
    "status" "ClientInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invitedByUserId" TEXT NOT NULL,
    "acceptedByParticipantId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "supersededAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSiteClientInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProperty" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "addressLine" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "countryCode" TEXT,
    "imageBlobKey" TEXT,
    "privateNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "ClientProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientPropertyJobSiteLink" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "linkedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "ClientPropertyJobSiteLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteAuthorityGrant" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "participantAccessVersion" INTEGER NOT NULL,
    "capability" "AuthorityCapability" NOT NULL,
    "status" "AuthorityGrantStatus" NOT NULL DEFAULT 'ACTIVE',
    "activeKey" TEXT,
    "grantedByUserId" TEXT NOT NULL,
    "revokedByUserId" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSiteAuthorityGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteInitialAgreement" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "status" "AgreementStatus" NOT NULL DEFAULT 'DRAFT',
    "currentVersionId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSiteInitialAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteInitialAgreementVersion" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSiteInitialAgreementVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteInitialAgreementConsent" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "decision" "ConsentDecision" NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSiteInitialAgreementConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteStep" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "expectedOutcome" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "status" "JobSiteStepStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "indicativeDate" TIMESTAMP(3),
    "estimatedCompletionAt" TIMESTAMP(3),
    "economicValueMinor" BIGINT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "JobSiteStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteStepUserAssignment" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "roleLabel" TEXT,
    "assignedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "JobSiteStepUserAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteStepWorkerAssignment" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "roleLabel" TEXT,
    "assignedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "JobSiteStepWorkerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteTimelineEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "sequence" BIGINT NOT NULL,
    "type" "TimelineEventType" NOT NULL,
    "audience" "TimelineAudience" NOT NULL,
    "disclosure" "TimelineDisclosure" NOT NULL DEFAULT 'GENERAL',
    "actorKind" "TimelineActorKind" NOT NULL,
    "actorUserId" TEXT,
    "actorParticipantId" TEXT,
    "stepId" TEXT,
    "title" TEXT NOT NULL DEFAULT 'Evento Qoovex',
    "body" TEXT,
    "replyToEventId" TEXT,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "supersedesEventId" TEXT,
    "withdrawnAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSiteTimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteTimelineArtifactReference" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" "ArtifactReferenceType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSiteTimelineArtifactReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteAttachment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "category" "AttachmentCategory" NOT NULL,
    "sourceKind" "AttachmentSourceKind" NOT NULL,
    "sourceId" TEXT,
    "blobKey" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "uploadedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "JobSiteAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteAttachmentPublication" (
    "id" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "audience" "TimelineAudience" NOT NULL,
    "disclosure" "TimelineDisclosure" NOT NULL DEFAULT 'GENERAL',
    "publishedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawnAt" TIMESTAMP(3),

    CONSTRAINT "JobSiteAttachmentPublication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteTimelineEventAttachment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSiteTimelineEventAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "openedByParticipantId" TEXT NOT NULL,
    "type" "JobSiteRequestType" NOT NULL DEFAULT 'OTHER',
    "assignedSide" "JobSiteParticipantKind" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "JobSiteRequestStatus" NOT NULL DEFAULT 'OPEN',
    "blocking" BOOLEAN NOT NULL DEFAULT false,
    "stepId" TEXT,
    "proposalId" TEXT,
    "paymentRequestId" TEXT,
    "timelineEventId" TEXT,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "JobSiteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteChangeProposal" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "status" "ChangeProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "currentVersionId" TEXT,
    "representedSide" "JobSiteParticipantKind" NOT NULL,
    "createdByParticipantId" TEXT NOT NULL,
    "activeKey" TEXT,
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSiteChangeProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteChangeProposalVersion" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "previousPriceMinor" BIGINT,
    "economicDeltaMinor" BIGINT,
    "rangeMinimumMinor" BIGINT,
    "rangeMaximumMinor" BIGINT,
    "estimatedCompletionAt" TIMESTAMP(3),
    "createdByParticipantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSiteChangeProposalVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteChangeProposalEffect" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "type" "ChangeEffectType" NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "beforeSnapshot" JSONB,
    "afterSnapshot" JSONB,
    "receiptFingerprint" TEXT,
    "appliedAt" TIMESTAMP(3),

    CONSTRAINT "JobSiteChangeProposalEffect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteChangeProposalConsent" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "decision" "ConsentDecision" NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSiteChangeProposalConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationPaymentProfile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "currentVersionId" TEXT,
    "activeKey" TEXT,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "OrganizationPaymentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationPaymentProfileVersion" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "ibanCiphertext" TEXT NOT NULL,
    "ibanNonce" TEXT NOT NULL,
    "ibanAuthTag" TEXT NOT NULL,
    "encryptionKeyId" TEXT NOT NULL,
    "ibanLast4" TEXT NOT NULL,
    "aadVersion" INTEGER NOT NULL DEFAULT 1,
    "fingerprint" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationPaymentProfileVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSitePaymentRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "paymentProfileId" TEXT NOT NULL,
    "paymentProfileVersionId" TEXT NOT NULL,
    "status" "PaymentRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "amountMinor" BIGINT NOT NULL,
    "reason" TEXT NOT NULL,
    "transferReference" TEXT,
    "requestedByParticipantId" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSitePaymentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSitePaymentRequestStepLink" (
    "id" TEXT NOT NULL,
    "paymentRequestId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,

    CONSTRAINT "JobSitePaymentRequestStepLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSitePaymentRequestProposalLink" (
    "id" TEXT NOT NULL,
    "paymentRequestId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,

    CONSTRAINT "JobSitePaymentRequestProposalLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSitePaymentTransferDeclaration" (
    "id" TEXT NOT NULL,
    "paymentRequestId" TEXT NOT NULL,
    "declaredByParticipantId" TEXT NOT NULL,
    "amountMinor" BIGINT NOT NULL,
    "transferredAt" TIMESTAMP(3) NOT NULL,
    "method" TEXT NOT NULL,
    "reference" TEXT,
    "note" TEXT,
    "receiptAttachmentId" TEXT,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSitePaymentTransferDeclaration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSitePaymentReview" (
    "id" TEXT NOT NULL,
    "paymentRequestId" TEXT NOT NULL,
    "reviewedByParticipantId" TEXT NOT NULL,
    "outcome" "PaymentReviewOutcome" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSitePaymentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteDispute" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "openedByParticipantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "relatedType" "ArtifactReferenceType",
    "relatedId" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSiteDispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteDisputeArtifactReference" (
    "id" TEXT NOT NULL,
    "disputeId" TEXT NOT NULL,
    "type" "ArtifactReferenceType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSiteDisputeArtifactReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteDisputeConsent" (
    "id" TEXT NOT NULL,
    "disputeId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "decision" "ConsentDecision" NOT NULL,
    "resolutionFingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSiteDisputeConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteDisputePreservation" (
    "id" TEXT NOT NULL,
    "disputeId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSiteDisputePreservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteClosure" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "status" "ClosureStatus" NOT NULL DEFAULT 'PENDING_CLIENT_CONFIRMATION',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "jobSiteRevision" INTEGER NOT NULL,
    "timelineSequence" BIGINT NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "snapshot" JSONB NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "proposedByParticipantId" TEXT NOT NULL,
    "proposedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),

    CONSTRAINT "JobSiteClosure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteClosureConsent" (
    "id" TEXT NOT NULL,
    "closureId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "decision" "ConsentDecision" NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSiteClosureConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSitePostClosureRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "openedByParticipantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "PostClosureRequestStatus" NOT NULL DEFAULT 'OPEN',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "JobSitePostClosureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteReopeningProposal" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "postClosureRequestId" TEXT,
    "status" "ReopeningStatus" NOT NULL DEFAULT 'PROPOSED',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "reason" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "proposedByParticipantId" TEXT NOT NULL,
    "proposedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),

    CONSTRAINT "JobSiteReopeningProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteReopeningConsent" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "decision" "ConsentDecision" NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSiteReopeningConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteExport" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "audience" "JobSiteExportAudience" NOT NULL,
    "status" "JobSiteExportStatus" NOT NULL DEFAULT 'PENDING',
    "requestedByUserId" TEXT NOT NULL,
    "requestedByParticipantId" TEXT,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "manifestFingerprint" TEXT,
    "blobKey" TEXT,
    "size" INTEGER,
    "checksumSha256" TEXT,
    "availableUntil" TIMESTAMP(3),
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "JobSiteExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteExportAccessLink" (
    "id" TEXT NOT NULL,
    "exportId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "activeKey" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSiteExportAccessLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteExportDownloadGrant" (
    "id" TEXT NOT NULL,
    "exportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "activeKey" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSiteExportDownloadGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalHold" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "status" "LegalHoldStatus" NOT NULL DEFAULT 'ACTIVE',
    "reason" TEXT NOT NULL,
    "placedByUserId" TEXT NOT NULL,
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedByUserId" TEXT,
    "releasedAt" TIMESTAMP(3),
    "releaseReason" TEXT,

    CONSTRAINT "LegalHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteActionReceipt" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "inputFingerprint" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "resultFingerprint" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "actorParticipantId" TEXT,
    "expectedRevision" INTEGER NOT NULL,
    "resultingRevision" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSiteActionReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteProcess" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT NOT NULL,
    "definitionKey" TEXT NOT NULL,
    "status" "JobSiteProcessStatus" NOT NULL DEFAULT 'PENDING',
    "activeKey" TEXT,
    "input" JSONB NOT NULL,
    "inputFingerprint" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedBy" TEXT,
    "leaseExpiresAt" TIMESTAMP(3),
    "fencingToken" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "JobSiteProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteProcessStep" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "status" "JobSiteProcessStepStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "input" JSONB,
    "output" JSONB,
    "errorCode" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "JobSiteProcessStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSiteProcessEvent" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "type" "JobSiteProcessEventType" NOT NULL,
    "payload" JSONB,
    "fencingToken" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSiteProcessEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationDelivery" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "dedupeKey" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "safePayload" JSONB NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMembershipResourceGrant" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "resourceType" "OrganizationResourceType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "grantedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMembershipResourceGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationInvitationResourceGrant" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "resourceType" "OrganizationResourceType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationInvitationResourceGrant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationProfile_organizationId_key" ON "OrganizationProfile"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationProfile_organizationId_legalName_idx" ON "OrganizationProfile"("organizationId", "legalName");

-- CreateIndex
CREATE INDEX "OrganizationContact_organizationId_archivedAt_sortOrder_idx" ON "OrganizationContact"("organizationId", "archivedAt", "sortOrder");

-- CreateIndex
CREATE INDEX "OrganizationContact_organizationId_kind_archivedAt_idx" ON "OrganizationContact"("organizationId", "kind", "archivedAt");

-- CreateIndex
CREATE INDEX "OrganizationContact_userId_idx" ON "OrganizationContact"("userId");

-- CreateIndex
CREATE INDEX "DocumentJobSiteLink_organizationId_documentId_unlinkedAt_idx" ON "DocumentJobSiteLink"("organizationId", "documentId", "unlinkedAt");

-- CreateIndex
CREATE INDEX "DocumentJobSiteLink_organizationId_jobSiteId_unlinkedAt_idx" ON "DocumentJobSiteLink"("organizationId", "jobSiteId", "unlinkedAt");

-- CreateIndex
CREATE INDEX "DocumentJobSiteLink_organizationId_validFrom_validTo_idx" ON "DocumentJobSiteLink"("organizationId", "validFrom", "validTo");

-- CreateIndex
CREATE INDEX "DocumentJobSiteLink_linkedById_idx" ON "DocumentJobSiteLink"("linkedById");

-- CreateIndex
CREATE INDEX "DocumentJobSiteLink_unlinkedById_idx" ON "DocumentJobSiteLink"("unlinkedById");

-- CreateIndex
CREATE INDEX "EvidenceRevision_organizationId_evidenceId_createdAt_idx" ON "EvidenceRevision"("organizationId", "evidenceId", "createdAt");

-- CreateIndex
CREATE INDEX "EvidenceRevision_createdById_idx" ON "EvidenceRevision"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceRevision_evidenceId_revisionNumber_key" ON "EvidenceRevision"("evidenceId", "revisionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteParticipant_activeKey_key" ON "JobSiteParticipant"("activeKey");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteParticipant_primaryClientKey_key" ON "JobSiteParticipant"("primaryClientKey");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteParticipant_userSideKey_key" ON "JobSiteParticipant"("userSideKey");

-- CreateIndex
CREATE INDEX "JobSiteParticipant_organizationId_jobSiteId_kind_status_idx" ON "JobSiteParticipant"("organizationId", "jobSiteId", "kind", "status");

-- CreateIndex
CREATE INDEX "JobSiteParticipant_userId_status_idx" ON "JobSiteParticipant"("userId", "status");

-- CreateIndex
CREATE INDEX "JobSiteParticipant_membershipId_idx" ON "JobSiteParticipant"("membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteClientInvitation_tokenHash_key" ON "JobSiteClientInvitation"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteClientInvitation_activeKey_key" ON "JobSiteClientInvitation"("activeKey");

-- CreateIndex
CREATE INDEX "JobSiteClientInvitation_organizationId_jobSiteId_status_idx" ON "JobSiteClientInvitation"("organizationId", "jobSiteId", "status");

-- CreateIndex
CREATE INDEX "JobSiteClientInvitation_emailNormalized_expiresAt_idx" ON "JobSiteClientInvitation"("emailNormalized", "expiresAt");

-- CreateIndex
CREATE INDEX "ClientProperty_userId_archivedAt_displayName_idx" ON "ClientProperty"("userId", "archivedAt", "displayName");

-- CreateIndex
CREATE UNIQUE INDEX "ClientPropertyJobSiteLink_jobSiteId_key" ON "ClientPropertyJobSiteLink"("jobSiteId");

-- CreateIndex
CREATE INDEX "ClientPropertyJobSiteLink_propertyId_archivedAt_idx" ON "ClientPropertyJobSiteLink"("propertyId", "archivedAt");

-- CreateIndex
CREATE INDEX "ClientPropertyJobSiteLink_organizationId_jobSiteId_idx" ON "ClientPropertyJobSiteLink"("organizationId", "jobSiteId");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteAuthorityGrant_activeKey_key" ON "JobSiteAuthorityGrant"("activeKey");

-- CreateIndex
CREATE INDEX "JobSiteAuthorityGrant_organizationId_jobSiteId_capability_s_idx" ON "JobSiteAuthorityGrant"("organizationId", "jobSiteId", "capability", "status");

-- CreateIndex
CREATE INDEX "JobSiteAuthorityGrant_participantId_capability_status_valid_idx" ON "JobSiteAuthorityGrant"("participantId", "capability", "status", "validFrom");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteInitialAgreement_currentVersionId_key" ON "JobSiteInitialAgreement"("currentVersionId");

-- CreateIndex
CREATE INDEX "JobSiteInitialAgreement_organizationId_status_idx" ON "JobSiteInitialAgreement"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteInitialAgreement_jobSiteId_key" ON "JobSiteInitialAgreement"("jobSiteId");

-- CreateIndex
CREATE INDEX "JobSiteInitialAgreementVersion_agreementId_createdAt_idx" ON "JobSiteInitialAgreementVersion"("agreementId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteInitialAgreementVersion_agreementId_version_key" ON "JobSiteInitialAgreementVersion"("agreementId", "version");

-- CreateIndex
CREATE INDEX "JobSiteInitialAgreementConsent_participantId_createdAt_idx" ON "JobSiteInitialAgreementConsent"("participantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteInitialAgreementConsent_versionId_participantId_key" ON "JobSiteInitialAgreementConsent"("versionId", "participantId");

-- CreateIndex
CREATE INDEX "JobSiteStep_organizationId_jobSiteId_status_idx" ON "JobSiteStep"("organizationId", "jobSiteId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteStep_jobSiteId_sortOrder_key" ON "JobSiteStep"("jobSiteId", "sortOrder");

-- CreateIndex
CREATE INDEX "JobSiteStepUserAssignment_participantId_endedAt_idx" ON "JobSiteStepUserAssignment"("participantId", "endedAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteStepUserAssignment_stepId_participantId_key" ON "JobSiteStepUserAssignment"("stepId", "participantId");

-- CreateIndex
CREATE INDEX "JobSiteStepWorkerAssignment_workerId_endedAt_idx" ON "JobSiteStepWorkerAssignment"("workerId", "endedAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteStepWorkerAssignment_stepId_workerId_key" ON "JobSiteStepWorkerAssignment"("stepId", "workerId");

-- CreateIndex
CREATE INDEX "JobSiteTimelineEvent_organizationId_jobSiteId_audience_sequ_idx" ON "JobSiteTimelineEvent"("organizationId", "jobSiteId", "audience", "sequence");

-- CreateIndex
CREATE INDEX "JobSiteTimelineEvent_jobSiteId_stepId_sequence_idx" ON "JobSiteTimelineEvent"("jobSiteId", "stepId", "sequence");

-- CreateIndex
CREATE INDEX "JobSiteTimelineEvent_jobSiteId_replyToEventId_sequence_idx" ON "JobSiteTimelineEvent"("jobSiteId", "replyToEventId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteTimelineEvent_jobSiteId_sequence_key" ON "JobSiteTimelineEvent"("jobSiteId", "sequence");

-- CreateIndex
CREATE INDEX "JobSiteTimelineArtifactReference_type_targetId_idx" ON "JobSiteTimelineArtifactReference"("type", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteTimelineArtifactReference_eventId_type_targetId_key" ON "JobSiteTimelineArtifactReference"("eventId", "type", "targetId");

-- CreateIndex
CREATE INDEX "JobSiteAttachment_organizationId_jobSiteId_category_created_idx" ON "JobSiteAttachment"("organizationId", "jobSiteId", "category", "createdAt");

-- CreateIndex
CREATE INDEX "JobSiteAttachment_blobKey_idx" ON "JobSiteAttachment"("blobKey");

-- CreateIndex
CREATE INDEX "JobSiteAttachment_sourceKind_sourceId_idx" ON "JobSiteAttachment"("sourceKind", "sourceId");

-- CreateIndex
CREATE INDEX "JobSiteAttachmentPublication_eventId_withdrawnAt_idx" ON "JobSiteAttachmentPublication"("eventId", "withdrawnAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteAttachmentPublication_attachmentId_eventId_key" ON "JobSiteAttachmentPublication"("attachmentId", "eventId");

-- CreateIndex
CREATE INDEX "JobSiteTimelineEventAttachment_attachmentId_idx" ON "JobSiteTimelineEventAttachment"("attachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteTimelineEventAttachment_eventId_attachmentId_key" ON "JobSiteTimelineEventAttachment"("eventId", "attachmentId");

-- CreateIndex
CREATE INDEX "JobSiteRequest_organizationId_jobSiteId_status_blocking_idx" ON "JobSiteRequest"("organizationId", "jobSiteId", "status", "blocking");

-- CreateIndex
CREATE INDEX "JobSiteRequest_openedByParticipantId_createdAt_idx" ON "JobSiteRequest"("openedByParticipantId", "createdAt");

-- CreateIndex
CREATE INDEX "JobSiteRequest_jobSiteId_assignedSide_status_updatedAt_idx" ON "JobSiteRequest"("jobSiteId", "assignedSide", "status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteChangeProposal_currentVersionId_key" ON "JobSiteChangeProposal"("currentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteChangeProposal_activeKey_key" ON "JobSiteChangeProposal"("activeKey");

-- CreateIndex
CREATE INDEX "JobSiteChangeProposal_organizationId_jobSiteId_status_updat_idx" ON "JobSiteChangeProposal"("organizationId", "jobSiteId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "JobSiteChangeProposalVersion_proposalId_createdAt_idx" ON "JobSiteChangeProposalVersion"("proposalId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteChangeProposalVersion_proposalId_version_key" ON "JobSiteChangeProposalVersion"("proposalId", "version");

-- CreateIndex
CREATE INDEX "JobSiteChangeProposalEffect_targetType_targetId_idx" ON "JobSiteChangeProposalEffect"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteChangeProposalEffect_versionId_ordinal_key" ON "JobSiteChangeProposalEffect"("versionId", "ordinal");

-- CreateIndex
CREATE INDEX "JobSiteChangeProposalConsent_participantId_createdAt_idx" ON "JobSiteChangeProposalConsent"("participantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteChangeProposalConsent_versionId_participantId_key" ON "JobSiteChangeProposalConsent"("versionId", "participantId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationPaymentProfile_currentVersionId_key" ON "OrganizationPaymentProfile"("currentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationPaymentProfile_activeKey_key" ON "OrganizationPaymentProfile"("activeKey");

-- CreateIndex
CREATE INDEX "OrganizationPaymentProfile_organizationId_archivedAt_idx" ON "OrganizationPaymentProfile"("organizationId", "archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationPaymentProfileVersion_profileId_version_key" ON "OrganizationPaymentProfileVersion"("profileId", "version");

-- CreateIndex
CREATE INDEX "JobSitePaymentRequest_organizationId_jobSiteId_status_creat_idx" ON "JobSitePaymentRequest"("organizationId", "jobSiteId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "JobSitePaymentRequest_paymentProfileVersionId_idx" ON "JobSitePaymentRequest"("paymentProfileVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "JobSitePaymentRequestStepLink_paymentRequestId_stepId_key" ON "JobSitePaymentRequestStepLink"("paymentRequestId", "stepId");

-- CreateIndex
CREATE UNIQUE INDEX "JobSitePaymentRequestProposalLink_paymentRequestId_proposal_key" ON "JobSitePaymentRequestProposalLink"("paymentRequestId", "proposalId");

-- CreateIndex
CREATE INDEX "JobSitePaymentTransferDeclaration_paymentRequestId_createdA_idx" ON "JobSitePaymentTransferDeclaration"("paymentRequestId", "createdAt");

-- CreateIndex
CREATE INDEX "JobSitePaymentTransferDeclaration_receiptAttachmentId_idx" ON "JobSitePaymentTransferDeclaration"("receiptAttachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "JobSitePaymentTransferDeclaration_paymentRequestId_key" ON "JobSitePaymentTransferDeclaration"("paymentRequestId");

-- CreateIndex
CREATE INDEX "JobSitePaymentReview_paymentRequestId_createdAt_idx" ON "JobSitePaymentReview"("paymentRequestId", "createdAt");

-- CreateIndex
CREATE INDEX "JobSiteDispute_organizationId_jobSiteId_status_openedAt_idx" ON "JobSiteDispute"("organizationId", "jobSiteId", "status", "openedAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteDisputeArtifactReference_disputeId_type_targetId_key" ON "JobSiteDisputeArtifactReference"("disputeId", "type", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteDisputeConsent_disputeId_participantId_resolutionFin_key" ON "JobSiteDisputeConsent"("disputeId", "participantId", "resolutionFingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteDisputePreservation_disputeId_fingerprint_key" ON "JobSiteDisputePreservation"("disputeId", "fingerprint");

-- CreateIndex
CREATE INDEX "JobSiteClosure_organizationId_jobSiteId_status_proposedAt_idx" ON "JobSiteClosure"("organizationId", "jobSiteId", "status", "proposedAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteClosureConsent_closureId_participantId_key" ON "JobSiteClosureConsent"("closureId", "participantId");

-- CreateIndex
CREATE INDEX "JobSitePostClosureRequest_organizationId_jobSiteId_status_c_idx" ON "JobSitePostClosureRequest"("organizationId", "jobSiteId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "JobSiteReopeningProposal_organizationId_jobSiteId_status_pr_idx" ON "JobSiteReopeningProposal"("organizationId", "jobSiteId", "status", "proposedAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteReopeningConsent_proposalId_participantId_key" ON "JobSiteReopeningConsent"("proposalId", "participantId");

-- CreateIndex
CREATE INDEX "JobSiteExport_organizationId_jobSiteId_audience_status_crea_idx" ON "JobSiteExport"("organizationId", "jobSiteId", "audience", "status", "createdAt");

-- CreateIndex
CREATE INDEX "JobSiteExport_status_availableUntil_idx" ON "JobSiteExport"("status", "availableUntil");

-- CreateIndex
CREATE INDEX "JobSiteExport_blobKey_idx" ON "JobSiteExport"("blobKey");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteExportAccessLink_tokenHash_key" ON "JobSiteExportAccessLink"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteExportAccessLink_activeKey_key" ON "JobSiteExportAccessLink"("activeKey");

-- CreateIndex
CREATE INDEX "JobSiteExportAccessLink_exportId_expiresAt_idx" ON "JobSiteExportAccessLink"("exportId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteExportDownloadGrant_tokenHash_key" ON "JobSiteExportDownloadGrant"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteExportDownloadGrant_activeKey_key" ON "JobSiteExportDownloadGrant"("activeKey");

-- CreateIndex
CREATE INDEX "JobSiteExportDownloadGrant_exportId_userId_expiresAt_idx" ON "JobSiteExportDownloadGrant"("exportId", "userId", "expiresAt");

-- CreateIndex
CREATE INDEX "LegalHold_organizationId_jobSiteId_status_idx" ON "LegalHold"("organizationId", "jobSiteId", "status");

-- CreateIndex
CREATE INDEX "JobSiteActionReceipt_jobSiteId_createdAt_idx" ON "JobSiteActionReceipt"("jobSiteId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteActionReceipt_organizationId_action_idempotencyKey_key" ON "JobSiteActionReceipt"("organizationId", "action", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteProcess_activeKey_key" ON "JobSiteProcess"("activeKey");

-- CreateIndex
CREATE INDEX "JobSiteProcess_status_nextAttemptAt_createdAt_idx" ON "JobSiteProcess"("status", "nextAttemptAt", "createdAt");

-- CreateIndex
CREATE INDEX "JobSiteProcess_organizationId_jobSiteId_definitionKey_statu_idx" ON "JobSiteProcess"("organizationId", "jobSiteId", "definitionKey", "status");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteProcessStep_processId_key_key" ON "JobSiteProcessStep"("processId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteProcessStep_processId_ordinal_key" ON "JobSiteProcessStep"("processId", "ordinal");

-- CreateIndex
CREATE INDEX "JobSiteProcessEvent_processId_createdAt_idx" ON "JobSiteProcessEvent"("processId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobSiteProcessEvent_processId_sequence_key" ON "JobSiteProcessEvent"("processId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDelivery_dedupeKey_key" ON "NotificationDelivery"("dedupeKey");

-- CreateIndex
CREATE INDEX "NotificationDelivery_status_nextAttemptAt_createdAt_idx" ON "NotificationDelivery"("status", "nextAttemptAt", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDelivery_organizationId_userId_status_idx" ON "NotificationDelivery"("organizationId", "userId", "status");

-- CreateIndex
CREATE INDEX "OrganizationMembershipResourceGrant_organizationId_resourceType" ON "OrganizationMembershipResourceGrant"("organizationId", "resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMembershipResourceGrant_membershipId_resourceType_r" ON "OrganizationMembershipResourceGrant"("membershipId", "resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "OrganizationInvitationResourceGrant_organizationId_resourceType" ON "OrganizationInvitationResourceGrant"("organizationId", "resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInvitationResourceGrant_invitationId_resourceType_r" ON "OrganizationInvitationResourceGrant"("invitationId", "resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_currentVersionId_key" ON "Document"("currentVersionId");

-- CreateIndex
CREATE INDEX "Document_organizationId_title_idx" ON "Document"("organizationId", "title");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_title_idx" ON "Evidence"("organizationId", "title");

-- CreateIndex
CREATE INDEX "JobSite_organizationId_status_updatedAt_idx" ON "JobSite"("organizationId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "JobSite_historicalCreatorUserId_idx" ON "JobSite"("historicalCreatorUserId");

-- CreateIndex
CREATE INDEX "JobSite_responsibleParticipantId_idx" ON "JobSite"("responsibleParticipantId");

-- CreateIndex
CREATE INDEX "JobSiteWorkerAssignment_organizationId_startsAt_endsAt_idx" ON "JobSiteWorkerAssignment"("organizationId", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "JobSiteWorkerAssignment_endedById_idx" ON "JobSiteWorkerAssignment"("endedById");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_channel_idx" ON "NotificationPreference"("userId", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_organizationId_userId_type_channel_key" ON "NotificationPreference"("organizationId", "userId", "type", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInvitation_activeKey_key" ON "OrganizationInvitation"("activeKey");

-- CreateIndex
CREATE INDEX "OrganizationInvitation_organizationId_workerId_createdAt_idx" ON "OrganizationInvitation"("organizationId", "workerId", "createdAt");

-- CreateIndex
CREATE INDEX "OrganizationInvitation_accessUpdatedById_updatedAt_idx" ON "OrganizationInvitation"("accessUpdatedById", "updatedAt");

-- CreateIndex
CREATE INDEX "OrganizationMembership_userId_revokedAt_idx" ON "OrganizationMembership"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "OrganizationMembership_accessUpdatedById_updatedAt_idx" ON "OrganizationMembership"("accessUpdatedById", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMembership_organizationId_userId_key" ON "OrganizationMembership"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- AddForeignKey
ALTER TABLE "OrganizationProfile" ADD CONSTRAINT "OrganizationProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationContact" ADD CONSTRAINT "OrganizationContact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationContact" ADD CONSTRAINT "OrganizationContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSite" ADD CONSTRAINT "JobSite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSite" ADD CONSTRAINT "JobSite_responsibleParticipantId_fkey" FOREIGN KEY ("responsibleParticipantId") REFERENCES "JobSiteParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteWorkerAssignment" ADD CONSTRAINT "JobSiteWorkerAssignment_endedById_fkey" FOREIGN KEY ("endedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "DocumentVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentJobSiteLink" ADD CONSTRAINT "DocumentJobSiteLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentJobSiteLink" ADD CONSTRAINT "DocumentJobSiteLink_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentJobSiteLink" ADD CONSTRAINT "DocumentJobSiteLink_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentJobSiteLink" ADD CONSTRAINT "DocumentJobSiteLink_linkedById_fkey" FOREIGN KEY ("linkedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentJobSiteLink" ADD CONSTRAINT "DocumentJobSiteLink_unlinkedById_fkey" FOREIGN KEY ("unlinkedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceRevision" ADD CONSTRAINT "EvidenceRevision_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceRevision" ADD CONSTRAINT "EvidenceRevision_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceRevision" ADD CONSTRAINT "EvidenceRevision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteParticipant" ADD CONSTRAINT "JobSiteParticipant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteParticipant" ADD CONSTRAINT "JobSiteParticipant_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteParticipant" ADD CONSTRAINT "JobSiteParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteParticipant" ADD CONSTRAINT "JobSiteParticipant_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "OrganizationMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteClientInvitation" ADD CONSTRAINT "JobSiteClientInvitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteClientInvitation" ADD CONSTRAINT "JobSiteClientInvitation_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteClientInvitation" ADD CONSTRAINT "JobSiteClientInvitation_acceptedByParticipantId_fkey" FOREIGN KEY ("acceptedByParticipantId") REFERENCES "JobSiteParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProperty" ADD CONSTRAINT "ClientProperty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPropertyJobSiteLink" ADD CONSTRAINT "ClientPropertyJobSiteLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPropertyJobSiteLink" ADD CONSTRAINT "ClientPropertyJobSiteLink_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ClientProperty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPropertyJobSiteLink" ADD CONSTRAINT "ClientPropertyJobSiteLink_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteAuthorityGrant" ADD CONSTRAINT "JobSiteAuthorityGrant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteAuthorityGrant" ADD CONSTRAINT "JobSiteAuthorityGrant_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteAuthorityGrant" ADD CONSTRAINT "JobSiteAuthorityGrant_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "JobSiteParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteInitialAgreement" ADD CONSTRAINT "JobSiteInitialAgreement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteInitialAgreement" ADD CONSTRAINT "JobSiteInitialAgreement_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteInitialAgreement" ADD CONSTRAINT "JobSiteInitialAgreement_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "JobSiteInitialAgreementVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteInitialAgreementVersion" ADD CONSTRAINT "JobSiteInitialAgreementVersion_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "JobSiteInitialAgreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteInitialAgreementConsent" ADD CONSTRAINT "JobSiteInitialAgreementConsent_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "JobSiteInitialAgreementVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteInitialAgreementConsent" ADD CONSTRAINT "JobSiteInitialAgreementConsent_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "JobSiteParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteStep" ADD CONSTRAINT "JobSiteStep_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteStep" ADD CONSTRAINT "JobSiteStep_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteStepUserAssignment" ADD CONSTRAINT "JobSiteStepUserAssignment_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "JobSiteStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteStepUserAssignment" ADD CONSTRAINT "JobSiteStepUserAssignment_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "JobSiteParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteStepWorkerAssignment" ADD CONSTRAINT "JobSiteStepWorkerAssignment_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "JobSiteStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteStepWorkerAssignment" ADD CONSTRAINT "JobSiteStepWorkerAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteTimelineEvent" ADD CONSTRAINT "JobSiteTimelineEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteTimelineEvent" ADD CONSTRAINT "JobSiteTimelineEvent_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteTimelineArtifactReference" ADD CONSTRAINT "JobSiteTimelineArtifactReference_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "JobSiteTimelineEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteAttachment" ADD CONSTRAINT "JobSiteAttachment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteAttachment" ADD CONSTRAINT "JobSiteAttachment_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteAttachmentPublication" ADD CONSTRAINT "JobSiteAttachmentPublication_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "JobSiteAttachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteAttachmentPublication" ADD CONSTRAINT "JobSiteAttachmentPublication_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "JobSiteTimelineEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteTimelineEventAttachment" ADD CONSTRAINT "JobSiteTimelineEventAttachment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "JobSiteTimelineEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteTimelineEventAttachment" ADD CONSTRAINT "JobSiteTimelineEventAttachment_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "JobSiteAttachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteRequest" ADD CONSTRAINT "JobSiteRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteRequest" ADD CONSTRAINT "JobSiteRequest_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteChangeProposal" ADD CONSTRAINT "JobSiteChangeProposal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteChangeProposal" ADD CONSTRAINT "JobSiteChangeProposal_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteChangeProposal" ADD CONSTRAINT "JobSiteChangeProposal_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "JobSiteChangeProposalVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteChangeProposalVersion" ADD CONSTRAINT "JobSiteChangeProposalVersion_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "JobSiteChangeProposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteChangeProposalEffect" ADD CONSTRAINT "JobSiteChangeProposalEffect_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "JobSiteChangeProposalVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteChangeProposalConsent" ADD CONSTRAINT "JobSiteChangeProposalConsent_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "JobSiteChangeProposalVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteChangeProposalConsent" ADD CONSTRAINT "JobSiteChangeProposalConsent_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "JobSiteParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationPaymentProfile" ADD CONSTRAINT "OrganizationPaymentProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationPaymentProfile" ADD CONSTRAINT "OrganizationPaymentProfile_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "OrganizationPaymentProfileVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationPaymentProfileVersion" ADD CONSTRAINT "OrganizationPaymentProfileVersion_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "OrganizationPaymentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSitePaymentRequest" ADD CONSTRAINT "JobSitePaymentRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSitePaymentRequest" ADD CONSTRAINT "JobSitePaymentRequest_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSitePaymentRequest" ADD CONSTRAINT "JobSitePaymentRequest_paymentProfileId_fkey" FOREIGN KEY ("paymentProfileId") REFERENCES "OrganizationPaymentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSitePaymentRequest" ADD CONSTRAINT "JobSitePaymentRequest_paymentProfileVersionId_fkey" FOREIGN KEY ("paymentProfileVersionId") REFERENCES "OrganizationPaymentProfileVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSitePaymentRequest" ADD CONSTRAINT "JobSitePaymentRequest_requestedByParticipantId_fkey" FOREIGN KEY ("requestedByParticipantId") REFERENCES "JobSiteParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSitePaymentRequestStepLink" ADD CONSTRAINT "JobSitePaymentRequestStepLink_paymentRequestId_fkey" FOREIGN KEY ("paymentRequestId") REFERENCES "JobSitePaymentRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSitePaymentRequestStepLink" ADD CONSTRAINT "JobSitePaymentRequestStepLink_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "JobSiteStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSitePaymentRequestProposalLink" ADD CONSTRAINT "JobSitePaymentRequestProposalLink_paymentRequestId_fkey" FOREIGN KEY ("paymentRequestId") REFERENCES "JobSitePaymentRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSitePaymentRequestProposalLink" ADD CONSTRAINT "JobSitePaymentRequestProposalLink_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "JobSiteChangeProposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSitePaymentTransferDeclaration" ADD CONSTRAINT "JobSitePaymentTransferDeclaration_paymentRequestId_fkey" FOREIGN KEY ("paymentRequestId") REFERENCES "JobSitePaymentRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSitePaymentTransferDeclaration" ADD CONSTRAINT "JobSitePaymentTransferDeclaration_declaredByParticipantId_fkey" FOREIGN KEY ("declaredByParticipantId") REFERENCES "JobSiteParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSitePaymentTransferDeclaration" ADD CONSTRAINT "JobSitePaymentTransferDeclaration_receiptAttachmentId_fkey" FOREIGN KEY ("receiptAttachmentId") REFERENCES "JobSiteAttachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSitePaymentReview" ADD CONSTRAINT "JobSitePaymentReview_paymentRequestId_fkey" FOREIGN KEY ("paymentRequestId") REFERENCES "JobSitePaymentRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSitePaymentReview" ADD CONSTRAINT "JobSitePaymentReview_reviewedByParticipantId_fkey" FOREIGN KEY ("reviewedByParticipantId") REFERENCES "JobSiteParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteDispute" ADD CONSTRAINT "JobSiteDispute_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteDispute" ADD CONSTRAINT "JobSiteDispute_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteDisputeArtifactReference" ADD CONSTRAINT "JobSiteDisputeArtifactReference_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "JobSiteDispute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteDisputeConsent" ADD CONSTRAINT "JobSiteDisputeConsent_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "JobSiteDispute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteDisputeConsent" ADD CONSTRAINT "JobSiteDisputeConsent_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "JobSiteParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteDisputePreservation" ADD CONSTRAINT "JobSiteDisputePreservation_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "JobSiteDispute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteClosure" ADD CONSTRAINT "JobSiteClosure_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteClosure" ADD CONSTRAINT "JobSiteClosure_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteClosureConsent" ADD CONSTRAINT "JobSiteClosureConsent_closureId_fkey" FOREIGN KEY ("closureId") REFERENCES "JobSiteClosure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteClosureConsent" ADD CONSTRAINT "JobSiteClosureConsent_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "JobSiteParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSitePostClosureRequest" ADD CONSTRAINT "JobSitePostClosureRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSitePostClosureRequest" ADD CONSTRAINT "JobSitePostClosureRequest_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteReopeningProposal" ADD CONSTRAINT "JobSiteReopeningProposal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteReopeningProposal" ADD CONSTRAINT "JobSiteReopeningProposal_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteReopeningProposal" ADD CONSTRAINT "JobSiteReopeningProposal_postClosureRequestId_fkey" FOREIGN KEY ("postClosureRequestId") REFERENCES "JobSitePostClosureRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteReopeningConsent" ADD CONSTRAINT "JobSiteReopeningConsent_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "JobSiteReopeningProposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteReopeningConsent" ADD CONSTRAINT "JobSiteReopeningConsent_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "JobSiteParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteExport" ADD CONSTRAINT "JobSiteExport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteExport" ADD CONSTRAINT "JobSiteExport_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteExportAccessLink" ADD CONSTRAINT "JobSiteExportAccessLink_exportId_fkey" FOREIGN KEY ("exportId") REFERENCES "JobSiteExport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteExportDownloadGrant" ADD CONSTRAINT "JobSiteExportDownloadGrant_exportId_fkey" FOREIGN KEY ("exportId") REFERENCES "JobSiteExport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalHold" ADD CONSTRAINT "LegalHold_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalHold" ADD CONSTRAINT "LegalHold_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteActionReceipt" ADD CONSTRAINT "JobSiteActionReceipt_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteActionReceipt" ADD CONSTRAINT "JobSiteActionReceipt_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteProcess" ADD CONSTRAINT "JobSiteProcess_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteProcess" ADD CONSTRAINT "JobSiteProcess_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteProcessStep" ADD CONSTRAINT "JobSiteProcessStep_processId_fkey" FOREIGN KEY ("processId") REFERENCES "JobSiteProcess"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteProcessEvent" ADD CONSTRAINT "JobSiteProcessEvent_processId_fkey" FOREIGN KEY ("processId") REFERENCES "JobSiteProcess"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_accessUpdatedById_fkey" FOREIGN KEY ("accessUpdatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_accessUpdatedById_fkey" FOREIGN KEY ("accessUpdatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembershipResourceGrant" ADD CONSTRAINT "OrganizationMembershipResourceGrant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembershipResourceGrant" ADD CONSTRAINT "OrganizationMembershipResourceGrant_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "OrganizationMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembershipResourceGrant" ADD CONSTRAINT "OrganizationMembershipResourceGrant_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvitationResourceGrant" ADD CONSTRAINT "OrganizationInvitationResourceGrant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvitationResourceGrant" ADD CONSTRAINT "OrganizationInvitationResourceGrant_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "OrganizationInvitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
