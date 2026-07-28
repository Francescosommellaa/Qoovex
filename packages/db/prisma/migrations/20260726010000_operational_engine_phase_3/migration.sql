-- Additive Phase 3 operational engine. No existing domain data is rewritten.
CREATE TYPE "OperationalProcessType" AS ENUM ('DOCUMENT_RECEIVED', 'WORKER_CREATED', 'JOB_SITE_CREATED', 'CONTINUOUS_CONTROL');
CREATE TYPE "OperationalProcessStatus" AS ENUM ('RECEIVED', 'READY', 'RUNNING', 'WAITING_FOR_DECISION', 'BLOCKED', 'RETRY_SCHEDULED', 'COMPLETED', 'COMPLETED_WITH_EXCEPTIONS', 'TECHNICAL_FAILURE');
CREATE TYPE "OperationalStepStatus" AS ENUM ('WAITING', 'READY', 'RUNNING', 'COMPLETED', 'BLOCKED', 'RETRY_SCHEDULED', 'TECHNICAL_FAILURE', 'SKIPPED');
CREATE TYPE "OperationalEventKind" AS ENUM ('INPUT', 'DOMAIN', 'TEMPORAL', 'DECISION', 'TECHNICAL', 'RETRY', 'COMPLETION', 'BLOCKED', 'RECONCILIATION');
CREATE TYPE "OperationalDecisionType" AS ENUM ('CONFIRM_DOCUMENT_TYPE', 'CONFIRM_DOCUMENT_OWNER', 'CONFIRM_EXPIRY_DATE', 'RESOLVE_CONFLICT');
CREATE TYPE "OperationalDecisionStatus" AS ENUM ('OPEN', 'RESOLVED', 'SUPERSEDED');
CREATE TYPE "OperationalExceptionType" AS ENUM ('MISSING_INFORMATION', 'DATA_TO_VERIFY', 'CONFLICT', 'REQUIREMENT_NOT_SATISFIED', 'DOCUMENT_MISSING', 'DOCUMENT_EXPIRED', 'DOCUMENT_EXPIRING', 'PROCESS_BLOCKED', 'PERSISTENT_TECHNICAL_ERROR', 'ACCESS_NOT_ALLOWED', 'SENSITIVE_ACTION_REQUIRED', 'PARTIAL_RESULT', 'INVALID_ARTIFACT_REFERENCE');
CREATE TYPE "OperationalExceptionSeverity" AS ENUM ('INFO', 'ATTENTION', 'WARNING', 'BLOCKING');
CREATE TYPE "OperationalExceptionStatus" AS ENUM ('OPEN', 'RESOLVED');
CREATE TYPE "OperationalArtifactType" AS ENUM ('ORGANIZATION', 'DOCUMENT', 'DOCUMENT_VERSION', 'DOCUMENT_REQUIREMENT', 'WORKER', 'JOB_SITE', 'DEADLINE', 'CHECKLIST', 'EVIDENCE', 'DOCUMENT_PACKAGE');
CREATE TYPE "OperationalReliability" AS ENUM ('VERIFIED', 'HIGH', 'MEDIUM', 'LOW', 'CONFLICT');
CREATE TYPE "OperationalImpact" AS ENUM ('LOW', 'CONTROLLED', 'SENSITIVE', 'IRREVERSIBLE');
CREATE TYPE "OperationalEffectType" AS ENUM ('DOCUMENT_STATUS_RECONCILED', 'DEADLINE_RECONCILED', 'REMINDERS_RECONCILED', 'PACKAGE_REVIEW_RESET', 'EXCEPTION_OPENED', 'EXCEPTION_RESOLVED', 'DECISION_OPENED', 'NOTIFICATION_CREATED');

ALTER TYPE "AuditAction" ADD VALUE 'OPERATIONAL_PROCESS_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'OPERATIONAL_PROCESS_DEDUPLICATED';
ALTER TYPE "AuditAction" ADD VALUE 'OPERATIONAL_STEP_CLAIMED';
ALTER TYPE "AuditAction" ADD VALUE 'OPERATIONAL_STEP_COMPLETED';
ALTER TYPE "AuditAction" ADD VALUE 'OPERATIONAL_RETRY_SCHEDULED';
ALTER TYPE "AuditAction" ADD VALUE 'OPERATIONAL_PROCESS_BLOCKED';
ALTER TYPE "AuditAction" ADD VALUE 'OPERATIONAL_PROCESS_COMPLETED';
ALTER TYPE "AuditAction" ADD VALUE 'OPERATIONAL_DECISION_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'OPERATIONAL_DECISION_RESOLVED';
ALTER TYPE "AuditAction" ADD VALUE 'OPERATIONAL_EXCEPTION_OPENED';
ALTER TYPE "AuditAction" ADD VALUE 'OPERATIONAL_EXCEPTION_RESOLVED';
ALTER TYPE "AuditAction" ADD VALUE 'OPERATIONAL_CONTROL_RUN';

