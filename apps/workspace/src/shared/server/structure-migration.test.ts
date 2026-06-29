import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(resolve(process.cwd(), "../../packages/db/prisma/migrations/20260625000000_auth_baseline/migration.sql"), "utf8");
const organizationRoleSql = readFileSync(resolve(process.cwd(), "../../packages/db/prisma/migrations/20260629000000_organization_role_mapping/migration.sql"), "utf8");

describe("auth baseline migration", () => {
  it("contains only the auth and tenant baseline", () => {
    expect(sql).toContain('CREATE TABLE "User"');
    expect(sql).not.toContain('CREATE TABLE "Document"');
    expect(sql).not.toContain('CREATE TABLE "JobSite"');
    expect(sql).not.toMatch(/DROP TABLE\s+"(?:User|UserCredential|AuthDevice|MfaBackupCode|SecurityAuditEvent)"/i);
    expect(sql).not.toMatch(/DROP COLUMN\s+"(?:mfaEnabled|totpSecretEncrypted|authVersion)"/i);
  });

  it("creates tenant, invitations and audited support", () => {
    expect(sql).toContain('CREATE TABLE "StructureMembership"');
    expect(sql).toContain('CREATE TABLE "StructureInvitation"');
    expect(sql).toContain('CREATE TABLE "SupportSession"');
    expect(sql).toContain('CREATE TABLE "SupportAuditEvent"');
  });

  it("maps legacy role values to organization roles in a separate migration", () => {
    expect(organizationRoleSql).toContain('CREATE TYPE "OrganizationRole"');
    expect(organizationRoleSql).toContain("WHEN 'ADMIN' THEN 'OWNER'");
    expect(organizationRoleSql).toContain("WHEN 'HEAD_CHEF' THEN 'OWNER'");
    expect(organizationRoleSql).toContain("WHEN 'HEAD_OF_HALL' THEN 'ADMIN'");
    expect(organizationRoleSql).toContain("WHEN 'KITCHEN_CREW' THEN 'WORKER'");
    expect(organizationRoleSql).not.toMatch(/DROP TABLE/i);
  });
});
