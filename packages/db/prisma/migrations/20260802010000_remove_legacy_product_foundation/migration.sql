-- Remove legacy-only rows before narrowing shared foundation enums.
DELETE FROM "ProductAuditEvent"
WHERE "action"::text NOT IN (
  'DOCUMENT_CREATED', 'DOCUMENT_UPDATED', 'DOCUMENT_ARCHIVED',
  'DOCUMENT_VERSION_UPLOADED', 'DOCUMENT_VERSION_DOWNLOADED', 'DOCUMENT_VERSION_ARCHIVED',
  'WORKER_CREATED', 'WORKER_UPDATED', 'WORKER_ARCHIVED',
  'JOB_SITE_CREATED', 'JOB_SITE_UPDATED', 'JOB_SITE_ARCHIVED',
  'EVIDENCE_CREATED', 'EVIDENCE_UPDATED', 'EVIDENCE_DOWNLOADED', 'EVIDENCE_ARCHIVED',
  'NOTIFICATION_READ', 'NOTIFICATION_DISMISSED',
  'WORKER_USER_LINK_CREATED', 'WORKER_USER_LINK_ARCHIVED',
  'JOB_SITE_USER_ASSIGNMENT_CREATED', 'JOB_SITE_USER_ASSIGNMENT_ARCHIVED',
  'JOB_SITE_WORKER_ASSIGNMENT_CREATED', 'JOB_SITE_WORKER_ASSIGNMENT_ARCHIVED',
  'ORGANIZATION_PROFILE_UPDATED', 'ORGANIZATION_CONTACT_CREATED',
  'ORGANIZATION_CONTACT_UPDATED', 'ORGANIZATION_CONTACT_ARCHIVED',
  'DOCUMENT_JOB_SITE_LINK_CREATED', 'DOCUMENT_JOB_SITE_LINK_ARCHIVED',
  'ORGANIZATION_INVITATION_CREATED', 'ORGANIZATION_INVITATION_REVOKED',
  'ORGANIZATION_INVITATION_ACCEPTED', 'ORGANIZATION_MEMBERSHIP_REVOKED',
  'DATA_EXPORT_GENERATED', 'DATA_EXPORT_FAILED', 'DATA_CONTROL_JOB_CREATED',
  'DATA_CONTROL_JOB_RUN', 'ORPHAN_BLOB_CLEANUP_RUN',
  'ORGANIZATION_DELETE_REQUESTED', 'ORGANIZATION_DELETE_RUN', 'SECURITY_DENIED'
)
OR "entityType"::text NOT IN (
  'DOCUMENT', 'DOCUMENT_VERSION', 'WORKER', 'JOB_SITE', 'EVIDENCE',
  'NOTIFICATION', 'DATA_CONTROL_JOB', 'WORKER_USER_LINK',
  'JOB_SITE_USER_ASSIGNMENT', 'JOB_SITE_WORKER_ASSIGNMENT',
  'ORGANIZATION_INVITATION', 'ORGANIZATION_MEMBERSHIP', 'ORGANIZATION',
  'ORGANIZATION_PROFILE', 'ORGANIZATION_CONTACT', 'DOCUMENT_JOB_SITE_LINK',
  'EVIDENCE_REVISION', 'USER', 'SYSTEM'
);

DELETE FROM "Notification" WHERE "type"::text <> 'SYSTEM' OR "sourceType"::text <> 'SYSTEM';
DELETE FROM "OrganizationMembershipResourceGrant"
WHERE "resourceType"::text NOT IN ('JOB_SITE', 'WORKER', 'DOCUMENT', 'EVIDENCE');
DELETE FROM "OrganizationInvitationResourceGrant"
WHERE "resourceType"::text NOT IN ('JOB_SITE', 'WORKER', 'DOCUMENT', 'EVIDENCE');

