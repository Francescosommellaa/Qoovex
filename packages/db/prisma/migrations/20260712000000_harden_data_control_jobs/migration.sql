ALTER TABLE "DataControlJob"
ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "activeKey" TEXT;

CREATE UNIQUE INDEX "DataControlJob_activeKey_key" ON "DataControlJob"("activeKey");
CREATE INDEX "DataControlJob_status_nextAttemptAt_createdAt_idx"
ON "DataControlJob"("status", "nextAttemptAt", "createdAt");
