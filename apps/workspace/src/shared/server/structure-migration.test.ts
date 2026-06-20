import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(resolve(process.cwd(), "../../packages/db/prisma/migrations/20260620210000_structure_authorization/migration.sql"), "utf8");

describe("structure authorization migration", () => {
  it("is additive for existing authentication data", () => {
    expect(sql).toContain('ALTER TABLE "User"');
    expect(sql).not.toMatch(/DROP TABLE\s+"(?:User|UserCredential|AuthDevice|MfaBackupCode|SecurityAuditEvent)"/i);
    expect(sql).not.toMatch(/DROP COLUMN\s+"(?:mfaEnabled|totpSecretEncrypted|authVersion)"/i);
  });

  it("creates tenant, invitations and audited support", () => {
    expect(sql).toContain('CREATE TABLE "StructureMembership"');
    expect(sql).toContain('CREATE TABLE "StructureInvitation"');
    expect(sql).toContain('CREATE TABLE "SupportSession"');
    expect(sql).toContain('CREATE TABLE "SupportAuditEvent"');
  });
});
