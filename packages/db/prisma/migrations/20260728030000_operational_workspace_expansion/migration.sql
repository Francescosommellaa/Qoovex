-- Extend the existing lifecycle enums without rewriting historical values.
ALTER TYPE "JobSiteOperationalPhase" ADD VALUE IF NOT EXISTS 'DRAFT' BEFORE 'PREPARATION';
ALTER TYPE "JobSiteUserAssignmentRole" ADD VALUE IF NOT EXISTS 'DOCUMENT_REVIEWER';
ALTER TYPE "JobSiteUserAssignmentRole" ADD VALUE IF NOT EXISTS 'CONTRIBUTOR';

ALTER TYPE "DocumentPackageItemType" ADD VALUE IF NOT EXISTS 'WORKER';
ALTER TYPE "DocumentPackageItemType" ADD VALUE IF NOT EXISTS 'JOB_SITE_USER_ASSIGNMENT';
ALTER TYPE "DocumentPackageItemType" ADD VALUE IF NOT EXISTS 'JOB_SITE_WORKER_ASSIGNMENT';
ALTER TYPE "DocumentPackageItemType" ADD VALUE IF NOT EXISTS 'OPERATIONAL_REQUEST';
ALTER TYPE "DocumentPackageItemType" ADD VALUE IF NOT EXISTS 'CONTEXT_MESSAGE';
ALTER TYPE "DocumentPackageItemType" ADD VALUE IF NOT EXISTS 'CONTEXT_TIMELINE_EVENT';

ALTER TYPE "OperationalArtifactType" ADD VALUE IF NOT EXISTS 'OPERATIONAL_REQUEST';
ALTER TYPE "OperationalArtifactType" ADD VALUE IF NOT EXISTS 'CONTEXT_MESSAGE';
ALTER TYPE "OperationalArtifactType" ADD VALUE IF NOT EXISTS 'DOCUMENT_SOURCE';

ALTER TYPE "OperationalEventType" ADD VALUE IF NOT EXISTS 'JOB_SITE_PHASE_CHANGED';
ALTER TYPE "OperationalEventType" ADD VALUE IF NOT EXISTS 'ASSIGNMENT_STARTED';
ALTER TYPE "OperationalEventType" ADD VALUE IF NOT EXISTS 'ASSIGNMENT_ENDED';
ALTER TYPE "OperationalEventType" ADD VALUE IF NOT EXISTS 'EVIDENCE_RECORDED';
ALTER TYPE "OperationalEventType" ADD VALUE IF NOT EXISTS 'EVIDENCE_REVIEWED';
ALTER TYPE "OperationalEventType" ADD VALUE IF NOT EXISTS 'REQUEST_CREATED';
ALTER TYPE "OperationalEventType" ADD VALUE IF NOT EXISTS 'REQUEST_UPDATED';
ALTER TYPE "OperationalEventType" ADD VALUE IF NOT EXISTS 'CONTEXT_MESSAGE_ADDED';
ALTER TYPE "OperationalEventType" ADD VALUE IF NOT EXISTS 'DOCUMENT_SOURCE_CHECKED';
ALTER TYPE "OperationalEventType" ADD VALUE IF NOT EXISTS 'DOCUMENT_LINKED_TO_JOB_SITE';
ALTER TYPE "OperationalEventType" ADD VALUE IF NOT EXISTS 'DOCUMENT_UNLINKED_FROM_JOB_SITE';
ALTER TYPE "OperationalEventType" ADD VALUE IF NOT EXISTS 'DOCUMENT_VERSION_REVIEWED';

ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'ORGANIZATION_PROFILE_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'ORGANIZATION_CONTACT_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'ORGANIZATION_CONTACT_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'ORGANIZATION_CONTACT_ARCHIVED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'DOCUMENT_JOB_SITE_LINK_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'DOCUMENT_JOB_SITE_LINK_ARCHIVED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'DOCUMENT_VERSION_REVIEWED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'EVIDENCE_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'EVIDENCE_REVIEWED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'OPERATIONAL_REQUEST_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'OPERATIONAL_REQUEST_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'CONTEXT_MESSAGE_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'DOCUMENT_SOURCE_POLICY_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'DOCUMENT_SOURCE_POLICY_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'DOCUMENT_SOURCE_CHECK_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'DOCUMENT_SOURCE_CHECK_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'DOCUMENT_ACQUISITION_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'JOB_SITE_PHASE_CHANGED';