ALTER TYPE "AuditEntityType" ADD VALUE 'OPERATIONAL_PROCESS';
ALTER TYPE "AuditEntityType" ADD VALUE 'OPERATIONAL_STEP';
ALTER TYPE "AuditEntityType" ADD VALUE 'OPERATIONAL_DECISION';
ALTER TYPE "AuditEntityType" ADD VALUE 'OPERATIONAL_EXCEPTION';

CREATE TABLE "OperationalProcess" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "OperationalProcessType" NOT NULL,
    "definitionVersion" INTEGER NOT NULL,
    "status" "OperationalProcessStatus" NOT NULL DEFAULT 'RECEIVED',
    "triggerKind" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "context" JSONB,
    "reliability" "OperationalReliability" NOT NULL DEFAULT 'VERIFIED',
    "impact" "OperationalImpact" NOT NULL DEFAULT 'LOW',
    "resultSummary" JSONB,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "blockedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OperationalProcess_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OperationalStep" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "status" "OperationalStepStatus" NOT NULL DEFAULT 'WAITING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimToken" TEXT,
    "claimedAt" TIMESTAMP(3),
    "leaseExpiresAt" TIMESTAMP(3),
    "lastErrorCode" TEXT,
    "input" JSONB,
    "resultSummary" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OperationalStep_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OperationalEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "stepId" TEXT,
    "eventKey" TEXT NOT NULL,
    "kind" "OperationalEventKind" NOT NULL,
    "userVisible" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "metadata" JSONB,
    "actorUserId" TEXT,
    "reliability" "OperationalReliability" NOT NULL DEFAULT 'VERIFIED',
    "impact" "OperationalImpact" NOT NULL DEFAULT 'LOW',
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OperationalEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OperationalDecision" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "stepId" TEXT,
    "type" "OperationalDecisionType" NOT NULL,
    "status" "OperationalDecisionStatus" NOT NULL DEFAULT 'OPEN',
    "question" TEXT NOT NULL,
    "explanation" TEXT,
    "options" JSONB NOT NULL,
    "context" JSONB,
    "proposedOptionKey" TEXT,
    "selectedOptionKey" TEXT,
    "selectedValue" TEXT,
    "activeDedupeKey" TEXT,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "reason" TEXT,
    "reliability" "OperationalReliability" NOT NULL DEFAULT 'VERIFIED',
    "impact" "OperationalImpact" NOT NULL DEFAULT 'CONTROLLED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OperationalDecision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OperationalException" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "stepId" TEXT,
    "decisionId" TEXT,
    "type" "OperationalExceptionType" NOT NULL,
    "severity" "OperationalExceptionSeverity" NOT NULL,
    "status" "OperationalExceptionStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "nextStep" TEXT NOT NULL,
    "activeDedupeKey" TEXT,
    "dueAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "resolutionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OperationalException_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OperationalArtifactReference" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "artifactType" "OperationalArtifactType" NOT NULL,
    "artifactId" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OperationalArtifactReference_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OperationalRuleSnapshot" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceVersion" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OperationalRuleSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OperationalEffectReceipt" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "effectKey" TEXT NOT NULL,
    "type" "OperationalEffectType" NOT NULL,
    "artifactType" "OperationalArtifactType",
    "artifactId" TEXT,
    "resultSummary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OperationalEffectReceipt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OperationalProcess_organizationId_status_updatedAt_idx" ON "OperationalProcess"("organizationId", "status", "updatedAt");
