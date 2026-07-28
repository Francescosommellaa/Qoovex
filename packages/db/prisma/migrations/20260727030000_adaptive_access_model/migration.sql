-- Additive access-control foundation. Legacy professional roles are mapped without widening scope.
CREATE TYPE "OrganizationAccessPreset" AS ENUM ('OPERATIONAL_COLLABORATOR', 'SITE_MANAGER', 'CONSULTANT', 'VIEWER', 'LIMITED_UPLOAD');
CREATE TYPE "OrganizationScopeMode" AS ENUM ('FULL', 'ASSIGNED');
CREATE TYPE "OrganizationResourceType" AS ENUM ('JOB_SITE', 'WORKER', 'DOCUMENT', 'DOCUMENT_TYPE', 'DOCUMENT_PACKAGE', 'OPERATIONAL_PROCESS', 'OPERATIONAL_DECISION', 'OPERATIONAL_EXCEPTION', 'EVIDENCE', 'CHECKLIST', 'SHARE_LINK');

ALTER TABLE "OrganizationMembership"
  ADD COLUMN "preset" "OrganizationAccessPreset",
  ADD COLUMN "permissionKeys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "scopeMode" "OrganizationScopeMode" NOT NULL DEFAULT 'ASSIGNED',
  ADD COLUMN "expiresAt" TIMESTAMP(3);

ALTER TABLE "OrganizationInvitation"
  ADD COLUMN "preset" "OrganizationAccessPreset",
  ADD COLUMN "permissionKeys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "scopeMode" "OrganizationScopeMode" NOT NULL DEFAULT 'ASSIGNED',
  ADD COLUMN "accessExpiresAt" TIMESTAMP(3);

UPDATE "OrganizationMembership" SET
  "preset" = CASE "role"::text
    WHEN 'SAFETY_CONSULTANT' THEN 'CONSULTANT'::"OrganizationAccessPreset"
    WHEN 'SITE_MANAGER' THEN 'SITE_MANAGER'::"OrganizationAccessPreset"
    WHEN 'WORKER' THEN 'LIMITED_UPLOAD'::"OrganizationAccessPreset"
    ELSE NULL
  END,
  "scopeMode" = CASE WHEN "role"::text IN ('OWNER', 'ADMIN', 'SAFETY_CONSULTANT') THEN 'FULL'::"OrganizationScopeMode" ELSE 'ASSIGNED'::"OrganizationScopeMode" END,
  "permissionKeys" = CASE "role"::text
    WHEN 'OWNER' THEN ARRAY['organization:read','organization:update','members:read','members:invite','members:manage','workers:read','workers:create','workers:update','workers:archive','jobSites:read','jobSites:create','jobSites:update','jobSites:archive','documents:read','documents:upload','documents:update','documents:archive','deadlines:read','deadlines:manage','calendar:read','calendar:manage','checklists:read','checklists:manage','checklists:complete','evidence:read','evidence:upload','evidence:delete','documentPackages:read','documentPackages:create','documentPackages:share','auditLog:read','assignments:read','assignments:manage','settings:update']
    WHEN 'ADMIN' THEN ARRAY['organization:read','members:read','members:invite','workers:read','workers:create','workers:update','workers:archive','jobSites:read','jobSites:create','jobSites:update','jobSites:archive','documents:read','documents:upload','documents:update','documents:archive','deadlines:read','deadlines:manage','calendar:read','calendar:manage','checklists:read','checklists:manage','checklists:complete','evidence:read','evidence:upload','evidence:delete','documentPackages:read','documentPackages:create','documentPackages:share','assignments:read','assignments:manage']
    WHEN 'SAFETY_CONSULTANT' THEN ARRAY['organization:read','workers:read','jobSites:read','documents:read','documents:upload','documents:update','deadlines:read','calendar:read','checklists:read','checklists:manage','checklists:complete','evidence:read','evidence:upload','documentPackages:read','documentPackages:create','assignments:read']
    WHEN 'SITE_MANAGER' THEN ARRAY['organization:read','workers:read','jobSites:read','documents:read','deadlines:read','calendar:read','checklists:read','checklists:complete','evidence:read','evidence:upload']
    WHEN 'WORKER' THEN ARRAY['organization:read','workers:read','jobSites:read','documents:read','documents:upload','deadlines:read','calendar:read','evidence:read','evidence:upload']
  END;

UPDATE "OrganizationInvitation" SET
  "preset" = CASE "role"::text
    WHEN 'SAFETY_CONSULTANT' THEN 'CONSULTANT'::"OrganizationAccessPreset"
    WHEN 'SITE_MANAGER' THEN 'SITE_MANAGER'::"OrganizationAccessPreset"
    WHEN 'WORKER' THEN 'LIMITED_UPLOAD'::"OrganizationAccessPreset"
    ELSE NULL
  END,
  "scopeMode" = CASE WHEN "role"::text IN ('ADMIN', 'SAFETY_CONSULTANT') THEN 'FULL'::"OrganizationScopeMode" ELSE 'ASSIGNED'::"OrganizationScopeMode" END,
  "permissionKeys" = CASE "role"::text
    WHEN 'ADMIN' THEN ARRAY['organization:read','members:read','members:invite','workers:read','workers:create','workers:update','workers:archive','jobSites:read','jobSites:create','jobSites:update','jobSites:archive','documents:read','documents:upload','documents:update','documents:archive','deadlines:read','deadlines:manage','calendar:read','calendar:manage','checklists:read','checklists:manage','checklists:complete','evidence:read','evidence:upload','evidence:delete','documentPackages:read','documentPackages:create','documentPackages:share','assignments:read','assignments:manage']
    WHEN 'SAFETY_CONSULTANT' THEN ARRAY['organization:read','workers:read','jobSites:read','documents:read','documents:upload','documents:update','deadlines:read','calendar:read','checklists:read','checklists:manage','checklists:complete','evidence:read','evidence:upload','documentPackages:read','documentPackages:create','assignments:read']
    WHEN 'SITE_MANAGER' THEN ARRAY['organization:read','workers:read','jobSites:read','documents:read','deadlines:read','calendar:read','checklists:read','checklists:complete','evidence:read','evidence:upload']
    WHEN 'WORKER' THEN ARRAY['organization:read','workers:read','jobSites:read','documents:read','documents:upload','deadlines:read','calendar:read','evidence:read','evidence:upload']
    ELSE ARRAY[]::TEXT[]
  END;

