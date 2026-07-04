-- CreateEnum
CREATE TYPE "EmailDigestFrequency" AS ENUM ('OFF', 'DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "NotificationEmailDeliveryType" AS ENUM ('DIGEST', 'SINGLE_NOTIFICATION');

-- CreateEnum
CREATE TYPE "NotificationEmailDeliveryStatus" AS ENUM ('SENT', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailDigestEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailDigestFrequency" "EmailDigestFrequency" NOT NULL DEFAULT 'OFF',
    "emailDigestHour" INTEGER NOT NULL DEFAULT 8,
    "lastDigestSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationEmailDelivery" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT,
    "type" "NotificationEmailDeliveryType" NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "notificationCount" INTEGER NOT NULL DEFAULT 0,
    "status" "NotificationEmailDeliveryStatus" NOT NULL,
    "providerMessageId" TEXT,
    "errorCode" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationEmailDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_organizationId_userId_key" ON "NotificationPreference"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "NotificationPreference_organizationId_emailDigestEnabled_emailDigestFrequency_idx" ON "NotificationPreference"("organizationId", "emailDigestEnabled", "emailDigestFrequency");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_updatedAt_idx" ON "NotificationPreference"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "NotificationEmailDelivery_organizationId_userId_createdAt_idx" ON "NotificationEmailDelivery"("organizationId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationEmailDelivery_organizationId_status_createdAt_idx" ON "NotificationEmailDelivery"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationEmailDelivery_organizationId_type_createdAt_idx" ON "NotificationEmailDelivery"("organizationId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationEmailDelivery_notificationId_idx" ON "NotificationEmailDelivery"("notificationId");

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEmailDelivery" ADD CONSTRAINT "NotificationEmailDelivery_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEmailDelivery" ADD CONSTRAINT "NotificationEmailDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEmailDelivery" ADD CONSTRAINT "NotificationEmailDelivery_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
