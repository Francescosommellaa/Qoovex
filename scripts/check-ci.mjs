import { spawnSync } from "node:child_process";

const pnpmExecutable = process.env.npm_execpath;

function run(args, env = process.env) {
  const command = pnpmExecutable ? process.execPath : "pnpm";
  const commandArgs = pnpmExecutable ? [pnpmExecutable, ...args] : args;
  const result = spawnSync(command, commandArgs, {
    env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function isDeclaredLocalLoopbackDatabase(env) {
  if (env.QOOVEX_DATABASE_ENVIRONMENT?.trim() !== "local") return false;
  const rawUrl = env.DATABASE_URL?.trim();
  if (!rawUrl) return false;
  try {
    return new Set(["localhost", "127.0.0.1", "::1"]).has(new URL(rawUrl).hostname);
  } catch {
    return false;
  }
}

const usesLocalPrismaDev = isDeclaredLocalLoopbackDatabase(process.env);

if (usesLocalPrismaDev) {
  // Prisma Dev uses a single-process PostgreSQL-compatible engine. Keep its
  // high-contention suites in one bounded phase instead of mixing independent
  // Vitest module pools with the complete unit corpus. Real CI PostgreSQL keeps
  // the normal check path and parallelism.
  const { QOOVEX_DATABASE_ENVIRONMENT: _localDatabaseEnvironment, ...checkEnvironment } = process.env;
  run(["check"], {
    ...checkEnvironment,
    QOOVEX_POSTGRES_INTEGRATION_PHASE: "deferred",
  });
  run(["--filter", "@qoovex/workspace", "test:postgres-integration"], {
    ...process.env,
    QOOVEX_POSTGRES_INTEGRATION_PHASE: "run",
  });
} else {
  run(["check"]);
}

run(["test:e2e"]);