-- AlterEnum
BEGIN;
CREATE TYPE "AuditAction_new" AS ENUM ('DOCUMENT_CREATED', 'DOCUMENT_UPDATED', 'DOCUMENT_ARCHIVED', 'DOCUMENT_VERSION_UPLOADED', 'DOCUMENT_VERSION_DOWNLOADED', 'DOCUMENT_VERSION_ARCHIVED', 'WORKER_CREATED', 'WORKER_UPDATED', 'WORKER_ARCHIVED', 'JOB_SITE_CREATED', 'JOB_SITE_UPDATED', 'JOB_SITE_ARCHIVED', 'EVIDENCE_CREATED', 'EVIDENCE_UPDATED', 'EVIDENCE_DOWNLOADED', 'EVIDENCE_ARCHIVED', 'NOTIFICATION_READ', 'NOTIFICATION_DISMISSED', 'WORKER_USER_LINK_CREATED', 'WORKER_USER_LINK_ARCHIVED', 'JOB_SITE_USER_ASSIGNMENT_CREATED', 'JOB_SITE_USER_ASSIGNMENT_ARCHIVED', 'JOB_SITE_WORKER_ASSIGNMENT_CREATED', 'JOB_SITE_WORKER_ASSIGNMENT_ARCHIVED', 'ORGANIZATION_PROFILE_UPDATED', 'ORGANIZATION_CONTACT_CREATED', 'ORGANIZATION_CONTACT_UPDATED', 'ORGANIZATION_CONTACT_ARCHIVED', 'DOCUMENT_JOB_SITE_LINK_CREATED', 'DOCUMENT_JOB_SITE_LINK_ARCHIVED', 'ORGANIZATION_INVITATION_CREATED', 'ORGANIZATION_INVITATION_REVOKED', 'ORGANIZATION_INVITATION_ACCEPTED', 'ORGANIZATION_MEMBERSHIP_REVOKED', 'DATA_EXPORT_GENERATED', 'DATA_EXPORT_FAILED', 'DATA_CONTROL_JOB_CREATED', 'DATA_CONTROL_JOB_RUN', 'ORPHAN_BLOB_CLEANUP_RUN', 'ORGANIZATION_DELETE_REQUESTED', 'ORGANIZATION_DELETE_RUN', 'SECURITY_DENIED');
ALTER TABLE "ProductAuditEvent" ALTER COLUMN "action" TYPE "AuditAction_new" USING ("action"::text::"AuditAction_new");
ALTER TYPE "AuditAction" RENAME TO "AuditAction_old";
ALTER TYPE "AuditAction_new" RENAME TO "AuditAction";
DROP TYPE "public"."AuditAction_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "AuditEntityType_new" AS ENUM ('DOCUMENT', 'DOCUMENT_VERSION', 'WORKER', 'JOB_SITE', 'EVIDENCE', 'NOTIFICATION', 'DATA_CONTROL_JOB', 'WORKER_USER_LINK', 'JOB_SITE_USER_ASSIGNMENT', 'JOB_SITE_WORKER_ASSIGNMENT', 'ORGANIZATION_INVITATION', 'ORGANIZATION_MEMBERSHIP', 'ORGANIZATION', 'ORGANIZATION_PROFILE', 'ORGANIZATION_CONTACT', 'DOCUMENT_JOB_SITE_LINK', 'EVIDENCE_REVISION', 'USER', 'SYSTEM');
ALTER TABLE "ProductAuditEvent" ALTER COLUMN "entityType" TYPE "AuditEntityType_new" USING ("entityType"::text::"AuditEntityType_new");
ALTER TYPE "AuditEntityType" RENAME TO "AuditEntityType_old";
ALTER TYPE "AuditEntityType_new" RENAME TO "AuditEntityType";
DROP TYPE "public"."AuditEntityType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationSourceType_new" AS ENUM ('SYSTEM');
ALTER TABLE "Notification" ALTER COLUMN "sourceType" TYPE "NotificationSourceType_new" USING ("sourceType"::text::"NotificationSourceType_new");
ALTER TYPE "NotificationSourceType" RENAME TO "NotificationSourceType_old";
ALTER TYPE "NotificationSourceType_new" RENAME TO "NotificationSourceType";
DROP TYPE "public"."NotificationSourceType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('SYSTEM');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrganizationResourceType_new" AS ENUM ('JOB_SITE', 'WORKER', 'DOCUMENT', 'EVIDENCE');
ALTER TABLE "OrganizationMembershipResourceGrant" ALTER COLUMN "resourceType" TYPE "OrganizationResourceType_new" USING ("resourceType"::text::"OrganizationResourceType_new");
ALTER TABLE "OrganizationInvitationResourceGrant" ALTER COLUMN "resourceType" TYPE "OrganizationResourceType_new" USING ("resourceType"::text::"OrganizationResourceType_new");
ALTER TYPE "OrganizationResourceType" RENAME TO "OrganizationResourceType_old";
ALTER TYPE "OrganizationResourceType_new" RENAME TO "OrganizationResourceType";
DROP TYPE "public"."OrganizationResourceType_old";
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
ALTER TABLE "ContextMessage" DROP CONSTRAINT "ContextMessage_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ContextMessage" DROP CONSTRAINT "ContextMessage_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "ContextMessage" DROP CONSTRAINT "ContextMessage_requestId_fkey";

