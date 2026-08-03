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

for (const entry of ledger.migrations) {
  const sql = await readFile(
    join(root, "packages/db/prisma/migrations", entry.name, "migration.sql"),
    "utf8",
  );
  const matches = destructivePatterns
    .filter(([, pattern]) => pattern.test(sql))
    .map(([label]) => label);
  if (matches.length > 0 && !entry.productionApplied) {
    findings.push(`${entry.name}: ${matches.join(", ")}`);
  }
}

if (findings.length > 0) {
  throw new Error(`Destructive migrations are blocked by the ordinary gate:\n${findings.join("\n")}`);
}

console.log("Migration SQL classifier passed; destructive historical SQL is limited to protected Production-applied migrations.");
