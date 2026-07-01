import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const schema = readFileSync(resolve(process.cwd(), "../../packages/db/prisma/schema.prisma"), "utf8");
const baselineSql = readFileSync(resolve(process.cwd(), "../../packages/db/prisma/migrations/20260701000000_clean_organization_baseline/migration.sql"), "utf8");

describe("clean organization baseline", () => {
  it("uses only Organization naming for tenant tables and columns", () => {
    expect(schema).toContain("model Organization");
    expect(schema).toContain("model OrganizationMembership");
    expect(schema).toContain("model OrganizationInvitation");
    expect(schema).not.toContain("@@map(\"Structure");
    expect(schema).not.toContain("@map(\"structureId\")");
    expect(schema).not.toMatch(/\bStructureRole\b/);
  });

  it("creates the clean MVP schema without legacy tenant tables or roles", () => {
    expect(baselineSql).toContain('CREATE TABLE "Organization"');
    expect(baselineSql).toContain('CREATE TABLE "OrganizationMembership"');
    expect(baselineSql).toContain('CREATE TABLE "OrganizationInvitation"');
    expect(baselineSql).toContain('CREATE TABLE "DocumentPackage"');
    expect(baselineSql).toContain('CREATE TABLE "ShareLink"');
    expect(baselineSql).toContain('"organizationId" TEXT NOT NULL');
    expect(baselineSql).not.toContain('"Structure"');
    expect(baselineSql).not.toContain('"StructureMembership"');
    expect(baselineSql).not.toContain('"StructureInvitation"');
    expect(baselineSql).not.toContain('"structureId"');
    expect(baselineSql).not.toMatch(/HEAD_CHEF|HEAD_OF_HALL|KITCHEN_CREW|StructureRole/);
  });
});
