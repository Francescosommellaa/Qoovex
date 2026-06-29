-- Conservative domain migration: keep existing physical tenant tables,
-- move persisted role values from legacy StructureRole to OrganizationRole.

CREATE TYPE "OrganizationRole" AS ENUM (
  'OWNER',
  'ADMIN',
  'SAFETY_CONSULTANT',
  'SITE_MANAGER',
  'WORKER',
  'VIEWER'
);

ALTER TABLE "StructureMembership"
  ALTER COLUMN "role" TYPE TEXT USING "role"::TEXT;

ALTER TABLE "StructureInvitation"
  ALTER COLUMN "role" TYPE TEXT USING "role"::TEXT;

UPDATE "StructureMembership"
SET "role" = CASE "role"
  WHEN 'ADMIN' THEN 'OWNER'
  WHEN 'HEAD_CHEF' THEN 'OWNER'
  WHEN 'HEAD_OF_HALL' THEN 'ADMIN'
  WHEN 'KITCHEN_CREW' THEN 'WORKER'
  ELSE "role"
END;

UPDATE "StructureInvitation"
SET "role" = CASE "role"
  WHEN 'ADMIN' THEN 'OWNER'
  WHEN 'HEAD_CHEF' THEN 'OWNER'
  WHEN 'HEAD_OF_HALL' THEN 'ADMIN'
  WHEN 'KITCHEN_CREW' THEN 'WORKER'
  ELSE "role"
END;

ALTER TABLE "StructureMembership"
  ALTER COLUMN "role" TYPE "OrganizationRole" USING "role"::"OrganizationRole";

ALTER TABLE "StructureInvitation"
  ALTER COLUMN "role" TYPE "OrganizationRole" USING "role"::"OrganizationRole";

DROP TYPE "StructureRole";
