import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const PRISMA_CLI = require.resolve("prisma/build/index.js");

export function spawnPrisma(args: string[]) {
  return spawnSync(process.execPath, [PRISMA_CLI, ...args], {
    cwd: PACKAGE_ROOT,
    encoding: "utf8",
    env: process.env,
  });
}

export function runPrisma(args: string[]) {
  const result = spawnSync(process.execPath, [PRISMA_CLI, ...args], {
    cwd: PACKAGE_ROOT,
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`[prisma-cli] prisma ${args.join(" ")} terminato con codice ${result.status ?? "sconosciuto"}.`);
  }
}

export function assertNoSchemaDrift() {
  const result = spawnPrisma([
    "migrate",
    "diff",
    "--from-config-datasource",
    "--to-schema",
    "prisma/schema.prisma",
    "--exit-code",
  ]);

  if (result.status === 0) return;

  const output = (result.stdout ?? "") + (result.stderr ?? "");
  const lines = output.split("\n");

  const hasDestructiveChange = lines.some((line) => {
    const trimmed = line.trim();
    return (
      (trimmed.startsWith("[-]") || trimmed.startsWith("[*]")) &&
      !trimmed.includes("index") &&
      !trimmed.includes("Index") &&
      (trimmed.includes("table") || trimmed.includes("column") || trimmed.includes("constraint") || trimmed.includes("enum") || trimmed.includes("relation"))
    );
  });

  if (hasDestructiveChange) {
    throw new Error(`[prisma-cli] Schema drift detected (destructive changes).\n${output}`);
  }
}
