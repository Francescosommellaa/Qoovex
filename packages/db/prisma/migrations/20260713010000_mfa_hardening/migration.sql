ALTER TYPE "AuthCodePurpose" ADD VALUE 'MFA_ENROLLMENT';
ALTER TYPE "AuthCodePurpose" ADD VALUE 'MFA_RECOVERY';

CREATE TYPE "MfaRecoveryMode" AS ENUM ('SELF_EMAIL', 'OWNER_APPROVAL');
CREATE TYPE "MfaRecoveryStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'SETUP_STARTED', 'COMPLETED', 'EXPIRED');

CREATE TABLE "MfaRecoveryRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "mode" "MfaRecoveryMode" NOT NULL,
    "status" "MfaRecoveryStatus" NOT NULL DEFAULT 'PENDING',
    "activeKey" TEXT,
    "emailVerifiedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "deniedById" TEXT,
    "deniedAt" TIMESTAMP(3),
    "setupStartedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MfaRecoveryRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MfaRecoveryRequest_activeKey_key" ON "MfaRecoveryRequest"("activeKey");
CREATE INDEX "MfaRecoveryRequest_userId_status_createdAt_idx" ON "MfaRecoveryRequest"("userId", "status", "createdAt");
CREATE INDEX "MfaRecoveryRequest_organizationId_status_createdAt_idx" ON "MfaRecoveryRequest"("organizationId", "status", "createdAt");
CREATE INDEX "MfaRecoveryRequest_approvedById_approvedAt_idx" ON "MfaRecoveryRequest"("approvedById", "approvedAt");
CREATE INDEX "MfaRecoveryRequest_deniedById_deniedAt_idx" ON "MfaRecoveryRequest"("deniedById", "deniedAt");
CREATE INDEX "MfaRecoveryRequest_expiresAt_idx" ON "MfaRecoveryRequest"("expiresAt");

ALTER TABLE "MfaRecoveryRequest" ADD CONSTRAINT "MfaRecoveryRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MfaRecoveryRequest" ADD CONSTRAINT "MfaRecoveryRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MfaRecoveryRequest" ADD CONSTRAINT "MfaRecoveryRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MfaRecoveryRequest" ADD CONSTRAINT "MfaRecoveryRequest_deniedById_fkey" FOREIGN KEY ("deniedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
