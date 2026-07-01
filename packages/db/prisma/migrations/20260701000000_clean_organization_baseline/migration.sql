-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AuthCodePurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_CHANGE');

-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('USER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'SAFETY_CONSULTANT', 'SITE_MANAGER', 'WORKER', 'VIEWER');

-- CreateEnum
CREATE TYPE "SupportAuditAction" AS ENUM ('READ', 'WRITE', 'SENSITIVE', 'EXPORT');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PRESENT', 'MISSING', 'EXPIRED', 'EXPIRING_SOON', 'TO_REVIEW', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DeadlineStatus" AS ENUM ('SCHEDULED', 'EXPIRING_SOON', 'EXPIRED', 'DONE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChecklistItemStatus" AS ENUM ('OPEN', 'DONE', 'TO_REVIEW', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentPackageStatus" AS ENUM ('DRAFT', 'READY_FOR_REVIEW', 'SHARED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentOwnerType" AS ENUM ('ORGANIZATION', 'WORKER', 'JOB_SITE');

-- CreateEnum
CREATE TYPE "DocumentTypeAppliesTo" AS ENUM ('ORGANIZATION', 'WORKER', 'JOB_SITE', 'EVIDENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "RequirementTargetType" AS ENUM ('ORGANIZATION', 'WORKER', 'JOB_SITE');

-- CreateEnum
CREATE TYPE "DeadlineSourceType" AS ENUM ('DOCUMENT', 'CHECKLIST', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('PHOTO', 'FILE', 'NOTE');

-- CreateEnum
CREATE TYPE "DocumentPackageItemType" AS ENUM ('DOCUMENT', 'DOCUMENT_VERSION', 'EVIDENCE', 'CHECKLIST', 'NOTE');

-- CreateTable
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

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "roleLabel" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSite" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "clientName" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "JobSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentType" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "appliesTo" "DocumentTypeAppliesTo" NOT NULL,
    "requiresExpiryDate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentTypeId" TEXT,
    "ownerType" "DocumentOwnerType" NOT NULL,
    "workerId" TEXT,
    "jobSiteId" TEXT,
    "title" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'TO_REVIEW',
    "expiryDate" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "blobKey" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "checksum" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentRequirement" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetType" "RequirementTargetType" NOT NULL,
    "documentTypeId" TEXT,
    "jobSiteId" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "DocumentRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deadline" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "sourceType" "DeadlineSourceType" NOT NULL,
    "documentId" TEXT,
    "workerId" TEXT,
    "jobSiteId" TEXT,
    "status" "DeadlineStatus" NOT NULL DEFAULT 'SCHEDULED',
    "remindAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Deadline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checklist" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "status" "ChecklistItemStatus" NOT NULL DEFAULT 'OPEN',
    "completedAt" TIMESTAMP(3),
    "completedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT,
    "workerId" TEXT,
    "checklistItemId" TEXT,
    "type" "EvidenceType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "blobKey" TEXT,
    "originalFileName" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentPackage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobSiteId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "DocumentPackageStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "DocumentPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentPackageItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentPackageId" TEXT NOT NULL,
    "itemType" "DocumentPackageItemType" NOT NULL,
    "documentId" TEXT,
    "documentVersionId" TEXT,
    "evidenceId" TEXT,
    "checklistId" TEXT,
    "note" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentPackageItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentPackageId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessedAt" TIMESTAMP(3),

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMembership" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "OrganizationMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationInvitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportSession" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sensitiveConfirmedUntil" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportAuditEvent" (
    "id" TEXT NOT NULL,
    "supportSessionId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "action" "SupportAuditAction" NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCredential" (
    "userId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "passwordResetRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCredential_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "AuthRateLimit" (
    "key" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthRateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "MfaBackupCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MfaBackupCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_code_key" ON "Organization"("code");

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name");

-- CreateIndex
CREATE INDEX "Worker_organizationId_status_idx" ON "Worker"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Worker_organizationId_displayName_idx" ON "Worker"("organizationId", "displayName");

-- CreateIndex
CREATE INDEX "Worker_organizationId_email_idx" ON "Worker"("organizationId", "email");

-- CreateIndex
CREATE INDEX "JobSite_organizationId_status_idx" ON "JobSite"("organizationId", "status");

-- CreateIndex
CREATE INDEX "JobSite_organizationId_name_idx" ON "JobSite"("organizationId", "name");

-- CreateIndex
CREATE INDEX "JobSite_organizationId_clientName_idx" ON "JobSite"("organizationId", "clientName");

-- CreateIndex
CREATE INDEX "DocumentType_organizationId_appliesTo_idx" ON "DocumentType"("organizationId", "appliesTo");

-- CreateIndex
CREATE INDEX "DocumentType_organizationId_name_idx" ON "DocumentType"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Document_organizationId_status_idx" ON "Document"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Document_organizationId_ownerType_idx" ON "Document"("organizationId", "ownerType");

-- CreateIndex
CREATE INDEX "Document_organizationId_workerId_idx" ON "Document"("organizationId", "workerId");

-- CreateIndex
CREATE INDEX "Document_organizationId_jobSiteId_idx" ON "Document"("organizationId", "jobSiteId");

-- CreateIndex
CREATE INDEX "Document_organizationId_documentTypeId_idx" ON "Document"("organizationId", "documentTypeId");

-- CreateIndex
CREATE INDEX "Document_organizationId_expiryDate_idx" ON "Document"("organizationId", "expiryDate");

-- CreateIndex
CREATE INDEX "DocumentVersion_organizationId_documentId_createdAt_idx" ON "DocumentVersion"("organizationId", "documentId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentVersion_organizationId_uploadedById_idx" ON "DocumentVersion"("organizationId", "uploadedById");

-- CreateIndex
CREATE INDEX "DocumentVersion_organizationId_blobKey_idx" ON "DocumentVersion"("organizationId", "blobKey");

-- CreateIndex
CREATE INDEX "DocumentRequirement_organizationId_targetType_idx" ON "DocumentRequirement"("organizationId", "targetType");

-- CreateIndex
CREATE INDEX "DocumentRequirement_organizationId_documentTypeId_idx" ON "DocumentRequirement"("organizationId", "documentTypeId");

-- CreateIndex
CREATE INDEX "DocumentRequirement_organizationId_jobSiteId_idx" ON "DocumentRequirement"("organizationId", "jobSiteId");

-- CreateIndex
CREATE INDEX "Deadline_organizationId_status_idx" ON "Deadline"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Deadline_organizationId_dueDate_idx" ON "Deadline"("organizationId", "dueDate");

-- CreateIndex
CREATE INDEX "Deadline_organizationId_documentId_idx" ON "Deadline"("organizationId", "documentId");

-- CreateIndex
CREATE INDEX "Deadline_organizationId_workerId_idx" ON "Deadline"("organizationId", "workerId");

-- CreateIndex
CREATE INDEX "Deadline_organizationId_jobSiteId_idx" ON "Deadline"("organizationId", "jobSiteId");

-- CreateIndex
CREATE INDEX "Checklist_organizationId_status_idx" ON "Checklist"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Checklist_organizationId_jobSiteId_idx" ON "Checklist"("organizationId", "jobSiteId");

-- CreateIndex
CREATE INDEX "ChecklistItem_organizationId_checklistId_idx" ON "ChecklistItem"("organizationId", "checklistId");

-- CreateIndex
CREATE INDEX "ChecklistItem_organizationId_status_idx" ON "ChecklistItem"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ChecklistItem_organizationId_completedById_idx" ON "ChecklistItem"("organizationId", "completedById");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_type_idx" ON "Evidence"("organizationId", "type");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_jobSiteId_idx" ON "Evidence"("organizationId", "jobSiteId");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_workerId_idx" ON "Evidence"("organizationId", "workerId");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_checklistItemId_idx" ON "Evidence"("organizationId", "checklistItemId");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_createdAt_idx" ON "Evidence"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentPackage_organizationId_status_idx" ON "DocumentPackage"("organizationId", "status");

-- CreateIndex
CREATE INDEX "DocumentPackage_organizationId_jobSiteId_idx" ON "DocumentPackage"("organizationId", "jobSiteId");

-- CreateIndex
CREATE INDEX "DocumentPackage_organizationId_createdById_idx" ON "DocumentPackage"("organizationId", "createdById");

-- CreateIndex
CREATE INDEX "DocumentPackageItem_organizationId_documentPackageId_positi_idx" ON "DocumentPackageItem"("organizationId", "documentPackageId", "position");

-- CreateIndex
CREATE INDEX "DocumentPackageItem_organizationId_documentId_idx" ON "DocumentPackageItem"("organizationId", "documentId");

-- CreateIndex
CREATE INDEX "DocumentPackageItem_organizationId_documentVersionId_idx" ON "DocumentPackageItem"("organizationId", "documentVersionId");

-- CreateIndex
CREATE INDEX "DocumentPackageItem_organizationId_evidenceId_idx" ON "DocumentPackageItem"("organizationId", "evidenceId");

-- CreateIndex
CREATE INDEX "DocumentPackageItem_organizationId_checklistId_idx" ON "DocumentPackageItem"("organizationId", "checklistId");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_tokenHash_key" ON "ShareLink"("tokenHash");

-- CreateIndex
CREATE INDEX "ShareLink_organizationId_documentPackageId_idx" ON "ShareLink"("organizationId", "documentPackageId");

-- CreateIndex
CREATE INDEX "ShareLink_organizationId_revokedAt_expiresAt_idx" ON "ShareLink"("organizationId", "revokedAt", "expiresAt");

-- CreateIndex
CREATE INDEX "ShareLink_organizationId_createdById_idx" ON "ShareLink"("organizationId", "createdById");

-- CreateIndex
CREATE INDEX "OrganizationMembership_userId_revokedAt_idx" ON "OrganizationMembership"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "OrganizationMembership_organizationId_role_revokedAt_idx" ON "OrganizationMembership"("organizationId", "role", "revokedAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMembership_organizationId_userId_key" ON "OrganizationMembership"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInvitation_tokenHash_key" ON "OrganizationInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "OrganizationInvitation_organizationId_email_createdAt_idx" ON "OrganizationInvitation"("organizationId", "email", "createdAt");

-- CreateIndex
CREATE INDEX "OrganizationInvitation_email_expiresAt_idx" ON "OrganizationInvitation"("email", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SupportSession_tokenHash_key" ON "SupportSession"("tokenHash");

-- CreateIndex
CREATE INDEX "SupportSession_actorId_endedAt_expiresAt_idx" ON "SupportSession"("actorId", "endedAt", "expiresAt");

-- CreateIndex
CREATE INDEX "SupportSession_organizationId_createdAt_idx" ON "SupportSession"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "SupportAuditEvent_supportSessionId_createdAt_idx" ON "SupportAuditEvent"("supportSessionId", "createdAt");

-- CreateIndex
CREATE INDEX "SupportAuditEvent_organizationId_createdAt_idx" ON "SupportAuditEvent"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "SupportAuditEvent_actorId_createdAt_idx" ON "SupportAuditEvent"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AuthCode_email_purpose_createdAt_idx" ON "AuthCode"("email", "purpose", "createdAt");

-- CreateIndex
CREATE INDEX "AuthCode_userId_purpose_createdAt_idx" ON "AuthCode"("userId", "purpose", "createdAt");

-- CreateIndex
CREATE INDEX "AuthCode_expiresAt_idx" ON "AuthCode"("expiresAt");

-- CreateIndex
CREATE INDEX "AuthRateLimit_bucket_resetAt_idx" ON "AuthRateLimit"("bucket", "resetAt");

-- CreateIndex
CREATE INDEX "SecurityAuditEvent_userId_createdAt_idx" ON "SecurityAuditEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityAuditEvent_email_createdAt_idx" ON "SecurityAuditEvent"("email", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityAuditEvent_type_createdAt_idx" ON "SecurityAuditEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "AuthDevice_userId_lastSeenAt_idx" ON "AuthDevice"("userId", "lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "AuthDevice_userId_fingerprintHash_key" ON "AuthDevice"("userId", "fingerprintHash");

-- CreateIndex
CREATE INDEX "MfaBackupCode_userId_usedAt_idx" ON "MfaBackupCode"("userId", "usedAt");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSite" ADD CONSTRAINT "JobSite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentType" ADD CONSTRAINT "DocumentType_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequirement" ADD CONSTRAINT "DocumentRequirement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequirement" ADD CONSTRAINT "DocumentRequirement_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequirement" ADD CONSTRAINT "DocumentRequirement_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ChecklistItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackage" ADD CONSTRAINT "DocumentPackage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackage" ADD CONSTRAINT "DocumentPackage_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackage" ADD CONSTRAINT "DocumentPackage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_documentPackageId_fkey" FOREIGN KEY ("documentPackageId") REFERENCES "DocumentPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_documentVersionId_fkey" FOREIGN KEY ("documentVersionId") REFERENCES "DocumentVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackageItem" ADD CONSTRAINT "DocumentPackageItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_documentPackageId_fkey" FOREIGN KEY ("documentPackageId") REFERENCES "DocumentPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportSession" ADD CONSTRAINT "SupportSession_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportSession" ADD CONSTRAINT "SupportSession_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportAuditEvent" ADD CONSTRAINT "SupportAuditEvent_supportSessionId_fkey" FOREIGN KEY ("supportSessionId") REFERENCES "SupportSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportAuditEvent" ADD CONSTRAINT "SupportAuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportAuditEvent" ADD CONSTRAINT "SupportAuditEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCredential" ADD CONSTRAINT "UserCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthCode" ADD CONSTRAINT "AuthCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAuditEvent" ADD CONSTRAINT "SecurityAuditEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthDevice" ADD CONSTRAINT "AuthDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MfaBackupCode" ADD CONSTRAINT "MfaBackupCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
