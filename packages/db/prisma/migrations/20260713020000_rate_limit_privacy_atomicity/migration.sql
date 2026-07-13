-- I contatori precedenti incorporavano identificatori grezzi nella chiave.
-- Sono dati transitori: eliminarli evita di conservare PII legacy e resetta
-- una sola volta le finestre di rate limit durante il rollout.
DELETE FROM "AuthRateLimit";

ALTER TABLE "AuthRateLimit"
  ADD COLUMN "userId" TEXT,
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "AuthRateLimit_userId_resetAt_idx" ON "AuthRateLimit"("userId", "resetAt");

ALTER TABLE "AuthRateLimit"
  ADD CONSTRAINT "AuthRateLimit_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
