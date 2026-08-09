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

async function main() {
  const manifest = JSON.parse(await readFile(resolve("../../ops/workspace-release-manifest.json"), "utf8")) as { database: { baselineHead: string; migrationHead: string } };
  const ledger = JSON.parse(await readFile(resolve("../../ops/migration-ledger.json"), "utf8")) as { migrations: Array<{ name: string }> };
  const migrationNames = ledger.migrations.map((migration) => migration.name);
  const baselineIndex = migrationNames.indexOf(manifest.database.baselineHead);
  if (baselineIndex !== 4 || migrationNames.at(-1) !== manifest.database.migrationHead) throw new Error("Manifest e ledger migration non coerenti per il test upgrade.");
  const client = new pg.Client({ connectionString: databaseUrl });

  try {
  await client.connect();
  await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public');
  const applyMigration = async (migrationName: string) => {
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
      to_regclass('public."JobSite"') IS NOT NULL AS has_baseline_schema;
  `);
  const row = checks.rows[0] as {
    memberships: number;
    rate_limits: number;
    has_user_id: boolean;
    has_baseline_schema: boolean;
  };
  if (row.memberships !== 1 || row.rate_limits !== 0 || !row.has_user_id || !row.has_baseline_schema) {
    throw new Error("Verifica baseline a cinque migration fallita.");
  }

  for (const migrationName of migrationNames.slice(baselineIndex + 1)) await applyMigration(migrationName);
  const jobSite = await client.query(`
    SELECT
      (SELECT COUNT(*)::int FROM "User") AS users,
      to_regclass('public."JobSiteParticipant"') IS NOT NULL AS has_participant,
      to_regclass('public."JobSiteActionReceipt"') IS NOT NULL AS has_receipt;
  `);
  const final = jobSite.rows[0] as {
    users: number;
    has_participant: boolean;
    has_receipt: boolean;
  };
  if (
    final.users !== 0 ||
    !final.has_participant ||
    !final.has_receipt
  ) {
    throw new Error("Verifica upgrade baseline -> schema corrente fallita.");
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
