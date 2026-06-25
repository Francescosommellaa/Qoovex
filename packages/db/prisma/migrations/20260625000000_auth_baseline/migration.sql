-- Auth, tenant and audited support baseline.

CREATE TYPE "AuthCodePurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_CHANGE');
CREATE TYPE "PlatformRole" AS ENUM ('USER', 'SUPER_ADMIN');
CREATE TYPE "StructureRole" AS ENUM ('ADMIN', 'HEAD_OF_HALL', 'HEAD_CHEF', 'KITCHEN_CREW');
CREATE TYPE "SupportAuditAction" AS ENUM ('READ', 'WRITE', 'SENSITIVE', 'EXPORT');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT,
  "firstName" TEXT NOT NULL DEFAULT '',
  "lastName" TEXT,
  "username" TEXT NOT NULL,
  "usernameOnboarded" BOOLEAN NOT NULL DEFAULT true,
  "profileOnboarded" BOOLEAN NOT NULL DEFAULT true,
  "avatarBlobPathname" TEXT,
  "phoneNumber" TEXT,
  "platformRole" "PlatformRole" NOT NULL DEFAULT 'USER',
  "authVersion" INTEGER NOT NULL DEFAULT 1,
  "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
  "totpSecretEncrypted" TEXT,
  "totpSecretNonce" TEXT,
  "totpPendingSecretEncrypted" TEXT,
  "totpPendingSecretNonce" TEXT,
  "totpPendingCreatedAt" TIMESTAMP(3),
  "totpVerifiedAt" TIMESTAMP(3),
  "usernameChangedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "accounts" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sessions" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification_tokens" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

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

CREATE TABLE "UserCredential" (
  "userId" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "passwordUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "passwordResetRequired" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserCredential_pkey" PRIMARY KEY ("userId")
);

CREATE TABLE "AuthCode" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "email" TEXT NOT NULL,
  "purpose" "AuthCodePurpose" NOT NULL,
  "codeHash" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 5,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthRateLimit" (
  "key" TEXT NOT NULL,
  "bucket" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "resetAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AuthRateLimit_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "SecurityAuditEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "email" TEXT,
  "type" TEXT NOT NULL,
  "ipHash" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SecurityAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthDevice" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fingerprintHash" TEXT NOT NULL,
  "userAgentHash" TEXT,
  "label" TEXT,
  "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AuthDevice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MfaBackupCode" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MfaBackupCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
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
CREATE INDEX "AuthCode_email_purpose_createdAt_idx" ON "AuthCode"("email", "purpose", "createdAt");
CREATE INDEX "AuthCode_userId_purpose_createdAt_idx" ON "AuthCode"("userId", "purpose", "createdAt");
CREATE INDEX "AuthCode_expiresAt_idx" ON "AuthCode"("expiresAt");
CREATE INDEX "AuthRateLimit_bucket_resetAt_idx" ON "AuthRateLimit"("bucket", "resetAt");
CREATE INDEX "SecurityAuditEvent_userId_createdAt_idx" ON "SecurityAuditEvent"("userId", "createdAt");
CREATE INDEX "SecurityAuditEvent_email_createdAt_idx" ON "SecurityAuditEvent"("email", "createdAt");
CREATE INDEX "SecurityAuditEvent_type_createdAt_idx" ON "SecurityAuditEvent"("type", "createdAt");
CREATE UNIQUE INDEX "AuthDevice_userId_fingerprintHash_key" ON "AuthDevice"("userId", "fingerprintHash");
CREATE INDEX "AuthDevice_userId_lastSeenAt_idx" ON "AuthDevice"("userId", "lastSeenAt");
CREATE INDEX "MfaBackupCode_userId_usedAt_idx" ON "MfaBackupCode"("userId", "usedAt");

ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
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
ALTER TABLE "UserCredential" ADD CONSTRAINT "UserCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuthCode" ADD CONSTRAINT "AuthCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SecurityAuditEvent" ADD CONSTRAINT "SecurityAuditEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuthDevice" ADD CONSTRAINT "AuthDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MfaBackupCode" ADD CONSTRAINT "MfaBackupCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