CREATE TABLE "OrganizationMembershipResourceGrant" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "membershipId" TEXT NOT NULL,
  "resourceType" "OrganizationResourceType" NOT NULL,
  "resourceId" TEXT NOT NULL,
  "grantedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrganizationMembershipResourceGrant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OrganizationMembershipResourceGrant_membershipId_resourceType_resourceId_key" ON "OrganizationMembershipResourceGrant"("membershipId", "resourceType", "resourceId");
CREATE INDEX "OrganizationMembershipResourceGrant_organizationId_resourceType_resourceId_idx" ON "OrganizationMembershipResourceGrant"("organizationId", "resourceType", "resourceId");

CREATE TABLE "OrganizationInvitationResourceGrant" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "invitationId" TEXT NOT NULL,
  "resourceType" "OrganizationResourceType" NOT NULL,
  "resourceId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrganizationInvitationResourceGrant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OrganizationInvitationResourceGrant_invitationId_resourceType_resourceId_key" ON "OrganizationInvitationResourceGrant"("invitationId", "resourceType", "resourceId");
CREATE INDEX "OrganizationInvitationResourceGrant_organizationId_resourceType_resourceId_idx" ON "OrganizationInvitationResourceGrant"("organizationId", "resourceType", "resourceId");

INSERT INTO "OrganizationMembershipResourceGrant" ("id", "organizationId", "membershipId", "resourceType", "resourceId", "createdAt")
SELECT m."id" || ':JOB_SITE:' || a."jobSiteId", m."organizationId", m."id", 'JOB_SITE', a."jobSiteId", a."createdAt"
FROM "OrganizationMembership" m JOIN "JobSiteUserAssignment" a ON a."userId" = m."userId" AND a."organizationId" = m."organizationId"
WHERE m."role"::text = 'SITE_MANAGER' AND m."revokedAt" IS NULL AND a."archivedAt" IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO "OrganizationMembershipResourceGrant" ("id", "organizationId", "membershipId", "resourceType", "resourceId", "createdAt")
SELECT m."id" || ':WORKER:' || l."workerId", m."organizationId", m."id", 'WORKER', l."workerId", l."createdAt"
FROM "OrganizationMembership" m JOIN "WorkerUserLink" l ON l."userId" = m."userId" AND l."organizationId" = m."organizationId"
WHERE m."role"::text = 'WORKER' AND m."revokedAt" IS NULL AND l."archivedAt" IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO "OrganizationInvitationResourceGrant" ("id", "organizationId", "invitationId", "resourceType", "resourceId", "createdAt")
SELECT i."id" || ':WORKER:' || i."workerId", i."organizationId", i."id", 'WORKER', i."workerId", i."createdAt"
FROM "OrganizationInvitation" i WHERE i."role"::text = 'WORKER' AND i."workerId" IS NOT NULL
ON CONFLICT DO NOTHING;

ALTER TYPE "OrganizationRole" RENAME TO "OrganizationRole_legacy";
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER', 'SAFETY_CONSULTANT', 'SITE_MANAGER', 'WORKER');
ALTER TABLE "OrganizationMembership" ALTER COLUMN "role" TYPE "OrganizationRole" USING (CASE WHEN "role"::text IN ('SAFETY_CONSULTANT','SITE_MANAGER','WORKER') THEN 'MEMBER' ELSE "role"::text END)::"OrganizationRole";
ALTER TABLE "OrganizationInvitation" ALTER COLUMN "role" TYPE "OrganizationRole" USING (CASE WHEN "role"::text IN ('SAFETY_CONSULTANT','SITE_MANAGER','WORKER') THEN 'MEMBER' ELSE "role"::text END)::"OrganizationRole";
ALTER TABLE "ProductAuditEvent" ALTER COLUMN "actorRole" TYPE "OrganizationRole" USING (CASE WHEN "actorRole" IS NULL THEN NULL WHEN "actorRole"::text IN ('SAFETY_CONSULTANT','SITE_MANAGER','WORKER') THEN 'MEMBER' ELSE "actorRole"::text END)::"OrganizationRole";
ALTER TABLE "OperationalEvent" ALTER COLUMN "actorRole" TYPE "OrganizationRole" USING (CASE WHEN "actorRole" IS NULL THEN NULL WHEN "actorRole"::text IN ('SAFETY_CONSULTANT','SITE_MANAGER','WORKER') THEN 'MEMBER' ELSE "actorRole"::text END)::"OrganizationRole";
DROP TYPE "OrganizationRole_legacy";

ALTER TABLE "OrganizationMembershipResourceGrant" ADD CONSTRAINT "OrganizationMembershipResourceGrant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationMembershipResourceGrant" ADD CONSTRAINT "OrganizationMembershipResourceGrant_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "OrganizationMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationMembershipResourceGrant" ADD CONSTRAINT "OrganizationMembershipResourceGrant_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrganizationInvitationResourceGrant" ADD CONSTRAINT "OrganizationInvitationResourceGrant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationInvitationResourceGrant" ADD CONSTRAINT "OrganizationInvitationResourceGrant_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "OrganizationInvitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
