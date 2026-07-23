-- CreateEnum
CREATE TYPE "JobSiteOperationalPhase" AS ENUM ('PREPARATION', 'IN_PROGRESS', 'PAUSED', 'CLOSING', 'COMPLETED');

-- AlterTable
ALTER TABLE "JobSite" ADD COLUMN "operationalPhase" "JobSiteOperationalPhase";

-- CreateIndex
CREATE INDEX "JobSite_org_phase_archived_idx" ON "JobSite"("organizationId", "operationalPhase", "archivedAt");
