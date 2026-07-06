-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'WORKER_USER_LINK_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'WORKER_USER_LINK_ARCHIVED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'JOB_SITE_USER_ASSIGNMENT_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'JOB_SITE_USER_ASSIGNMENT_ARCHIVED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'JOB_SITE_WORKER_ASSIGNMENT_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'JOB_SITE_WORKER_ASSIGNMENT_ARCHIVED';

-- AlterEnum
ALTER TYPE "AuditEntityType" ADD VALUE IF NOT EXISTS 'WORKER_USER_LINK';
ALTER TYPE "AuditEntityType" ADD VALUE IF NOT EXISTS 'JOB_SITE_USER_ASSIGNMENT';
ALTER TYPE "AuditEntityType" ADD VALUE IF NOT EXISTS 'JOB_SITE_WORKER_ASSIGNMENT';

-- CreateEnum
CREATE TYPE "JobSiteUserAssignmentRole" AS ENUM ('SITE_MANAGER');

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
