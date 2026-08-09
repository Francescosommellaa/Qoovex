-- Forward-only cleanup of autonomous document/evidence surfaces and account-role onboarding.
-- The six preceding migrations are immutable historical evidence.

CREATE TYPE "AccountRole" AS ENUM ('BUSINESS', 'PROFESSIONAL', 'CLIENT');
ALTER TABLE "User" ADD COLUMN "accountRole" "AccountRole";

-- Resource grants to retired autonomous resources cannot remain valid.
DELETE FROM "OrganizationMembershipResourceGrant" WHERE "resourceType"::text IN ('DOCUMENT', 'EVIDENCE');
DELETE FROM "OrganizationInvitationResourceGrant" WHERE "resourceType"::text IN ('DOCUMENT', 'EVIDENCE');

CREATE TYPE "OrganizationResourceType_new" AS ENUM ('JOB_SITE', 'WORKER');
ALTER TABLE "OrganizationMembershipResourceGrant" ALTER COLUMN "resourceType" TYPE "OrganizationResourceType_new" USING ("resourceType"::text::"OrganizationResourceType_new");
ALTER TABLE "OrganizationInvitationResourceGrant" ALTER COLUMN "resourceType" TYPE "OrganizationResourceType_new" USING ("resourceType"::text::"OrganizationResourceType_new");
ALTER TYPE "OrganizationResourceType" RENAME TO "OrganizationResourceType_old";
ALTER TYPE "OrganizationResourceType_new" RENAME TO "OrganizationResourceType";
DROP TYPE "OrganizationResourceType_old";

-- The document-reviewer preset had no capability after autonomous documents were retired.
UPDATE "OrganizationMembership" SET "preset" = 'READ_ONLY' WHERE "preset"::text = 'DOCUMENT_REVIEWER';
UPDATE "OrganizationInvitation" SET "preset" = 'READ_ONLY' WHERE "preset"::text = 'DOCUMENT_REVIEWER';
CREATE TYPE "OrganizationAccessPreset_new" AS ENUM ('READ_ONLY', 'OPERATIONAL_COLLABORATION', 'SITE_MANAGER', 'LIMITED_UPLOAD', 'CUSTOM');
ALTER TABLE "OrganizationMembership" ALTER COLUMN "preset" TYPE "OrganizationAccessPreset_new" USING ("preset"::text::"OrganizationAccessPreset_new");
ALTER TABLE "OrganizationInvitation" ALTER COLUMN "preset" TYPE "OrganizationAccessPreset_new" USING ("preset"::text::"OrganizationAccessPreset_new");
ALTER TYPE "OrganizationAccessPreset" RENAME TO "OrganizationAccessPreset_old";
ALTER TYPE "OrganizationAccessPreset_new" RENAME TO "OrganizationAccessPreset";
DROP TYPE "OrganizationAccessPreset_old";

-- Product audit entries for retired entities are removed together with the retired data.
DELETE FROM "ProductAuditEvent"
WHERE "action"::text IN (
  'DOCUMENT_CREATED', 'DOCUMENT_UPDATED', 'DOCUMENT_ARCHIVED',
  'DOCUMENT_VERSION_UPLOADED', 'DOCUMENT_VERSION_DOWNLOADED', 'DOCUMENT_VERSION_ARCHIVED',
  'EVIDENCE_CREATED', 'EVIDENCE_UPDATED', 'EVIDENCE_DOWNLOADED', 'EVIDENCE_ARCHIVED',
  'DOCUMENT_JOB_SITE_LINK_CREATED', 'DOCUMENT_JOB_SITE_LINK_ARCHIVED'
) OR "entityType"::text IN ('DOCUMENT', 'DOCUMENT_VERSION', 'EVIDENCE', 'DOCUMENT_JOB_SITE_LINK', 'EVIDENCE_REVISION');

