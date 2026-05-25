ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "profileOnboarded" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS "AuthDevice" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fingerprintHash" TEXT NOT NULL,
  "userAgentHash" TEXT,
  "label" TEXT,
  "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuthDevice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuthDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "AuthDevice_userId_fingerprintHash_key" ON "AuthDevice"("userId", "fingerprintHash");
CREATE INDEX IF NOT EXISTS "AuthDevice_userId_lastSeenAt_idx" ON "AuthDevice"("userId", "lastSeenAt");
