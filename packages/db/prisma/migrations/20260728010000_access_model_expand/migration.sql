-- Expand phase for the definitive customer/internal access model.
-- The contract migration is intentionally separate and must follow the audited backfill.
ALTER TYPE "OrganizationRole" ADD VALUE IF NOT EXISTS 'COLLABORATOR';
ALTER TYPE "PlatformRole" ADD VALUE IF NOT EXISTS 'SUPPORT_AGENT';
ALTER TYPE "PlatformRole" ADD VALUE IF NOT EXISTS 'PLATFORM_ADMIN';
ALTER TYPE "OrganizationAccessPreset" ADD VALUE IF NOT EXISTS 'READ_ONLY';
ALTER TYPE "OrganizationAccessPreset" ADD VALUE IF NOT EXISTS 'OPERATIONAL_COLLABORATION';
ALTER TYPE "OrganizationAccessPreset" ADD VALUE IF NOT EXISTS 'DOCUMENT_REVIEWER';
ALTER TYPE "OrganizationAccessPreset" ADD VALUE IF NOT EXISTS 'CUSTOM';

ALTER TABLE "OrganizationMembership"
  ADD COLUMN "accessVersion" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "accessUpdatedById" TEXT;

ALTER TABLE "OrganizationInvitation"
  ADD COLUMN "recipientName" TEXT,
  ADD COLUMN "message" TEXT,
  ADD COLUMN "activeKey" TEXT,
  ADD COLUMN "declinedAt" TIMESTAMP(3),
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "accessVersion" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "accessUpdatedById" TEXT;

CREATE UNIQUE INDEX "OrganizationInvitation_activeKey_key" ON "OrganizationInvitation"("activeKey");
CREATE INDEX "OrganizationMembership_accessUpdatedById_updatedAt_idx" ON "OrganizationMembership"("accessUpdatedById", "updatedAt");
CREATE INDEX "OrganizationInvitation_accessUpdatedById_updatedAt_idx" ON "OrganizationInvitation"("accessUpdatedById", "updatedAt");

ALTER TABLE "OrganizationMembership"
  ADD CONSTRAINT "OrganizationMembership_accessUpdatedById_fkey"
  FOREIGN KEY ("accessUpdatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrganizationInvitation"
  ADD CONSTRAINT "OrganizationInvitation_accessUpdatedById_fkey"
  FOREIGN KEY ("accessUpdatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
