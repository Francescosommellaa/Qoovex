-- Allinea record User esistenti dopo rimozione Clerk (campi NextAuth + profilo Qoovex)

UPDATE "User"
SET
  "firstName" = CASE
    WHEN COALESCE(TRIM("firstName"), '') = '' THEN COALESCE(NULLIF(SPLIT_PART("email", '@', 1), ''), 'chef')
    ELSE "firstName"
  END,
  "name" = COALESCE(
    "name",
    NULLIF(
      TRIM(
        CONCAT(
          CASE
            WHEN COALESCE(TRIM("firstName"), '') = '' THEN COALESCE(NULLIF(SPLIT_PART("email", '@', 1), ''), 'chef')
            ELSE "firstName"
          END,
          ' ',
          COALESCE("lastName", '')
        )
      ),
      ''
    ),
    SPLIT_PART("email", '@', 1)
  ),
  "emailVerified" = COALESCE("emailVerified", NOW())
WHERE
  "emailVerified" IS NULL
  OR "name" IS NULL
  OR COALESCE(TRIM("firstName"), '') = '';
