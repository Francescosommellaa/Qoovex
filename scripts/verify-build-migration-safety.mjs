import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const packageFiles = ["package.json"];
for (const base of ["apps", "packages"]) {
  for (const entry of await readdir(join(root, base), { withFileTypes: true })) {
    if (entry.isDirectory()) packageFiles.push(join(base, entry.name, "package.json"));
  }
}

const forbidden = /\b(prisma\s+migrate|migrate:deploy|migrate\s+reset|db\s+push|db:push)\b/i;
for (const file of packageFiles) {
  let parsed;
  try {
    parsed = JSON.parse(await readFile(join(root, file), "utf8"));
  } catch (error) {
    if (file === "package.json") throw error;
    continue;
  }
  for (const [name, command] of Object.entries(parsed.scripts ?? {})) {
    if ((name === "build" || name === "postinstall") && forbidden.test(command)) {
      throw new Error(`${file}#${name} may not execute migrations or schema mutation.`);
    }
    if (name === "prebuild" && forbidden.test(command) && command !== "node scripts/cloud-migrate.mjs") {
      throw new Error(`${file}#prebuild may only use the guarded cloud migration hook.`);
    }
  }
}

console.log("Build and postinstall scripts are migration-free; prebuild uses only the guarded cloud migration hook.");
