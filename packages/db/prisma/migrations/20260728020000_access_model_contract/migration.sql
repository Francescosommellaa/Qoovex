-- Contract phase for the definitive Qoovex access model.
-- This migration is destructive only for enum labels already migrated by the audited backfill.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "Organization" o
    WHERE NOT EXISTS (
      SELECT 1 FROM "OrganizationMembership" m
      WHERE m."organizationId" = o.id AND m.role::text = 'OWNER' AND m."revokedAt" IS NULL
    )
  ) THEN RAISE EXCEPTION 'access contract hard stop: organization without an active owner'; END IF;

  IF EXISTS (
    SELECT 1 FROM "OrganizationInvitation"
    WHERE "acceptedAt" IS NULL AND "declinedAt" IS NULL AND "revokedAt" IS NULL AND "expiresAt" > NOW()
    GROUP BY "organizationId", lower(email) HAVING COUNT(*) > 1
  ) THEN RAISE EXCEPTION 'access contract hard stop: duplicate active invitation'; END IF;

  IF EXISTS (
    SELECT 1 FROM "OrganizationMembershipResourceGrant" g
    JOIN "OrganizationMembership" m ON m.id = g."membershipId"
    WHERE g."organizationId" <> m."organizationId"
  ) OR EXISTS (
    SELECT 1 FROM "OrganizationInvitationResourceGrant" g
    JOIN "OrganizationInvitation" i ON i.id = g."invitationId"
    WHERE g."organizationId" <> i."organizationId"
  ) THEN RAISE EXCEPTION 'access contract hard stop: cross-organization resource grant'; END IF;

  IF EXISTS (SELECT 1 FROM "OrganizationMembership" WHERE role::text NOT IN ('OWNER', 'COLLABORATOR'))
    OR EXISTS (SELECT 1 FROM "OrganizationInvitation" WHERE role::text <> 'COLLABORATOR')
    OR EXISTS (SELECT 1 FROM "User" WHERE "platformRole"::text NOT IN ('USER', 'SUPPORT_AGENT', 'PLATFORM_ADMIN'))
  THEN RAISE EXCEPTION 'access contract hard stop: access backfill is incomplete'; END IF;
END $$;

CREATE TYPE "PlatformRole_contract" AS ENUM ('USER', 'SUPPORT_AGENT', 'PLATFORM_ADMIN');
CREATE TYPE "OrganizationRole_contract" AS ENUM ('OWNER', 'COLLABORATOR');
CREATE TYPE "OrganizationAccessPreset_contract" AS ENUM (
  'READ_ONLY',
  'OPERATIONAL_COLLABORATION',
  'SITE_MANAGER',
  'DOCUMENT_REVIEWER',
  'LIMITED_UPLOAD',
  'CUSTOM'
);

ALTER TABLE "User" ALTER COLUMN "platformRole" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "platformRole" TYPE "PlatformRole_contract"
  USING ("platformRole"::text::"PlatformRole_contract");
ALTER TABLE "User" ALTER COLUMN "platformRole" SET DEFAULT 'USER'::"PlatformRole_contract";

ALTER TABLE "OrganizationMembership" ALTER COLUMN role TYPE "OrganizationRole_contract"
  USING (role::text::"OrganizationRole_contract");
ALTER TABLE "OrganizationInvitation" ALTER COLUMN role TYPE "OrganizationRole_contract"
  USING (role::text::"OrganizationRole_contract");
ALTER TABLE "ProductAuditEvent" ALTER COLUMN "actorRole" TYPE "OrganizationRole_contract"
  USING (CASE WHEN "actorRole" IS NULL THEN NULL WHEN "actorRole"::text = 'OWNER' THEN 'OWNER' ELSE 'COLLABORATOR' END)::"OrganizationRole_contract";
ALTER TABLE "OperationalEvent" ALTER COLUMN "actorRole" TYPE "OrganizationRole_contract"
  USING (CASE WHEN "actorRole" IS NULL THEN NULL WHEN "actorRole"::text = 'OWNER' THEN 'OWNER' ELSE 'COLLABORATOR' END)::"OrganizationRole_contract";

ALTER TABLE "OrganizationMembership" ALTER COLUMN preset TYPE "OrganizationAccessPreset_contract"
  USING (preset::text::"OrganizationAccessPreset_contract");
ALTER TABLE "OrganizationInvitation" ALTER COLUMN preset TYPE "OrganizationAccessPreset_contract"
  USING (preset::text::"OrganizationAccessPreset_contract");

DROP TYPE "PlatformRole";
DROP TYPE "OrganizationRole";
DROP TYPE "OrganizationAccessPreset";
ALTER TYPE "PlatformRole_contract" RENAME TO "PlatformRole";
ALTER TYPE "OrganizationRole_contract" RENAME TO "OrganizationRole";
ALTER TYPE "OrganizationAccessPreset_contract" RENAME TO "OrganizationAccessPreset";

ALTER TABLE "OrganizationInvitation"
  ADD CONSTRAINT "OrganizationInvitation_role_check" CHECK (role = 'COLLABORATOR'::"OrganizationRole");
ALTER TABLE "OrganizationMembership"
  ADD CONSTRAINT "OrganizationMembership_preset_check" CHECK (
    (role = 'OWNER'::"OrganizationRole" AND preset IS NULL)
    OR (role = 'COLLABORATOR'::"OrganizationRole" AND preset IS NOT NULL)
  );
