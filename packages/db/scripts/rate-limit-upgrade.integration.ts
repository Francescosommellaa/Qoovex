import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";
import { spawnPrisma } from "./prisma-cli";

const databaseUrl = process.env.DATABASE_URL ?? "";
const target = new URL(databaseUrl);
if (process.env.QOOVEX_UPGRADE_CI_MODE !== "1") throw new Error("QOOVEX_UPGRADE_CI_MODE=1 e obbligatorio.");
if (!["localhost", "127.0.0.1", "::1"].includes(target.hostname) || target.pathname !== "/qoovex_upgrade_ci") {
  throw new Error("Il test upgrade puo usare soltanto qoovex_upgrade_ci su loopback.");
}

const migrationNames = [
  "20260712010000_single_company_baseline",
  "20260712020000_single_membership_forward",
  "20260713010000_mfa_hardening",
  "20260713020000_rate_limit_privacy_atomicity",
  "20260720010000_calendar_events",
  "20260803230000_qoovex_vnext_from_zero",
] as const;
async function main() {
  const client = new pg.Client({ connectionString: databaseUrl });

  try {
  await client.connect();
  await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public');
  const applyMigration = async (migrationName: (typeof migrationNames)[number]) => {
    const sql = await readFile(resolve("prisma/migrations", migrationName, "migration.sql"), "utf8");
    await client.query(sql);
  };

  await applyMigration(migrationNames[0]);

  await client.query(`
    INSERT INTO "User" (id, email, username, "firstName", "organizationRole", "createdAt", "updatedAt")
    VALUES ('upgrade-user', 'upgrade@example.test', 'upgrade_user', 'Upgrade', 'OWNER', NOW(), NOW());
    INSERT INTO "Organization" (id, name, code, "createdById", "createdAt", "updatedAt")
    VALUES ('upgrade-org', 'Upgrade fixture', 'UPGRADE-CI', 'upgrade-user', NOW(), NOW());
    UPDATE "User" SET "organizationId" = 'upgrade-org' WHERE id = 'upgrade-user';
  `);

  await applyMigration(migrationNames[1]);
  await applyMigration(migrationNames[2]);

  await client.query(`
    INSERT INTO "AuthRateLimit" (key, bucket, count, "resetAt")
    VALUES ('auth:signin:upgrade@example.test', 'auth:signin', 3, NOW() + INTERVAL '1 hour');
  `);

  await applyMigration(migrationNames[3]);
  await applyMigration(migrationNames[4]);
  const checks = await client.query(`
    SELECT
      (SELECT COUNT(*)::int FROM "OrganizationMembership" WHERE "userId" = 'upgrade-user') AS memberships,
      (SELECT COUNT(*)::int FROM "AuthRateLimit") AS rate_limits,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'AuthRateLimit' AND column_name = 'userId'
      ) AS has_user_id,
      to_regclass('public."CalendarEvent"') IS NOT NULL AS has_calendar_event;
  `);
  const row = checks.rows[0] as {
    memberships: number;
    rate_limits: number;
    has_user_id: boolean;
    has_calendar_event: boolean;
  };
  if (row.memberships !== 1 || row.rate_limits !== 0 || !row.has_user_id || !row.has_calendar_event) {
    throw new Error("Verifica baseline a cinque migration fallita.");
  }

  await applyMigration(migrationNames[5]);
  const jobSite = await client.query(`
    SELECT
      (SELECT COUNT(*)::int FROM "User") AS users,
      to_regclass('public."JobSiteParticipant"') IS NOT NULL AS has_participant,
      to_regclass('public."JobSiteActionReceipt"') IS NOT NULL AS has_receipt,
      to_regclass('public."CalendarEvent"') IS NULL AS removed_calendar,
      to_regclass('public."JobSiteUserAssignment"') IS NULL AS removed_legacy_assignment;
  `);
  const final = jobSite.rows[0] as {
    users: number;
    has_participant: boolean;
    has_receipt: boolean;
    removed_calendar: boolean;
    removed_legacy_assignment: boolean;
  };
  if (
    final.users !== 0 ||
    !final.has_participant ||
    !final.has_receipt ||
    !final.removed_calendar ||
    !final.removed_legacy_assignment
  ) {
    throw new Error("Verifica upgrade distruttivo baseline -> Qoovex current fallita.");
  }

  const diff = spawnPrisma(["migrate", "diff", "--from-config-datasource", "--to-schema", "prisma/schema.prisma", "--exit-code"]);
  if (diff.status !== 0) throw new Error(`Schema finale con drift: ${diff.stdout || diff.stderr}`);
  } finally {
    await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public').catch(() => undefined);
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
