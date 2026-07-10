-- CreateEnum
CREATE TYPE "RuntimeErrorStatus" AS ENUM ('OPEN', 'RESOLVED');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "suspendedAt" TIMESTAMP(3),
ADD COLUMN "suspensionReason" TEXT;

-- CreateTable
CREATE TABLE "RuntimeErrorEvent" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "status" "RuntimeErrorStatus" NOT NULL DEFAULT 'OPEN',
    "source" TEXT NOT NULL,
    "routePath" TEXT,
    "requestMethod" TEXT,
    "errorName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stackPreview" TEXT,
    "digest" TEXT,
    "lastRequestId" TEXT,
    "occurrenceCount" INTEGER NOT NULL DEFAULT 1,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "resolutionNote" TEXT,

    CONSTRAINT "RuntimeErrorEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RuntimeErrorEvent_fingerprint_key" ON "RuntimeErrorEvent"("fingerprint");

-- CreateIndex
CREATE INDEX "RuntimeErrorEvent_status_lastSeenAt_idx" ON "RuntimeErrorEvent"("status", "lastSeenAt");

-- CreateIndex
CREATE INDEX "RuntimeErrorEvent_source_lastSeenAt_idx" ON "RuntimeErrorEvent"("source", "lastSeenAt");

-- CreateIndex
CREATE INDEX "RuntimeErrorEvent_resolvedById_resolvedAt_idx" ON "RuntimeErrorEvent"("resolvedById", "resolvedAt");

-- AddForeignKey
ALTER TABLE "RuntimeErrorEvent" ADD CONSTRAINT "RuntimeErrorEvent_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