ALTER TYPE "AuditEntityType" ADD VALUE IF NOT EXISTS 'ORGANIZATION_PROFILE';
ALTER TYPE "AuditEntityType" ADD VALUE IF NOT EXISTS 'ORGANIZATION_CONTACT';
ALTER TYPE "AuditEntityType" ADD VALUE IF NOT EXISTS 'DOCUMENT_JOB_SITE_LINK';
ALTER TYPE "AuditEntityType" ADD VALUE IF NOT EXISTS 'EVIDENCE_REVISION';
ALTER TYPE "AuditEntityType" ADD VALUE IF NOT EXISTS 'OPERATIONAL_REQUEST';
ALTER TYPE "AuditEntityType" ADD VALUE IF NOT EXISTS 'CONTEXT_MESSAGE';
ALTER TYPE "AuditEntityType" ADD VALUE IF NOT EXISTS 'CONTEXT_TIMELINE_EVENT';
ALTER TYPE "AuditEntityType" ADD VALUE IF NOT EXISTS 'DOCUMENT_SOURCE_POLICY';
ALTER TYPE "AuditEntityType" ADD VALUE IF NOT EXISTS 'DOCUMENT_SOURCE_CHECK';
ALTER TYPE "AuditEntityType" ADD VALUE IF NOT EXISTS 'DOCUMENT_ACQUISITION';

CREATE TYPE "DocumentVersionReviewStatus" AS ENUM ('TO_REVIEW', 'CURRENT', 'SUPERSEDED', 'REJECTED');
CREATE TYPE "EvidenceSensitivity" AS ENUM ('INTERNAL', 'SHAREABLE', 'RESTRICTED');
CREATE TYPE "EvidenceReviewStatus" AS ENUM ('RECORDED', 'TO_REVIEW', 'ACCEPTED', 'REJECTED');
CREATE TYPE "EvidenceOrigin" AS ENUM ('DIRECT_UPLOAD', 'GUIDED_MANUAL', 'AUTHORIZED_INTEGRATION');
CREATE TYPE "OrganizationContactKind" AS ENUM ('GENERAL', 'ADMINISTRATION', 'SAFETY', 'TECHNICAL');
CREATE TYPE "OperationalRequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ContextMessageVisibility" AS ENUM ('INTERNAL');
CREATE TYPE "DocumentSourceType" AS ENUM ('DIRECT_UPLOAD', 'GUIDED_MANUAL', 'AUTHORIZED_INTEGRATION');
CREATE TYPE "DocumentSourceCheckStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'NEEDS_ACTION');
CREATE TYPE "DocumentAcquisitionStatus" AS ENUM ('PENDING_REVIEW', 'COMPLETED', 'FAILED');

-- Job sites preserve legacy phases and use DRAFT for new records.
UPDATE "JobSite" SET "operationalPhase" = 'PREPARATION' WHERE "operationalPhase" IS NULL;
ALTER TABLE "JobSite" ALTER COLUMN "operationalPhase" SET DEFAULT 'DRAFT';
ALTER TABLE "JobSite" ALTER COLUMN "operationalPhase" SET NOT NULL;

ALTER TABLE "JobSiteUserAssignment"
  ADD COLUMN "operationalRoleLabel" TEXT,
  ADD COLUMN "taskLabel" TEXT,
  ADD COLUMN "startsAt" TIMESTAMP(3),
  ADD COLUMN "endsAt" TIMESTAMP(3),
  ADD COLUMN "endedById" TEXT,
  ADD COLUMN "endReason" TEXT;
UPDATE "JobSiteUserAssignment" SET "startsAt" = "createdAt" WHERE "startsAt" IS NULL;
ALTER TABLE "JobSiteUserAssignment" ALTER COLUMN "startsAt" SET NOT NULL;
ALTER TABLE "JobSiteUserAssignment" ALTER COLUMN "startsAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "JobSiteWorkerAssignment"
  ADD COLUMN "operationalRoleLabel" TEXT,
  ADD COLUMN "taskLabel" TEXT,
  ADD COLUMN "startsAt" TIMESTAMP(3),
  ADD COLUMN "endsAt" TIMESTAMP(3),
  ADD COLUMN "endedById" TEXT,
  ADD COLUMN "endReason" TEXT;