-- DropForeignKey
ALTER TABLE "ContextTimelineEvent" DROP CONSTRAINT "ContextTimelineEvent_organizationId_fkey";

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
ALTER TABLE "DocumentAcquisition" DROP CONSTRAINT "DocumentAcquisition_checkId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentAcquisition" DROP CONSTRAINT "DocumentAcquisition_confirmedById_fkey";

-- DropForeignKey
ALTER TABLE "DocumentAcquisition" DROP CONSTRAINT "DocumentAcquisition_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentAcquisition" DROP CONSTRAINT "DocumentAcquisition_documentVersionId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentAcquisition" DROP CONSTRAINT "DocumentAcquisition_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentAcquisition" DROP CONSTRAINT "DocumentAcquisition_policyId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackage" DROP CONSTRAINT "DocumentPackage_createdById_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackage" DROP CONSTRAINT "DocumentPackage_jobSiteId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackage" DROP CONSTRAINT "DocumentPackage_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_checklistId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_contextMessageId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_contextTimelineEventId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_documentPackageId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_documentVersionId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_evidenceId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_jobSiteUserAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_jobSiteWorkerAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_operationalRequestId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageItem" DROP CONSTRAINT "DocumentPackageItem_workerId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageRevision" DROP CONSTRAINT "DocumentPackageRevision_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageRevision" DROP CONSTRAINT "DocumentPackageRevision_documentPackageId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageRevision" DROP CONSTRAINT "DocumentPackageRevision_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageRevision" DROP CONSTRAINT "DocumentPackageRevision_preparedById_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageShareProposal" DROP CONSTRAINT "DocumentPackageShareProposal_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageShareProposal" DROP CONSTRAINT "DocumentPackageShareProposal_createdById_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageShareProposal" DROP CONSTRAINT "DocumentPackageShareProposal_decisionId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageShareProposal" DROP CONSTRAINT "DocumentPackageShareProposal_documentPackageId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageShareProposal" DROP CONSTRAINT "DocumentPackageShareProposal_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageShareProposal" DROP CONSTRAINT "DocumentPackageShareProposal_processId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackageShareProposal" DROP CONSTRAINT "DocumentPackageShareProposal_revisionId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentRequirement" DROP CONSTRAINT "DocumentRequirement_documentTypeId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentRequirement" DROP CONSTRAINT "DocumentRequirement_jobSiteId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentRequirement" DROP CONSTRAINT "DocumentRequirement_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentSourceCheck" DROP CONSTRAINT "DocumentSourceCheck_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentSourceCheck" DROP CONSTRAINT "DocumentSourceCheck_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentSourceCheck" DROP CONSTRAINT "DocumentSourceCheck_policyId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentSourceCheck" DROP CONSTRAINT "DocumentSourceCheck_requestedById_fkey";

-- DropForeignKey
ALTER TABLE "DocumentSourcePolicy" DROP CONSTRAINT "DocumentSourcePolicy_documentTypeId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentSourcePolicy" DROP CONSTRAINT "DocumentSourcePolicy_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentSourcePolicy" DROP CONSTRAINT "DocumentSourcePolicy_responsibleUserId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentType" DROP CONSTRAINT "DocumentType_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentVersion" DROP CONSTRAINT "DocumentVersion_reviewedById_fkey";

-- DropForeignKey
ALTER TABLE "Evidence" DROP CONSTRAINT "Evidence_checklistItemId_fkey";

