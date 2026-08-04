import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const ledger = JSON.parse(await readFile(join(root, "ops/migration-ledger.json"), "utf8"));
const destructivePatterns = [
  ["DROP", /\bDROP\s+(TABLE|COLUMN|TYPE|INDEX|CONSTRAINT)\b/i],
  ["TRUNCATE", /\bTRUNCATE\b/i],
  ["DELETE", /\bDELETE\s+FROM\b/i],
  ["RENAME", /\bRENAME\s+(COLUMN|TABLE|TO)\b/i],
];
const findings = [];
const frozenExecutionPolicy = "MANUAL_REAUTHORIZATION_REQUIRED";

for (const entry of ledger.migrations) {
  const sql = await readFile(
    join(root, "packages/db/prisma/migrations", entry.name, "migration.sql"),
    "utf8",
  );
  const matches = destructivePatterns
    .filter(([, pattern]) => pattern.test(sql))
    .map(([label]) => label);
  const explicitlyFrozen =
    entry.destructiveApproved === false && entry.executionPolicy === frozenExecutionPolicy;
  if (matches.length > 0 && !entry.productionApplied && !explicitlyFrozen) {
    findings.push(`${entry.name}: ${matches.join(", ")}`);
  }
}

if (findings.length > 0) {
  throw new Error(`Destructive migrations are blocked by the ordinary gate:\n${findings.join("\n")}`);
}

console.log("Migration SQL classifier passed; destructive SQL is either Production-applied or frozen pending manual reauthorization.");