UPDATE "JobSiteWorkerAssignment" SET "startsAt" = "createdAt" WHERE "startsAt" IS NULL;
ALTER TABLE "JobSiteWorkerAssignment" ALTER COLUMN "startsAt" SET NOT NULL;
ALTER TABLE "JobSiteWorkerAssignment" ALTER COLUMN "startsAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Document" ADD COLUMN "currentVersionId" TEXT;
ALTER TABLE "DocumentVersion"
  ADD COLUMN "reviewStatus" "DocumentVersionReviewStatus" NOT NULL DEFAULT 'TO_REVIEW',
  ADD COLUMN "reviewedById" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3),
  ADD COLUMN "reviewReason" TEXT;

WITH ranked_versions AS (
  SELECT "id", "documentId", ROW_NUMBER() OVER (PARTITION BY "documentId" ORDER BY "createdAt" DESC, "id" DESC) AS rank
  FROM "DocumentVersion"
  WHERE "archivedAt" IS NULL
)
UPDATE "DocumentVersion" AS version
SET "reviewStatus" = CASE WHEN ranked.rank = 1 THEN 'CURRENT'::"DocumentVersionReviewStatus" ELSE 'SUPERSEDED'::"DocumentVersionReviewStatus" END
FROM ranked_versions AS ranked
WHERE version."id" = ranked."id";

UPDATE "DocumentVersion" SET "reviewStatus" = 'SUPERSEDED' WHERE "archivedAt" IS NOT NULL;

WITH current_versions AS (
  SELECT "documentId", "id"
  FROM "DocumentVersion"
  WHERE "reviewStatus" = 'CURRENT'
)
UPDATE "Document" AS document
SET "currentVersionId" = current_versions."id"
FROM current_versions
WHERE document."id" = current_versions."documentId";

ALTER TABLE "Evidence"
  ADD COLUMN "sensitivity" "EvidenceSensitivity" NOT NULL DEFAULT 'INTERNAL',
  ADD COLUMN "reviewStatus" "EvidenceReviewStatus" NOT NULL DEFAULT 'RECORDED',
  ADD COLUMN "origin" "EvidenceOrigin" NOT NULL DEFAULT 'DIRECT_UPLOAD',
  ADD COLUMN "capturedAt" TIMESTAMP(3),
  ADD COLUMN "reviewedById" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3),
  ADD COLUMN "reviewReason" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3);
UPDATE "Evidence" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
ALTER TABLE "Evidence" ALTER COLUMN "updatedAt" SET NOT NULL;

ALTER TABLE "DocumentPackageItem"
  ADD COLUMN "workerId" TEXT,
  ADD COLUMN "jobSiteUserAssignmentId" TEXT,
  ADD COLUMN "jobSiteWorkerAssignmentId" TEXT,
  ADD COLUMN "operationalRequestId" TEXT,
  ADD COLUMN "contextMessageId" TEXT,
  ADD COLUMN "contextTimelineEventId" TEXT;

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

CREATE TABLE "EvidenceRevision" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "evidenceId" TEXT NOT NULL,
  "revisionNumber" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "sensitivity" "EvidenceSensitivity" NOT NULL,
  "reviewStatus" "EvidenceReviewStatus" NOT NULL,
  "capturedAt" TIMESTAMP(3),
  "origin" "EvidenceOrigin" NOT NULL,
  "reason" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EvidenceRevision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OperationalRequest" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "targetType" "OperationalArtifactType" NOT NULL,
  "targetId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "OperationalRequestStatus" NOT NULL DEFAULT 'OPEN',
  "assigneeUserId" TEXT,
  "dueAt" TIMESTAMP(3),
  "outcome" TEXT,
  "createdById" TEXT NOT NULL,
  "completedById" TEXT,
  "completedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OperationalRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContextMessage" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "requestId" TEXT,
  "targetType" "OperationalArtifactType" NOT NULL,
  "targetId" TEXT NOT NULL,
  "visibility" "ContextMessageVisibility" NOT NULL DEFAULT 'INTERNAL',
  "body" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContextMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContextTimelineEvent" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "eventKey" TEXT NOT NULL,
  "targetType" "OperationalArtifactType" NOT NULL,
  "targetId" TEXT NOT NULL,
  "eventType" "OperationalEventType" NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "metadata" JSONB,
  "actorUserId" TEXT,
  "actorType" "OperationalActorType" NOT NULL DEFAULT 'USER',
  "actorRole" "OrganizationRole",
  "sourceType" "OperationalEventSourceType" NOT NULL DEFAULT 'DOMAIN',
  "sourceId" TEXT,
  "reliability" "OperationalReliability" NOT NULL DEFAULT 'VERIFIED',
  "impact" "OperationalImpact" NOT NULL DEFAULT 'LOW',
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContextTimelineEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentSourcePolicy" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "documentTypeId" TEXT,
  "categoryKey" "DocumentCategoryKey" NOT NULL,
  "sourceType" "DocumentSourceType" NOT NULL,
  "responsibleUserId" TEXT,
  "label" TEXT NOT NULL,
  "triggerKinds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "allowSharing" BOOLEAN NOT NULL DEFAULT false,
  "allowAi" BOOLEAN NOT NULL DEFAULT false,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "archivedAt" TIMESTAMP(3),
  CONSTRAINT "DocumentSourcePolicy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentSourceCheck" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "policyId" TEXT NOT NULL,
  "documentId" TEXT,
  "status" "DocumentSourceCheckStatus" NOT NULL DEFAULT 'PENDING',
  "triggerKind" TEXT NOT NULL,
  "summary" TEXT,
  "errorCode" TEXT,
  "nextCheckAt" TIMESTAMP(3),
  "requestedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "DocumentSourceCheck_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentAcquisition" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "policyId" TEXT,
  "checkId" TEXT,
  "documentId" TEXT NOT NULL,
  "documentVersionId" TEXT,
  "sourceType" "DocumentSourceType" NOT NULL,
  "status" "DocumentAcquisitionStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
  "provenanceLabel" TEXT NOT NULL,
  "checksum" TEXT,
  "errorCode" TEXT,
  "confirmedById" TEXT,
  "confirmedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DocumentAcquisition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrganizationProfile_organizationId_key" ON "OrganizationProfile"("organizationId");
