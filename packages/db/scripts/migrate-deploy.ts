import { prisma } from "../lib/prisma";
import { assertCiEphemeralDatabase, assertProductionApproval } from "./migration-deploy-guard";
import { inspectMigrationHistory } from "./migration-history";
import { assertNoSchemaDrift, runPrisma } from "./prisma-cli";

const DATABASE_ENV_NAMES = [
  "DATABASE_URL",
  "DATABASE_PRISMA_DATABASE_URL",
  "DATABASE_POSTGRES_URL",
] as const;

function getDatabaseUrl() {
  for (const name of DATABASE_ENV_NAMES) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  throw new Error("[migrate-deploy] Connessione database non configurata.");
}

async function main() {
  const history = await inspectMigrationHistory(prisma, { allowPending: true });
  const ciEphemeral = process.argv.includes("--ci-ephemeral");
  if (ciEphemeral) assertCiEphemeralDatabase(getDatabaseUrl());
  else assertProductionApproval({
    approved: process.env.QOOVEX_MIGRATE_DEPLOY_APPROVED,
    backupRef: process.env.QOOVEX_MIGRATION_BACKUP_REF,
    expectedLastMigration: process.env.QOOVEX_EXPECTED_LAST_MIGRATION,
    lastMigration: history.local.at(-1)?.name,
  });

  console.log(`[migrate-deploy] Preflight valido: ${history.applied.length} applicate, ${history.pending.length} pendenti.`);
  runPrisma(["migrate", "deploy"]);
  await inspectMigrationHistory(prisma, { allowPending: false });
  assertNoSchemaDrift();
  console.log("[migrate-deploy] Deploy e verifica completati.");
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