CREATE TYPE "AuditAction_new" AS ENUM (
  'WORKER_CREATED', 'WORKER_UPDATED', 'WORKER_ARCHIVED', 'JOB_SITE_CREATED', 'JOB_SITE_UPDATED', 'JOB_SITE_ARCHIVED',
  'NOTIFICATION_READ', 'NOTIFICATION_DISMISSED', 'WORKER_USER_LINK_CREATED', 'WORKER_USER_LINK_ARCHIVED',
  'JOB_SITE_PARTICIPANT_CREATED', 'JOB_SITE_PARTICIPANT_UPDATED', 'JOB_SITE_PARTICIPANT_ENDED',
  'JOB_SITE_WORKER_ASSIGNMENT_CREATED', 'JOB_SITE_WORKER_ASSIGNMENT_ARCHIVED', 'ORGANIZATION_PROFILE_UPDATED',
  'ORGANIZATION_CONTACT_CREATED', 'ORGANIZATION_CONTACT_UPDATED', 'ORGANIZATION_CONTACT_ARCHIVED',
  'ORGANIZATION_INVITATION_CREATED', 'ORGANIZATION_INVITATION_REVOKED', 'ORGANIZATION_INVITATION_ACCEPTED',
  'ORGANIZATION_MEMBERSHIP_REVOKED', 'DATA_EXPORT_GENERATED', 'DATA_EXPORT_FAILED', 'DATA_CONTROL_JOB_CREATED',
  'DATA_CONTROL_JOB_RUN', 'ORPHAN_BLOB_CLEANUP_RUN', 'JOB_SITE_ACTION_EXECUTED', 'JOB_SITE_TIMELINE_APPENDED',
  'JOB_SITE_ATTACHMENT_DOWNLOADED', 'JOB_SITE_ATTACHMENT_UPLOADED', 'JOB_SITE_AUTHORITY_GRANTED',
  'JOB_SITE_AUTHORITY_REVOKED', 'JOB_SITE_EXPORT_DOWNLOADED', 'PAYMENT_PROFILE_UPDATED', 'LEGAL_HOLD_PLACED',
  'LEGAL_HOLD_RELEASED', 'SECURITY_DENIED'
);
ALTER TABLE "ProductAuditEvent" ALTER COLUMN "action" TYPE "AuditAction_new" USING ("action"::text::"AuditAction_new");
ALTER TYPE "AuditAction" RENAME TO "AuditAction_old";
ALTER TYPE "AuditAction_new" RENAME TO "AuditAction";
DROP TYPE "AuditAction_old";

CREATE TYPE "AuditEntityType_new" AS ENUM (
  'WORKER', 'JOB_SITE', 'NOTIFICATION', 'DATA_CONTROL_JOB', 'WORKER_USER_LINK', 'JOB_SITE_PARTICIPANT',
  'JOB_SITE_WORKER_ASSIGNMENT', 'JOB_SITE_ATTACHMENT', 'JOB_SITE_TIMELINE_EVENT', 'JOB_SITE_CHANGE_PROPOSAL',
  'JOB_SITE_PAYMENT_REQUEST', 'JOB_SITE_DISPUTE', 'JOB_SITE_CLOSURE', 'JOB_SITE_EXPORT', 'LEGAL_HOLD',
  'ORGANIZATION_PAYMENT_PROFILE', 'ORGANIZATION_INVITATION', 'ORGANIZATION_MEMBERSHIP', 'ORGANIZATION',
  'ORGANIZATION_PROFILE', 'ORGANIZATION_CONTACT', 'USER', 'SYSTEM'
);
ALTER TABLE "ProductAuditEvent" ALTER COLUMN "entityType" TYPE "AuditEntityType_new" USING ("entityType"::text::"AuditEntityType_new");
ALTER TYPE "AuditEntityType" RENAME TO "AuditEntityType_old";
ALTER TYPE "AuditEntityType_new" RENAME TO "AuditEntityType";
DROP TYPE "AuditEntityType_old";

DROP TABLE "DocumentJobSiteLink";
DROP TABLE "DocumentVersion" CASCADE;
DROP TABLE "Document";
DROP TABLE "EvidenceRevision";
DROP TABLE "Evidence";
DROP TYPE "DocumentOwnerType";
DROP TYPE "EvidenceType";
