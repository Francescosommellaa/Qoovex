ALTER TABLE "User"
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT;

UPDATE "User"
SET
  "firstName" = COALESCE(NULLIF(split_part("name", ' ', 1), ''), "username"),
  "lastName" = NULLIF(btrim(substr("name", length(split_part("name", ' ', 1)) + 1)), '');

ALTER TABLE "User"
ALTER COLUMN "firstName" SET NOT NULL;

ALTER TABLE "User"
DROP COLUMN "name";
