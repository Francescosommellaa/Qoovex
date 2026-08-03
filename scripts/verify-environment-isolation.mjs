import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

function parse(raw) {
  const values = new Map();
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value) values.set(match[1], value);
  }
  return values;
}

const [previewPath, productionPath] = process.argv.slice(2);
if (!previewPath || !productionPath) {
  throw new Error("Usage: node scripts/verify-environment-isolation.mjs <preview-env> <production-env>");
}
const preview = parse(await readFile(resolve(previewPath), "utf8"));
const production = parse(await readFile(resolve(productionPath), "utf8"));

const databaseNames = ["DATABASE_URL", "DATABASE_PRISMA_DATABASE_URL", "DATABASE_POSTGRES_URL"];
const previewDatabases = new Set(databaseNames.map((name) => preview.get(name)).filter(Boolean));
const productionDatabases = new Set(databaseNames.map((name) => production.get(name)).filter(Boolean));
if ([...previewDatabases].some((value) => productionDatabases.has(value))) {
  throw new Error("Preview and Production database connection records are shared.");
}

for (const name of [
  "AUTH_SECRET",
  "QOOVEX_AUTH_CODE_SECRET",
  "QOOVEX_PASSWORD_PEPPER",
  "QOOVEX_AUDIT_SECRET",
  "QOOVEX_MFA_ENCRYPTION_KEY",
  "QOOVEX_MFA_COOKIE_SECRET",
  "CRON_SECRET",
  "BLOB_READ_WRITE_TOKEN",
  "BLOB_STORE_ID",
]) {
  if (!preview.get(name) || !production.get(name)) throw new Error(`Cannot prove isolation for ${name}.`);
  if (preview.get(name) === production.get(name)) throw new Error(`Preview and Production share ${name}.`);
}

if (preview.get("AUTH_URL") === production.get("AUTH_URL")) {
  throw new Error("Preview and Production share AUTH_URL.");
}

console.log("Preview database, Blob, callback and secret records are isolated from Production.");