CREATE UNIQUE INDEX "Document_currentVersionId_key" ON "Document"("currentVersionId");
CREATE UNIQUE INDEX "EvidenceRevision_evidenceId_revisionNumber_key" ON "EvidenceRevision"("evidenceId", "revisionNumber");
CREATE UNIQUE INDEX "ContextTimelineEvent_organizationId_eventKey_key" ON "ContextTimelineEvent"("organizationId", "eventKey");

CREATE INDEX "OrganizationProfile_organizationId_legalName_idx" ON "OrganizationProfile"("organizationId", "legalName");
CREATE INDEX "OrganizationContact_organizationId_archivedAt_sortOrder_idx" ON "OrganizationContact"("organizationId", "archivedAt", "sortOrder");
CREATE INDEX "OrganizationContact_organizationId_kind_archivedAt_idx" ON "OrganizationContact"("organizationId", "kind", "archivedAt");
CREATE INDEX "DocumentJobSiteLink_organizationId_documentId_unlinkedAt_idx" ON "DocumentJobSiteLink"("organizationId", "documentId", "unlinkedAt");
CREATE INDEX "DocumentJobSiteLink_organizationId_jobSiteId_unlinkedAt_idx" ON "DocumentJobSiteLink"("organizationId", "jobSiteId", "unlinkedAt");
CREATE INDEX "DocumentJobSiteLink_organizationId_validFrom_validTo_idx" ON "DocumentJobSiteLink"("organizationId", "validFrom", "validTo");
CREATE INDEX "DocumentVersion_organizationId_documentId_reviewStatus_createdAt_idx" ON "DocumentVersion"("organizationId", "documentId", "reviewStatus", "createdAt");
CREATE INDEX "Evidence_organizationId_reviewStatus_sensitivity_createdAt_idx" ON "Evidence"("organizationId", "reviewStatus", "sensitivity", "createdAt");
CREATE INDEX "EvidenceRevision_organizationId_evidenceId_createdAt_idx" ON "EvidenceRevision"("organizationId", "evidenceId", "createdAt");
CREATE INDEX "OperationalRequest_organizationId_status_dueAt_idx" ON "OperationalRequest"("organizationId", "status", "dueAt");
CREATE INDEX "OperationalRequest_organizationId_assigneeUserId_status_idx" ON "OperationalRequest"("organizationId", "assigneeUserId", "status");
CREATE INDEX "OperationalRequest_organizationId_targetType_targetId_createdAt_idx" ON "OperationalRequest"("organizationId", "targetType", "targetId", "createdAt");
CREATE INDEX "ContextMessage_organizationId_targetType_targetId_createdAt_idx" ON "ContextMessage"("organizationId", "targetType", "targetId", "createdAt");
CREATE INDEX "ContextMessage_organizationId_requestId_createdAt_idx" ON "ContextMessage"("organizationId", "requestId", "createdAt");
CREATE INDEX "ContextTimelineEvent_organizationId_targetType_targetId_occurredAt_idx" ON "ContextTimelineEvent"("organizationId", "targetType", "targetId", "occurredAt");
CREATE INDEX "ContextTimelineEvent_organizationId_eventType_occurredAt_idx" ON "ContextTimelineEvent"("organizationId", "eventType", "occurredAt");
CREATE INDEX "DocumentSourcePolicy_organizationId_categoryKey_archivedAt_idx" ON "DocumentSourcePolicy"("organizationId", "categoryKey", "archivedAt");
CREATE INDEX "DocumentSourcePolicy_organizationId_documentTypeId_archivedAt_idx" ON "DocumentSourcePolicy"("organizationId", "documentTypeId", "archivedAt");
CREATE INDEX "DocumentSourceCheck_organizationId_status_createdAt_idx" ON "DocumentSourceCheck"("organizationId", "status", "createdAt");
CREATE INDEX "DocumentSourceCheck_organizationId_policyId_createdAt_idx" ON "DocumentSourceCheck"("organizationId", "policyId", "createdAt");
CREATE INDEX "DocumentSourceCheck_organizationId_documentId_createdAt_idx" ON "DocumentSourceCheck"("organizationId", "documentId", "createdAt");
CREATE INDEX "DocumentAcquisition_organizationId_documentId_createdAt_idx" ON "DocumentAcquisition"("organizationId", "documentId", "createdAt");
CREATE INDEX "DocumentAcquisition_organizationId_policyId_status_idx" ON "DocumentAcquisition"("organizationId", "policyId", "status");
CREATE INDEX "DocumentAcquisition_organizationId_checkId_idx" ON "DocumentAcquisition"("organizationId", "checkId");

