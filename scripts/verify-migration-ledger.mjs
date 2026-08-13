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
  const sql = await readFile(join(migrationsRoot, entry.name, "migration.sql"), "utf8");
  const canonicalSql = sql.replace(/\r\n?/g, "\n");
  const actual = createHash("sha256").update(canonicalSql, "utf8").digest("hex");
  if (actual !== entry.sha256) {
    throw new Error(`Protected migration hash mismatch: ${entry.name}`);
  }
}

if (ledger.hashCanonicalization !== "utf8_lf") {
  throw new Error("Migration ledger must declare UTF-8/LF hash canonicalization.");
}

const productionHeadIndex = ledgerNames.indexOf(ledger.protectedProductionHead);
if (productionHeadIndex < 0) {
  throw new Error("Protected Production head must exist in the migration ledger.");
}

for (const [index, entry] of ledger.migrations.entries()) {
  if (index <= productionHeadIndex && entry.productionApplied !== true) {
    throw new Error(`Migration at or before the protected Production head is not recorded as applied: ${entry.name}`);
  }
  if (index > productionHeadIndex && entry.productionApplied !== false) {
    throw new Error(`Migration after the protected Production head must remain pending: ${entry.name}`);
  }
}

console.log(`Migration ledger verified: ${ledgerNames.length} migrations, repository head ${ledgerNames.at(-1)}, Production head ${ledger.protectedProductionHead}.`);