-- DropForeignKey
ALTER TABLE "Evidence" DROP CONSTRAINT "Evidence_reviewedById_fkey";

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
ALTER TABLE "OperationalArtifactReference" DROP CONSTRAINT "OperationalArtifactReference_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalArtifactReference" DROP CONSTRAINT "OperationalArtifactReference_processId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalDecision" DROP CONSTRAINT "OperationalDecision_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalDecision" DROP CONSTRAINT "OperationalDecision_processId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalDecision" DROP CONSTRAINT "OperationalDecision_stepId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalEffectReceipt" DROP CONSTRAINT "OperationalEffectReceipt_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalEffectReceipt" DROP CONSTRAINT "OperationalEffectReceipt_processId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalEffectReceipt" DROP CONSTRAINT "OperationalEffectReceipt_stepId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalEvent" DROP CONSTRAINT "OperationalEvent_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalEvent" DROP CONSTRAINT "OperationalEvent_processId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalEvent" DROP CONSTRAINT "OperationalEvent_stepId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalEventArtifactReference" DROP CONSTRAINT "OperationalEventArtifactReference_eventId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalEventArtifactReference" DROP CONSTRAINT "OperationalEventArtifactReference_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalException" DROP CONSTRAINT "OperationalException_decisionId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalException" DROP CONSTRAINT "OperationalException_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalException" DROP CONSTRAINT "OperationalException_processId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalException" DROP CONSTRAINT "OperationalException_stepId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalProcess" DROP CONSTRAINT "OperationalProcess_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalRequest" DROP CONSTRAINT "OperationalRequest_assigneeUserId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalRequest" DROP CONSTRAINT "OperationalRequest_completedById_fkey";

-- DropForeignKey
ALTER TABLE "OperationalRequest" DROP CONSTRAINT "OperationalRequest_createdById_fkey";

-- DropForeignKey
ALTER TABLE "OperationalRequest" DROP CONSTRAINT "OperationalRequest_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalRuleSnapshot" DROP CONSTRAINT "OperationalRuleSnapshot_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalRuleSnapshot" DROP CONSTRAINT "OperationalRuleSnapshot_processId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalStep" DROP CONSTRAINT "OperationalStep_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OperationalStep" DROP CONSTRAINT "OperationalStep_processId_fkey";

-- DropForeignKey
ALTER TABLE "ShareLink" DROP CONSTRAINT "ShareLink_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ShareLink" DROP CONSTRAINT "ShareLink_documentPackageId_fkey";

-- DropForeignKey
ALTER TABLE "ShareLink" DROP CONSTRAINT "ShareLink_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "ShareLink" DROP CONSTRAINT "ShareLink_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "ShareLink" DROP CONSTRAINT "ShareLink_revisionId_fkey";

-- DropIndex
DROP INDEX "Document_organizationId_documentTypeId_idx";

-- DropIndex
DROP INDEX "Document_organizationId_expiryDate_idx";

-- DropIndex
DROP INDEX "Document_organizationId_status_idx";

-- DropIndex
DROP INDEX "DocumentVersion_organizationId_documentId_reviewStatus_crea_idx";

-- DropIndex
DROP INDEX "DocumentVersion_reviewedById_idx";

-- DropIndex
DROP INDEX "Evidence_organizationId_checklistItemId_idx";

-- DropIndex
DROP INDEX "Evidence_organizationId_reviewStatus_sensitivity_createdAt_idx";

-- DropIndex
DROP INDEX "Evidence_reviewedById_idx";

-- DropIndex
DROP INDEX "JobSite_org_phase_archived_idx";

-- DropIndex
DROP INDEX "JobSite_organizationId_clientName_idx";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "documentTypeId",
DROP COLUMN "expiryDate",
DROP COLUMN "reviewedAt",
DROP COLUMN "reviewedById",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "DocumentVersion" DROP COLUMN "reviewReason",
DROP COLUMN "reviewStatus",
DROP COLUMN "reviewedAt",
DROP COLUMN "reviewedById";

-- AlterTable
ALTER TABLE "Evidence" DROP COLUMN "checklistItemId",
DROP COLUMN "origin",
DROP COLUMN "reviewReason",
DROP COLUMN "reviewStatus",
DROP COLUMN "reviewedAt",
DROP COLUMN "reviewedById",
DROP COLUMN "sensitivity";

-- AlterTable
ALTER TABLE "EvidenceRevision" DROP COLUMN "origin",
DROP COLUMN "reviewStatus",
DROP COLUMN "sensitivity";

-- AlterTable
ALTER TABLE "JobSite" DROP COLUMN "clientName",
DROP COLUMN "operationalPhase";

-- DropTable
DROP TABLE "CalendarEvent";

-- DropTable
DROP TABLE "Checklist";

-- DropTable
DROP TABLE "ChecklistItem";

-- DropTable
DROP TABLE "ContextMessage";

-- DropTable
DROP TABLE "ContextTimelineEvent";

