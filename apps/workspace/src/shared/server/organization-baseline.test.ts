import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const schema = readFileSync(resolve(process.cwd(), "../../packages/db/prisma/schema.prisma"), "utf8");
const baselineSql = readFileSync(resolve(process.cwd(), "../../packages/db/prisma/migrations/20260712010000_single_company_baseline/migration.sql"), "utf8");
const forwardSql = readFileSync(resolve(process.cwd(), "../../packages/db/prisma/migrations/20260712020000_single_membership_forward/migration.sql"), "utf8");

describe("canonical single-membership history", () => {
  it("uses Organization naming and a singular user relation", () => {
    expect(schema).toContain("model Organization");
    expect(schema).toContain("model OrganizationMembership");
    expect(schema).toContain("model OrganizationInvitation");
    expect(schema).toMatch(/organizationMembership\s+OrganizationMembership\?/);
    expect(schema).toMatch(/userId\s+String\s+@unique/);
    expect(schema).not.toContain("@@map(\"Structure");
    expect(schema).not.toContain("@map(\"structureId\")");
    expect(schema).not.toMatch(/\bStructureRole\b/);
  });

  it("creates the full baseline and migrates forward without replaying it", () => {
    expect(baselineSql).toContain('CREATE TABLE "Organization"');
    expect(baselineSql).toContain('CREATE TABLE "OrganizationInvitation"');
    expect(baselineSql).toContain('CREATE TABLE "Document"');
    expect(baselineSql).toContain('CREATE TABLE "Evidence"');
    expect(baselineSql).toContain('"organizationId" TEXT NOT NULL');
    expect(baselineSql).not.toContain('"Structure"');
    expect(baselineSql).not.toContain('"StructureMembership"');
    expect(baselineSql).not.toContain('"StructureInvitation"');
    expect(baselineSql).not.toContain('"structureId"');
    expect(baselineSql).not.toMatch(/HEAD_CHEF|HEAD_OF_HALL|KITCHEN_CREW|StructureRole/);
    expect(forwardSql).toContain('CREATE TABLE "OrganizationMembership"');
    expect(forwardSql).toContain('CREATE UNIQUE INDEX "OrganizationMembership_userId_key"');
    expect(forwardSql).toContain('ALTER TABLE "User" DROP COLUMN "organizationId"');
    expect(forwardSql).toContain('ALTER TABLE "User" DROP COLUMN "organizationRole"');
    expect(forwardSql).toContain("BEGIN;");
    expect(forwardSql).toContain("COMMIT;");
  });
});