CREATE INDEX "OperationalProcess_organizationId_type_createdAt_idx" ON "OperationalProcess"("organizationId", "type", "createdAt");
CREATE INDEX "OperationalProcess_status_updatedAt_idx" ON "OperationalProcess"("status", "updatedAt");
CREATE UNIQUE INDEX "OperationalProcess_organizationId_idempotencyKey_key" ON "OperationalProcess"("organizationId", "idempotencyKey");
CREATE INDEX "OperationalStep_organizationId_status_updatedAt_idx" ON "OperationalStep"("organizationId", "status", "updatedAt");
CREATE INDEX "OperationalStep_status_nextAttemptAt_leaseExpiresAt_idx" ON "OperationalStep"("status", "nextAttemptAt", "leaseExpiresAt");
CREATE INDEX "OperationalStep_processId_position_idx" ON "OperationalStep"("processId", "position");
CREATE UNIQUE INDEX "OperationalStep_processId_key_key" ON "OperationalStep"("processId", "key");
CREATE INDEX "OperationalEvent_organizationId_occurredAt_idx" ON "OperationalEvent"("organizationId", "occurredAt");
CREATE INDEX "OperationalEvent_processId_occurredAt_idx" ON "OperationalEvent"("processId", "occurredAt");
CREATE INDEX "OperationalEvent_stepId_occurredAt_idx" ON "OperationalEvent"("stepId", "occurredAt");
CREATE UNIQUE INDEX "OperationalEvent_processId_eventKey_key" ON "OperationalEvent"("processId", "eventKey");
CREATE INDEX "OperationalDecision_organizationId_status_createdAt_idx" ON "OperationalDecision"("organizationId", "status", "createdAt");
CREATE INDEX "OperationalDecision_processId_status_createdAt_idx" ON "OperationalDecision"("processId", "status", "createdAt");
CREATE INDEX "OperationalDecision_stepId_status_idx" ON "OperationalDecision"("stepId", "status");
CREATE UNIQUE INDEX "OperationalDecision_organizationId_activeDedupeKey_key" ON "OperationalDecision"("organizationId", "activeDedupeKey");
CREATE INDEX "OperationalException_organizationId_status_severity_created_idx" ON "OperationalException"("organizationId", "status", "severity", "createdAt");
CREATE INDEX "OperationalException_processId_status_createdAt_idx" ON "OperationalException"("processId", "status", "createdAt");
CREATE INDEX "OperationalException_decisionId_status_idx" ON "OperationalException"("decisionId", "status");
CREATE UNIQUE INDEX "OperationalException_organizationId_activeDedupeKey_key" ON "OperationalException"("organizationId", "activeDedupeKey");
CREATE INDEX "OperationalArtifactReference_organizationId_artifactType_ar_idx" ON "OperationalArtifactReference"("organizationId", "artifactType", "artifactId");
CREATE UNIQUE INDEX "OperationalArtifactReference_processId_artifactType_artifac_key" ON "OperationalArtifactReference"("processId", "artifactType", "artifactId");
CREATE INDEX "OperationalRuleSnapshot_organizationId_sourceType_sourceId_idx" ON "OperationalRuleSnapshot"("organizationId", "sourceType", "sourceId");
CREATE UNIQUE INDEX "OperationalRuleSnapshot_processId_sourceType_sourceId_sourc_key" ON "OperationalRuleSnapshot"("processId", "sourceType", "sourceId", "sourceVersion");
CREATE INDEX "OperationalEffectReceipt_processId_createdAt_idx" ON "OperationalEffectReceipt"("processId", "createdAt");
CREATE INDEX "OperationalEffectReceipt_stepId_createdAt_idx" ON "OperationalEffectReceipt"("stepId", "createdAt");
CREATE UNIQUE INDEX "OperationalEffectReceipt_organizationId_effectKey_key" ON "OperationalEffectReceipt"("organizationId", "effectKey");

ALTER TABLE "OperationalProcess" ADD CONSTRAINT "OperationalProcess_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalStep" ADD CONSTRAINT "OperationalStep_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalStep" ADD CONSTRAINT "OperationalStep_processId_fkey" FOREIGN KEY ("processId") REFERENCES "OperationalProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalEvent" ADD CONSTRAINT "OperationalEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalEvent" ADD CONSTRAINT "OperationalEvent_processId_fkey" FOREIGN KEY ("processId") REFERENCES "OperationalProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalEvent" ADD CONSTRAINT "OperationalEvent_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "OperationalStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OperationalDecision" ADD CONSTRAINT "OperationalDecision_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalDecision" ADD CONSTRAINT "OperationalDecision_processId_fkey" FOREIGN KEY ("processId") REFERENCES "OperationalProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalDecision" ADD CONSTRAINT "OperationalDecision_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "OperationalStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OperationalException" ADD CONSTRAINT "OperationalException_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalException" ADD CONSTRAINT "OperationalException_processId_fkey" FOREIGN KEY ("processId") REFERENCES "OperationalProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalException" ADD CONSTRAINT "OperationalException_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "OperationalStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OperationalException" ADD CONSTRAINT "OperationalException_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "OperationalDecision"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OperationalArtifactReference" ADD CONSTRAINT "OperationalArtifactReference_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalArtifactReference" ADD CONSTRAINT "OperationalArtifactReference_processId_fkey" FOREIGN KEY ("processId") REFERENCES "OperationalProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalRuleSnapshot" ADD CONSTRAINT "OperationalRuleSnapshot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalRuleSnapshot" ADD CONSTRAINT "OperationalRuleSnapshot_processId_fkey" FOREIGN KEY ("processId") REFERENCES "OperationalProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalEffectReceipt" ADD CONSTRAINT "OperationalEffectReceipt_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalEffectReceipt" ADD CONSTRAINT "OperationalEffectReceipt_processId_fkey" FOREIGN KEY ("processId") REFERENCES "OperationalProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalEffectReceipt" ADD CONSTRAINT "OperationalEffectReceipt_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "OperationalStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
