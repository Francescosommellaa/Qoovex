import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "../../..");

export function createCloudMigrationPlan(environment, migrationHead) {
  const vercelEnvironment = environment.VERCEL_ENV?.trim();
  if (vercelEnvironment !== "preview" && vercelEnvironment !== "production") return null;

  if (!migrationHead?.trim()) throw new Error("Missing migration head for the Vercel cloud build.");
  return {
    environment: vercelEnvironment,
    expectedLastMigration: migrationHead.trim(),
  };
}

async function main() {
  const manifest = JSON.parse(await readFile(resolve(repositoryRoot, "ops/workspace-release-manifest.json"), "utf8"));
  const plan = createCloudMigrationPlan(process.env, manifest.database?.migrationHead);
  if (!plan) {
    console.log("Cloud migration skipped outside Vercel Preview or Production.");
    return;
  }

  const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const result = spawnSync(
    command,
    ["--dir", repositoryRoot, "--filter", "@qoovex/db", "db:migrate:deploy"],
    {
      cwd: repositoryRoot,
      env: {
        ...process.env,
        QOOVEX_CLOUD_BUILD_MIGRATION: "1",
        QOOVEX_DATABASE_ENVIRONMENT: plan.environment,
        QOOVEX_EXPECTED_LAST_MIGRATION: plan.expectedLastMigration,
      },
      stdio: "inherit",
    },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
