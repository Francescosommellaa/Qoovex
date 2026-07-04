-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DEADLINE_OVERDUE', 'DEADLINE_UPCOMING', 'DOCUMENT_TO_REVIEW', 'DOCUMENT_EXPIRED', 'DOCUMENT_EXPIRING_SOON', 'PACKAGE_READY_FOR_REVIEW', 'SHARE_LINK_EXPIRING', 'SHARE_LINK_REVOKED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationSeverity" AS ENUM ('INFO', 'ATTENTION', 'WARNING');

-- CreateEnum
CREATE TYPE "NotificationSourceType" AS ENUM ('DOCUMENT', 'DEADLINE', 'WORKER', 'JOB_SITE', 'CHECKLIST', 'EVIDENCE', 'DOCUMENT_PACKAGE', 'SHARE_LINK', 'SYSTEM');

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

-- CreateIndex
CREATE UNIQUE INDEX "Notification_organizationId_dedupeKey_key" ON "Notification"("organizationId", "dedupeKey");

-- CreateIndex
CREATE INDEX "Notification_organizationId_userId_dismissedAt_readAt_idx" ON "Notification"("organizationId", "userId", "dismissedAt", "readAt");

-- CreateIndex
CREATE INDEX "Notification_organizationId_type_sourceType_sourceId_idx" ON "Notification"("organizationId", "type", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "Notification_organizationId_severity_createdAt_idx" ON "Notification"("organizationId", "severity", "createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
