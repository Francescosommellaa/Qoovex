import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const [environmentName, envFile] = process.argv.slice(2);
if (!environmentName || !envFile) {
  throw new Error("Usage: node scripts/verify-environment-contract.mjs <environment> <env-file>");
}

const contract = JSON.parse(await readFile(resolve("ops/environment-contract.json"), "utf8"));
const environment = contract.environments[environmentName];
if (!environment) throw new Error(`Unknown environment contract: ${environmentName}`);

const raw = await readFile(resolve(envFile), "utf8");
const values = new Map();
for (const line of raw.split(/\r?\n/)) {
  const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
  if (!match) continue;
  let value = match[2].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  values.set(match[1], value);
}

for (const groupName of environment.requiredGroups) {
  const group = contract.groups[groupName];
  if (!group) throw new Error(`Missing group definition: ${groupName}`);
  for (const name of group.required ?? []) {
    if (!values.get(name)) throw new Error(`Missing required ${environmentName} variable: ${name}`);
  }
  if (group.anyOf && !group.anyOf.some((name) => values.get(name))) {
    throw new Error(`Missing required ${environmentName} variable group: ${group.anyOf.join(" | ")}`);
  }
}

if (values.get("QOOVEX_DATABASE_ENVIRONMENT") !== environment.databaseMarker) {
  throw new Error(`QOOVEX_DATABASE_ENVIRONMENT must be ${environment.databaseMarker}.`);
}
if (environment.authUrl && values.get("AUTH_URL") !== environment.authUrl) {
  throw new Error(`AUTH_URL does not match the ${environmentName} contract.`);
}
if (environmentName === "preview" && values.get("AUTH_URL") === contract.environments.production.authUrl) {
  throw new Error("Preview AUTH_URL must be isolated from Production.");
}

console.log(`${environmentName} environment contract verified without printing values.`);
