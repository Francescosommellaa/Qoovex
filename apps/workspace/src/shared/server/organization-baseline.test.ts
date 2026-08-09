import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const schema = readFileSync(resolve(process.cwd(), "../../packages/db/prisma/schema.prisma"), "utf8");
const baselineSql = readFileSync(resolve(process.cwd(), "../../packages/db/prisma/migrations/20260712010000_single_company_baseline/migration.sql"), "utf8");
const forwardSql = readFileSync(resolve(process.cwd(), "../../packages/db/prisma/migrations/20260712020000_single_membership_forward/migration.sql"), "utf8");
const activeMembershipSql = readFileSync(resolve(process.cwd(), "../../packages/db/prisma/migrations/20260809020000_single_active_organization_membership/migration.sql"), "utf8");

describe("organization membership over immutable history", () => {
  it("uses Organization naming and one active organization membership per account", () => {
    expect(schema).toContain("model Organization");
    expect(schema).toContain("model OrganizationMembership");
    expect(schema).toContain("model OrganizationInvitation");
    expect(schema).toMatch(/organizationMemberships\s+OrganizationMembership\[\]/);
    expect(schema).toMatch(/@@unique\(\[organizationId, userId\]\)/);
    expect(activeMembershipSql).toContain('CREATE UNIQUE INDEX "OrganizationMembership_one_active_organization_per_user"');
    expect(activeMembershipSql).toContain('WHERE "revokedAt" IS NULL');
  });

  it("keeps the published baseline and forward history structurally verifiable", () => {
    expect(baselineSql).toContain('CREATE TABLE "Organization"');
    expect(baselineSql).toContain('CREATE TABLE "OrganizationInvitation"');
    expect(baselineSql).toContain('"organizationId" TEXT NOT NULL');
    expect(forwardSql).toContain('CREATE TABLE "OrganizationMembership"');
    expect(forwardSql).toContain('CREATE UNIQUE INDEX "OrganizationMembership_userId_key"');
    expect(forwardSql).toContain('ALTER TABLE "User" DROP COLUMN "organizationId"');
    expect(forwardSql).toContain('ALTER TABLE "User" DROP COLUMN "organizationRole"');
    expect(forwardSql).toContain("BEGIN;");
    expect(forwardSql).toContain("COMMIT;");
  });
});
