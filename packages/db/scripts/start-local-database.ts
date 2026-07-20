import "dotenv/config";

import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { Client } from "pg";
import { assertDatabaseTargetForCommand } from "../src/database-target-guard";

const LOCAL_DATABASE_NAME = "qoovex-local";
const LOCAL_PROXY_PORT = 51224;
const LOCAL_DATABASE_PORT = 51225;
const LOCAL_SHADOW_DATABASE_PORT = 51226;
const STARTUP_TIMEOUT_MS = 15_000;
const DATABASE_ENV_NAMES = [
  "DATABASE_URL",
  "DATABASE_PRISMA_DATABASE_URL",
  "DATABASE_POSTGRES_URL",
] as const;

function getLocalDatabaseUrl() {
  for (const name of DATABASE_ENV_NAMES) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }

  throw new Error(`[local-db] Database connection env missing. Set one of: ${DATABASE_ENV_NAMES.join(", ")}.`);
}

function sanitizePrismaOutput(output: string) {
  return output
    .replace(/(?:prisma\+)?postgres(?:ql)?:\/\/\S+/giu, "[REDACTED_LOCAL_DATABASE_URL]")
    .replace(/api_key=\S+/giu, "api_key=[REDACTED]")
    .trim();
}

async function canQueryDatabase(connectionString: string) {
  const client = new Client({ connectionString, connectionTimeoutMillis: 1_000 });
  try {
    await client.connect();
    await client.query("SELECT 1");
    return true;
  } catch {
    return false;
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function main() {
  assertDatabaseTargetForCommand("local database startup");

  if (process.env.QOOVEX_DATABASE_ENVIRONMENT?.trim() !== "local") {
    throw new Error("[local-db] QOOVEX_DATABASE_ENVIRONMENT must be local for pnpm dev.");
  }

  const connectionString = getLocalDatabaseUrl();
  const databaseUrl = new URL(connectionString);
  const databasePort = Number(databaseUrl.port);
  if (databasePort !== LOCAL_DATABASE_PORT) {
    throw new Error(`[local-db] Expected the canonical local database port ${LOCAL_DATABASE_PORT}.`);
  }

  if (await canQueryDatabase(connectionString)) {
    console.log(`[local-db] ${LOCAL_DATABASE_NAME} is ready.`);
    return;
  }

  const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const result = spawnSync(
    command,
    [
      "exec",
      "prisma",
      "dev",
      "--name",
      LOCAL_DATABASE_NAME,
      "--port",
      String(LOCAL_PROXY_PORT),
      "--db-port",
      String(LOCAL_DATABASE_PORT),
      "--shadow-db-port",
      String(LOCAL_SHADOW_DATABASE_PORT),
      "--detach",
    ],
    { encoding: "utf8", env: process.env },
  );

  if (result.status !== 0) {
    const details = sanitizePrismaOutput(`${result.stdout ?? ""}\n${result.stderr ?? ""}`);
    throw new Error(`[local-db] Unable to start ${LOCAL_DATABASE_NAME}.${details ? `\n${details}` : ""}`);
  }

  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (await canQueryDatabase(connectionString)) {
      console.log(`[local-db] ${LOCAL_DATABASE_NAME} started and is ready.`);
      return;
    }
    await delay(250);
  }

  throw new Error(`[local-db] ${LOCAL_DATABASE_NAME} did not become ready within ${STARTUP_TIMEOUT_MS / 1_000}s.`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "[local-db] Unexpected startup failure.";
  console.error(message);
  process.exitCode = 1;
});
