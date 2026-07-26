-- Link a WORKER invitation to the operational worker profile it must claim.
-- The relation is optional so legacy invitations remain valid.
ALTER TYPE "AuditAction" ADD VALUE 'ORGANIZATION_INVITATION_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'ORGANIZATION_INVITATION_REVOKED';
ALTER TYPE "AuditAction" ADD VALUE 'ORGANIZATION_INVITATION_ACCEPTED';
ALTER TYPE "AuditAction" ADD VALUE 'ORGANIZATION_MEMBERSHIP_REVOKED';
ALTER TYPE "AuditEntityType" ADD VALUE 'ORGANIZATION_INVITATION';
ALTER TYPE "AuditEntityType" ADD VALUE 'ORGANIZATION_MEMBERSHIP';

ALTER TABLE "OrganizationInvitation"
ADD COLUMN "workerId" TEXT;

ALTER TABLE "OrganizationInvitation"
ADD CONSTRAINT "OrganizationInvitation_workerId_fkey"
FOREIGN KEY ("workerId") REFERENCES "Worker"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "OrganizationInvitation_organizationId_workerId_createdAt_idx"
ON "OrganizationInvitation"("organizationId", "workerId", "createdAt");