-- DropTable
DROP TABLE "Deadline";

-- DropTable
DROP TABLE "DocumentAcquisition";

-- DropTable
DROP TABLE "DocumentPackage";

-- DropTable
DROP TABLE "DocumentPackageItem";

-- DropTable
DROP TABLE "DocumentPackageRevision";

-- DropTable
DROP TABLE "DocumentPackageShareProposal";

-- DropTable
DROP TABLE "DocumentRequirement";

-- DropTable
DROP TABLE "DocumentSourceCheck";

-- DropTable
DROP TABLE "DocumentSourcePolicy";

-- DropTable
DROP TABLE "DocumentType";

-- DropTable
DROP TABLE "NotificationEmailDelivery";

-- DropTable
DROP TABLE "NotificationPreference";

-- DropTable
DROP TABLE "OperationalArtifactReference";

-- DropTable
DROP TABLE "OperationalDecision";

-- DropTable
DROP TABLE "OperationalEffectReceipt";

-- DropTable
DROP TABLE "OperationalEvent";

-- DropTable
DROP TABLE "OperationalEventArtifactReference";

-- DropTable
DROP TABLE "OperationalException";

-- DropTable
DROP TABLE "OperationalProcess";

-- DropTable
DROP TABLE "OperationalRequest";

-- DropTable
DROP TABLE "OperationalRuleSnapshot";

-- DropTable
DROP TABLE "OperationalStep";

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
DROP TYPE "ContextMessageVisibility";

-- DropEnum
DROP TYPE "DeadlineSourceType";

-- DropEnum
DROP TYPE "DeadlineStatus";

-- DropEnum
DROP TYPE "DocumentAcquisitionStatus";

-- DropEnum
DROP TYPE "DocumentCategoryKey";

-- DropEnum
DROP TYPE "DocumentPackageItemType";

-- DropEnum
DROP TYPE "DocumentPackageRevisionOrigin";

-- DropEnum
DROP TYPE "DocumentPackageRevisionStatus";

-- DropEnum
DROP TYPE "DocumentPackageShareProposalStatus";

-- DropEnum
DROP TYPE "DocumentPackageShareProposalTarget";

-- DropEnum
DROP TYPE "DocumentPackageStatus";

-- DropEnum
DROP TYPE "DocumentSensitivity";

-- DropEnum
DROP TYPE "DocumentSourceCheckStatus";

-- DropEnum
DROP TYPE "DocumentSourceType";

-- DropEnum
DROP TYPE "DocumentStatus";

-- DropEnum
DROP TYPE "DocumentTypeAppliesTo";

-- DropEnum
DROP TYPE "DocumentVersionReviewStatus";

-- DropEnum
DROP TYPE "EmailDigestFrequency";

-- DropEnum
DROP TYPE "EvidenceOrigin";

-- DropEnum
DROP TYPE "EvidenceReviewStatus";

-- DropEnum
DROP TYPE "EvidenceSensitivity";

-- DropEnum
DROP TYPE "JobSiteOperationalPhase";

-- DropEnum
DROP TYPE "NotificationEmailDeliveryStatus";

-- DropEnum
DROP TYPE "NotificationEmailDeliveryType";

-- DropEnum
DROP TYPE "OperationalActorType";

-- DropEnum
DROP TYPE "OperationalArtifactType";

-- DropEnum
DROP TYPE "OperationalDecisionStatus";

-- DropEnum
DROP TYPE "OperationalDecisionType";

-- DropEnum
DROP TYPE "OperationalEffectType";

-- DropEnum
DROP TYPE "OperationalEventKind";

-- DropEnum
DROP TYPE "OperationalEventSourceType";

-- DropEnum
DROP TYPE "OperationalEventType";

-- DropEnum
DROP TYPE "OperationalExceptionSeverity";

-- DropEnum
DROP TYPE "OperationalExceptionStatus";

-- DropEnum
DROP TYPE "OperationalExceptionType";

-- DropEnum
DROP TYPE "OperationalImpact";

-- DropEnum
DROP TYPE "OperationalProcessStatus";

-- DropEnum
DROP TYPE "OperationalProcessType";

-- DropEnum
DROP TYPE "OperationalReliability";

-- DropEnum
DROP TYPE "OperationalRequestStatus";

-- DropEnum
DROP TYPE "OperationalStepStatus";

-- DropEnum
DROP TYPE "RequirementTargetType";
