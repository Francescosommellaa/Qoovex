-- Production auth: credentials, code verification, persistent rate limits and audit events.

CREATE TYPE "AuthCodePurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_CHANGE');

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "usernameOnboarded" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS "UserCredential" (
  "userId" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "passwordUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "passwordResetRequired" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UserCredential_pkey" PRIMARY KEY ("userId"),
  CONSTRAINT "UserCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "AuthCode" (
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

  CONSTRAINT "AuthCode_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuthCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "AuthRateLimit" (
  "key" TEXT NOT NULL,
  "bucket" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "resetAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AuthRateLimit_pkey" PRIMARY KEY ("key")
);

CREATE TABLE IF NOT EXISTS "SecurityAuditEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "email" TEXT,
  "type" TEXT NOT NULL,
  "ipHash" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SecurityAuditEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SecurityAuditEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "AuthCode_email_purpose_createdAt_idx" ON "AuthCode"("email", "purpose", "createdAt");
CREATE INDEX IF NOT EXISTS "AuthCode_userId_purpose_createdAt_idx" ON "AuthCode"("userId", "purpose", "createdAt");
CREATE INDEX IF NOT EXISTS "AuthCode_expiresAt_idx" ON "AuthCode"("expiresAt");
CREATE INDEX IF NOT EXISTS "AuthRateLimit_bucket_resetAt_idx" ON "AuthRateLimit"("bucket", "resetAt");
CREATE INDEX IF NOT EXISTS "SecurityAuditEvent_userId_createdAt_idx" ON "SecurityAuditEvent"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "SecurityAuditEvent_email_createdAt_idx" ON "SecurityAuditEvent"("email", "createdAt");
CREATE INDEX IF NOT EXISTS "SecurityAuditEvent_type_createdAt_idx" ON "SecurityAuditEvent"("type", "createdAt");
