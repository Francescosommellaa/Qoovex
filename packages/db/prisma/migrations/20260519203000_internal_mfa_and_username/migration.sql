ALTER TABLE "User"
ADD COLUMN "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "totpSecretEncrypted" TEXT,
ADD COLUMN "totpSecretNonce" TEXT,
ADD COLUMN "totpPendingSecretEncrypted" TEXT,
ADD COLUMN "totpPendingSecretNonce" TEXT,
ADD COLUMN "totpPendingCreatedAt" TIMESTAMP(3),
ADD COLUMN "totpVerifiedAt" TIMESTAMP(3),
ADD COLUMN "usernameChangedAt" TIMESTAMP(3);

CREATE TABLE "MfaBackupCode" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MfaBackupCode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MfaBackupCode_userId_usedAt_idx" ON "MfaBackupCode"("userId", "usedAt");

ALTER TABLE "MfaBackupCode"
ADD CONSTRAINT "MfaBackupCode_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