CREATE INDEX "JobSiteUserAssignment_organizationId_startsAt_endsAt_idx" ON "JobSiteUserAssignment"("organizationId", "startsAt", "endsAt");
CREATE INDEX "JobSiteWorkerAssignment_organizationId_startsAt_endsAt_idx" ON "JobSiteWorkerAssignment"("organizationId", "startsAt", "endsAt");
CREATE INDEX "JobSiteUserAssignment_endedById_idx" ON "JobSiteUserAssignment"("endedById");
CREATE INDEX "JobSiteWorkerAssignment_endedById_idx" ON "JobSiteWorkerAssignment"("endedById");
CREATE INDEX "DocumentVersion_reviewedById_idx" ON "DocumentVersion"("reviewedById");
CREATE INDEX "Evidence_reviewedById_idx" ON "Evidence"("reviewedById");
CREATE INDEX "OrganizationContact_userId_idx" ON "OrganizationContact"("userId");
CREATE INDEX "DocumentJobSiteLink_linkedById_idx" ON "DocumentJobSiteLink"("linkedById");
CREATE INDEX "DocumentJobSiteLink_unlinkedById_idx" ON "DocumentJobSiteLink"("unlinkedById");
CREATE INDEX "EvidenceRevision_createdById_idx" ON "EvidenceRevision"("createdById");
CREATE INDEX "OperationalRequest_createdById_idx" ON "OperationalRequest"("createdById");
CREATE INDEX "OperationalRequest_completedById_idx" ON "OperationalRequest"("completedById");
CREATE INDEX "ContextMessage_authorId_createdAt_idx" ON "ContextMessage"("authorId", "createdAt");
CREATE INDEX "DocumentSourcePolicy_responsibleUserId_idx" ON "DocumentSourcePolicy"("responsibleUserId");
CREATE INDEX "DocumentSourceCheck_requestedById_idx" ON "DocumentSourceCheck"("requestedById");
CREATE INDEX "DocumentAcquisition_documentVersionId_idx" ON "DocumentAcquisition"("documentVersionId");
CREATE INDEX "DocumentAcquisition_confirmedById_idx" ON "DocumentAcquisition"("confirmedById");
CREATE INDEX "DocumentPackageItem_organizationId_workerId_idx" ON "DocumentPackageItem"("organizationId", "workerId");
CREATE INDEX "DocumentPackageItem_organizationId_jobSiteUserAssignmentId_idx" ON "DocumentPackageItem"("organizationId", "jobSiteUserAssignmentId");
CREATE INDEX "DocumentPackageItem_organizationId_jobSiteWorkerAssignmentId_idx" ON "DocumentPackageItem"("organizationId", "jobSiteWorkerAssignmentId");
CREATE INDEX "DocumentPackageItem_organizationId_operationalRequestId_idx" ON "DocumentPackageItem"("organizationId", "operationalRequestId");
CREATE INDEX "DocumentPackageItem_organizationId_contextMessageId_idx" ON "DocumentPackageItem"("organizationId", "contextMessageId");
CREATE INDEX "DocumentPackageItem_organizationId_contextTimelineEventId_idx" ON "DocumentPackageItem"("organizationId", "contextTimelineEventId");

