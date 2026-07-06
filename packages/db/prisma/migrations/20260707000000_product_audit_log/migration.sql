-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM (
    'DOCUMENT_CREATED',
    'DOCUMENT_UPDATED',
    'DOCUMENT_ARCHIVED',
    'DOCUMENT_VERSION_UPLOADED',
    'DOCUMENT_VERSION_DOWNLOADED',
    'DOCUMENT_VERSION_ARCHIVED',
    'DEADLINE_CREATED',
    'DEADLINE_UPDATED',
    'DEADLINE_ARCHIVED',
    'WORKER_CREATED',
    'WORKER_UPDATED',
    'WORKER_ARCHIVED',
    'JOB_SITE_CREATED',
    'JOB_SITE_UPDATED',
    'JOB_SITE_ARCHIVED',
    'CHECKLIST_CREATED',
    'CHECKLIST_UPDATED',
    'CHECKLIST_ARCHIVED',
    'CHECKLIST_ITEM_COMPLETED',
    'EVIDENCE_CREATED',
    'EVIDENCE_DOWNLOADED',
    'EVIDENCE_ARCHIVED',
    'DOCUMENT_PACKAGE_CREATED',
    'DOCUMENT_PACKAGE_UPDATED',
    'DOCUMENT_PACKAGE_ARCHIVED',
    'DOCUMENT_PACKAGE_ITEM_ADDED',
    'DOCUMENT_PACKAGE_ITEM_REMOVED',
    'SHARE_LINK_CREATED',
    'SHARE_LINK_REVOKED',
    'SHARE_LINK_ACCESSED',
    'NOTIFICATION_READ',
    'NOTIFICATION_DISMISSED',
    'EMAIL_DIGEST_SENT',
    'EMAIL_DIGEST_FAILED',
    'NOTIFICATION_PREFERENCES_UPDATED',
    'SCHEDULED_EMAIL_DIGEST_RUN',
    'SECURITY_DENIED'
);

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM (
    'DOCUMENT',
    'DOCUMENT_VERSION',
    'DEADLINE',
    'WORKER',
    'JOB_SITE',
    'CHECKLIST',
    'CHECKLIST_ITEM',
    'EVIDENCE',
    'DOCUMENT_PACKAGE',
    'DOCUMENT_PACKAGE_ITEM',
    'SHARE_LINK',
    'NOTIFICATION',
    'EMAIL_DELIVERY',
    'NOTIFICATION_PREFERENCE',
    'ORGANIZATION',
    'USER',
    'SYSTEM'
);

-- CreateEnum
CREATE TYPE "AuditOutcome" AS ENUM ('SUCCESS', 'DENIED', 'FAILED');

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

-- AddForeignKey
ALTER TABLE "ProductAuditEvent" ADD CONSTRAINT "ProductAuditEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAuditEvent" ADD CONSTRAINT "ProductAuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAuditEvent" ADD CONSTRAINT "ProductAuditEvent_supportSessionId_fkey" FOREIGN KEY ("supportSessionId") REFERENCES "SupportSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
