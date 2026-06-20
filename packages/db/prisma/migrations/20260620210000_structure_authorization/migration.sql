CREATE TYPE "PlatformRole" AS ENUM ('USER', 'SUPER_ADMIN');
CREATE TYPE "StructureRole" AS ENUM ('ADMIN', 'HEAD_OF_HALL', 'HEAD_CHEF', 'KITCHEN_CREW');
CREATE TYPE "SupportAuditAction" AS ENUM ('READ', 'WRITE', 'SENSITIVE', 'EXPORT');

ALTER TABLE "User"
  ADD COLUMN "platformRole" "PlatformRole" NOT NULL DEFAULT 'USER',
  ADD COLUMN "authVersion" INTEGER NOT NULL DEFAULT 1;

CREATE TABLE "Structure" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Structure_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StructureMembership" (
  "id" TEXT NOT NULL,
  "structureId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "StructureRole" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "StructureMembership_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StructureInvitation" (
  "id" TEXT NOT NULL,
  "structureId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "StructureRole" NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "invitedById" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StructureInvitation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportSession" (
  "id" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "structureId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "sensitiveConfirmedUntil" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SupportSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportAuditEvent" (
  "id" TEXT NOT NULL,
  "supportSessionId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "structureId" TEXT NOT NULL,
  "action" "SupportAuditAction" NOT NULL,
  "resourceType" TEXT NOT NULL,
  "resourceId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SupportAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Structure_code_key" ON "Structure"("code");
CREATE INDEX "Structure_name_idx" ON "Structure"("name");
CREATE UNIQUE INDEX "StructureMembership_structureId_userId_key" ON "StructureMembership"("structureId", "userId");
CREATE INDEX "StructureMembership_userId_revokedAt_idx" ON "StructureMembership"("userId", "revokedAt");
CREATE INDEX "StructureMembership_structureId_role_revokedAt_idx" ON "StructureMembership"("structureId", "role", "revokedAt");
CREATE UNIQUE INDEX "StructureInvitation_tokenHash_key" ON "StructureInvitation"("tokenHash");
CREATE INDEX "StructureInvitation_structureId_email_createdAt_idx" ON "StructureInvitation"("structureId", "email", "createdAt");
CREATE INDEX "StructureInvitation_email_expiresAt_idx" ON "StructureInvitation"("email", "expiresAt");
CREATE UNIQUE INDEX "SupportSession_tokenHash_key" ON "SupportSession"("tokenHash");
CREATE INDEX "SupportSession_actorId_endedAt_expiresAt_idx" ON "SupportSession"("actorId", "endedAt", "expiresAt");
CREATE INDEX "SupportSession_structureId_createdAt_idx" ON "SupportSession"("structureId", "createdAt");
CREATE INDEX "SupportAuditEvent_supportSessionId_createdAt_idx" ON "SupportAuditEvent"("supportSessionId", "createdAt");
CREATE INDEX "SupportAuditEvent_structureId_createdAt_idx" ON "SupportAuditEvent"("structureId", "createdAt");
CREATE INDEX "SupportAuditEvent_actorId_createdAt_idx" ON "SupportAuditEvent"("actorId", "createdAt");

ALTER TABLE "Structure" ADD CONSTRAINT "Structure_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StructureMembership" ADD CONSTRAINT "StructureMembership_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StructureMembership" ADD CONSTRAINT "StructureMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StructureInvitation" ADD CONSTRAINT "StructureInvitation_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StructureInvitation" ADD CONSTRAINT "StructureInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportSession" ADD CONSTRAINT "SupportSession_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportSession" ADD CONSTRAINT "SupportSession_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportAuditEvent" ADD CONSTRAINT "SupportAuditEvent_supportSessionId_fkey" FOREIGN KEY ("supportSessionId") REFERENCES "SupportSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportAuditEvent" ADD CONSTRAINT "SupportAuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportAuditEvent" ADD CONSTRAINT "SupportAuditEvent_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

