import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const ledger = JSON.parse(await readFile(join(root, "ops/migration-ledger.json"), "utf8"));
const migrationsRoot = join(root, "packages/db/prisma/migrations");
const directoryNames = (await readdir(migrationsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const ledgerNames = ledger.migrations.map((entry) => entry.name);

if (JSON.stringify(directoryNames) !== JSON.stringify(ledgerNames)) {
  throw new Error(`Migration ledger mismatch. directories=${directoryNames.join(",")} ledger=${ledgerNames.join(",")}`);
}

const timestamps = ledgerNames.map((name) => name.slice(0, 14));
if (new Set(timestamps).size !== timestamps.length) {
  throw new Error("Duplicate migration timestamp detected.");
}

for (const entry of ledger.migrations) {
  const sql = await readFile(join(migrationsRoot, entry.name, "migration.sql"));
  const actual = createHash("sha256").update(sql).digest("hex");
  if (actual !== entry.sha256) {
    throw new Error(`Protected migration hash mismatch: ${entry.name}`);
  }
}

if (ledger.protectedProductionHead !== ledgerNames.at(-1)) {
  throw new Error("Protected Production head must equal the final ledger migration.");
}

console.log(`Migration ledger verified: ${ledgerNames.length} migrations, head ${ledger.protectedProductionHead}.`);
