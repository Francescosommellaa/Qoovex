-- CreateEnum
CREATE TYPE "DataControlJobType" AS ENUM ('METADATA_EXPORT', 'ORGANIZATION_DELETE', 'ORPHAN_BLOB_CLEANUP');

-- CreateEnum
CREATE TYPE "DataControlJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'DATA_CONTROL_JOB_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'DATA_CONTROL_JOB_RUN';
ALTER TYPE "AuditAction" ADD VALUE 'ORPHAN_BLOB_CLEANUP_RUN';
ALTER TYPE "AuditAction" ADD VALUE 'ORGANIZATION_DELETE_REQUESTED';
ALTER TYPE "AuditAction" ADD VALUE 'ORGANIZATION_DELETE_RUN';
ALTER TYPE "AuditAction" ADD VALUE 'DOCUMENT_REQUIREMENT_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'DOCUMENT_REQUIREMENT_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'DOCUMENT_REQUIREMENT_ARCHIVED';

-- AlterEnum
ALTER TYPE "AuditEntityType" ADD VALUE 'DATA_CONTROL_JOB';
ALTER TYPE "AuditEntityType" ADD VALUE 'DOCUMENT_REQUIREMENT';

-- AlterTable
ALTER TABLE "NotificationPreference"
  ADD COLUMN "deadlineNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "documentNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "packageNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "systemNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "DataControlJob" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "requestedById" TEXT NOT NULL,
  "type" "DataControlJobType" NOT NULL,
  "status" "DataControlJobStatus" NOT NULL DEFAULT 'PENDING',
  "blobKey" TEXT,
  "resultSummary" JSONB,
  "errorCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),

  CONSTRAINT "DataControlJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DataControlJob_organizationId_status_createdAt_idx" ON "DataControlJob"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "DataControlJob_organizationId_type_status_idx" ON "DataControlJob"("organizationId", "type", "status");

-- CreateIndex
CREATE INDEX "DataControlJob_requestedById_createdAt_idx" ON "DataControlJob"("requestedById", "createdAt");

-- CreateIndex
CREATE INDEX "DataControlJob_blobKey_idx" ON "DataControlJob"("blobKey");

-- AddForeignKey
ALTER TABLE "DataControlJob" ADD CONSTRAINT "DataControlJob_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
