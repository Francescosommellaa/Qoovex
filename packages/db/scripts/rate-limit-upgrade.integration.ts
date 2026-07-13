import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import pg from "pg";

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
] as const;
const client = new pg.Client({ connectionString: databaseUrl });

try {
  await client.connect();
  await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public');
  for (const migrationName of migrationNames.slice(0, -1)) {
    const sql = await readFile(resolve("prisma/migrations", migrationName, "migration.sql"), "utf8");
    await client.query(sql);
  }

  await client.query(`
    INSERT INTO "User" (id, email, username, "firstName", "createdAt", "updatedAt")
    VALUES ('upgrade-user', 'upgrade@example.test', 'upgrade_user', 'Upgrade', NOW(), NOW());
    INSERT INTO "Organization" (id, name, code, "createdById", "createdAt", "updatedAt")
    VALUES ('upgrade-org', 'Upgrade fixture', 'UPGRADE-CI', 'upgrade-user', NOW(), NOW());
    INSERT INTO "OrganizationMembership" (id, "organizationId", "userId", role, "createdAt", "updatedAt")
    VALUES ('upgrade-membership', 'upgrade-org', 'upgrade-user', 'OWNER', NOW(), NOW());
    INSERT INTO "AuthRateLimit" (key, bucket, count, "resetAt")
    VALUES ('auth:signin:upgrade@example.test', 'auth:signin', 3, NOW() + INTERVAL '1 hour');
  `);

  const privacySql = await readFile(resolve("prisma/migrations", migrationNames.at(-1)!, "migration.sql"), "utf8");
  await client.query(privacySql);
  const checks = await client.query(`
    SELECT
      (SELECT COUNT(*)::int FROM "OrganizationMembership" WHERE id = 'upgrade-membership') AS memberships,
      (SELECT COUNT(*)::int FROM "AuthRateLimit") AS rate_limits,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'AuthRateLimit' AND column_name = 'userId'
      ) AS has_user_id;
  `);
  const row = checks.rows[0] as { memberships: number; rate_limits: number; has_user_id: boolean };
  if (row.memberships !== 1 || row.rate_limits !== 0 || !row.has_user_id) throw new Error("Verifica upgrade rate-limit fallita.");

  const diff = spawnSync("pnpm", ["exec", "prisma", "migrate", "diff", "--from-config-datasource", "--to-schema", "prisma/schema.prisma", "--exit-code"], {
    cwd: process.cwd(), env: { ...process.env, DATABASE_URL: databaseUrl }, encoding: "utf8", shell: true,
  });
  if (diff.status !== 0) throw new Error(`Schema finale con drift: ${diff.stdout || diff.stderr}`);
} finally {
  await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public').catch(() => undefined);
  await client.end().catch(() => undefined);
}
