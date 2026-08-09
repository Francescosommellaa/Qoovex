-- An account may hold one active organization membership at a time.
CREATE UNIQUE INDEX "OrganizationMembership_one_active_organization_per_user"
ON "OrganizationMembership"("userId")
WHERE "revokedAt" IS NULL;