ALTER TABLE "JobSiteUserAssignment" ADD CONSTRAINT "JobSiteUserAssignment_endedById_fkey" FOREIGN KEY ("endedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobSiteWorkerAssignment" ADD CONSTRAINT "JobSiteWorkerAssignment_endedById_fkey" FOREIGN KEY ("endedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "DocumentVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OrganizationProfile" ADD CONSTRAINT "OrganizationProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationContact" ADD CONSTRAINT "OrganizationContact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationContact" ADD CONSTRAINT "OrganizationContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentJobSiteLink" ADD CONSTRAINT "DocumentJobSiteLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentJobSiteLink" ADD CONSTRAINT "DocumentJobSiteLink_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentJobSiteLink" ADD CONSTRAINT "DocumentJobSiteLink_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentJobSiteLink" ADD CONSTRAINT "DocumentJobSiteLink_linkedById_fkey" FOREIGN KEY ("linkedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DocumentJobSiteLink" ADD CONSTRAINT "DocumentJobSiteLink_unlinkedById_fkey" FOREIGN KEY ("unlinkedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EvidenceRevision" ADD CONSTRAINT "EvidenceRevision_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EvidenceRevision" ADD CONSTRAINT "EvidenceRevision_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EvidenceRevision" ADD CONSTRAINT "EvidenceRevision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OperationalRequest" ADD CONSTRAINT "OperationalRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalRequest" ADD CONSTRAINT "OperationalRequest_assigneeUserId_fkey" FOREIGN KEY ("assigneeUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OperationalRequest" ADD CONSTRAINT "OperationalRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OperationalRequest" ADD CONSTRAINT "OperationalRequest_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContextMessage" ADD CONSTRAINT "ContextMessage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContextMessage" ADD CONSTRAINT "ContextMessage_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "OperationalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContextMessage" ADD CONSTRAINT "ContextMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContextTimelineEvent" ADD CONSTRAINT "ContextTimelineEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentSourcePolicy" ADD CONSTRAINT "DocumentSourcePolicy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentSourcePolicy" ADD CONSTRAINT "DocumentSourcePolicy_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentSourcePolicy" ADD CONSTRAINT "DocumentSourcePolicy_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentSourceCheck" ADD CONSTRAINT "DocumentSourceCheck_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentSourceCheck" ADD CONSTRAINT "DocumentSourceCheck_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "DocumentSourcePolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentSourceCheck" ADD CONSTRAINT "DocumentSourceCheck_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentSourceCheck" ADD CONSTRAINT "DocumentSourceCheck_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentAcquisition" ADD CONSTRAINT "DocumentAcquisition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentAcquisition" ADD CONSTRAINT "DocumentAcquisition_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "DocumentSourcePolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentAcquisition" ADD CONSTRAINT "DocumentAcquisition_checkId_fkey" FOREIGN KEY ("checkId") REFERENCES "DocumentSourceCheck"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentAcquisition" ADD CONSTRAINT "DocumentAcquisition_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentAcquisition" ADD CONSTRAINT "DocumentAcquisition_documentVersionId_fkey" FOREIGN KEY ("documentVersionId") REFERENCES "DocumentVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentAcquisition" ADD CONSTRAINT "DocumentAcquisition_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_jobSiteUserAssignmentId_fkey" FOREIGN KEY ("jobSiteUserAssignmentId") REFERENCES "JobSiteUserAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_jobSiteWorkerAssignmentId_fkey" FOREIGN KEY ("jobSiteWorkerAssignmentId") REFERENCES "JobSiteWorkerAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_operationalRequestId_fkey" FOREIGN KEY ("operationalRequestId") REFERENCES "OperationalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_contextMessageId_fkey" FOREIGN KEY ("contextMessageId") REFERENCES "ContextMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_contextTimelineEventId_fkey" FOREIGN KEY ("contextTimelineEventId") REFERENCES "ContextTimelineEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
