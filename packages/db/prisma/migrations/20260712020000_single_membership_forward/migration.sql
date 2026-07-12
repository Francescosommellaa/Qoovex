BEGIN;

DO $$
DECLARE
    inconsistent_users INTEGER;
BEGIN
    IF to_regclass('public."OrganizationMembership"') IS NOT NULL THEN
        RAISE EXCEPTION 'OrganizationMembership esiste gia: interrompere e verificare lo stato reale';
    END IF;

    SELECT COUNT(*)
    INTO inconsistent_users
    FROM "User"
    WHERE ("organizationId" IS NULL) <> ("organizationRole" IS NULL);

    IF inconsistent_users <> 0 THEN
        RAISE EXCEPTION 'Trovati % utenti con organizationId/organizationRole incoerenti', inconsistent_users;
    END IF;
END $$;

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

CREATE UNIQUE INDEX "OrganizationMembership_userId_key"
ON "OrganizationMembership"("userId");

CREATE INDEX "OrganizationMembership_organizationId_role_revokedAt_idx"
ON "OrganizationMembership"("organizationId", "role", "revokedAt");

ALTER TABLE "OrganizationMembership"
ADD CONSTRAINT "OrganizationMembership_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrganizationMembership"
ADD CONSTRAINT "OrganizationMembership_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "OrganizationMembership" (
    "id",
    "organizationId",
    "userId",
    "role",
    "createdAt",
    "updatedAt",
    "revokedAt"
)
SELECT
    'migrated_' || md5("id" || ':' || "organizationId"),
    "organizationId",
    "id",
    "organizationRole",
    "createdAt",
    "updatedAt",
    NULL
FROM "User"
WHERE "organizationId" IS NOT NULL
  AND "organizationRole" IS NOT NULL;

DO $$
DECLARE
    expected_memberships INTEGER;
    actual_memberships INTEGER;
BEGIN
    SELECT COUNT(*) INTO expected_memberships
    FROM "User"
    WHERE "organizationId" IS NOT NULL
      AND "organizationRole" IS NOT NULL;

    SELECT COUNT(*) INTO actual_memberships
    FROM "OrganizationMembership";

    IF actual_memberships <> expected_memberships THEN
        RAISE EXCEPTION 'Backfill membership incompleto: attese %, create %', expected_memberships, actual_memberships;
    END IF;
END $$;

ALTER TABLE "User" DROP CONSTRAINT "User_organizationId_fkey";
DROP INDEX "User_organizationId_organizationRole_idx";
ALTER TABLE "User" DROP COLUMN "organizationId";
ALTER TABLE "User" DROP COLUMN "organizationRole";

COMMIT;

