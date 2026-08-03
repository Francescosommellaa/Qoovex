import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const TRANSIENT_WRITE_ERROR_CODES = new Set(["EBUSY", "EPERM", "UNKNOWN"]);

async function writeGeneratedFile(target, contents) {
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      await writeFile(target, contents, "utf8");
      return;
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
      if (!TRANSIENT_WRITE_ERROR_CODES.has(code) || attempt === 10) throw error;
      await delay(attempt * 50);
    }
  }
}

const generatedModel = new URL("../generated/prisma/models/DataControlJob.ts", import.meta.url);
const source = await readFile(generatedModel, "utf8");
const normalized = source.replace(
  /   \* \r?\n(   \* Select which fields to (?:average|sum))/g,
  "   *\n$1",
);

if (normalized !== source) await writeGeneratedFile(generatedModel, normalized);

async function listGeneratedTypeScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listGeneratedTypeScriptFiles(path)));
    else if (entry.isFile() && entry.name.endsWith(".ts")) files.push(path);
  }
  return files;
}

const generatedRoot = fileURLToPath(new URL("../generated/prisma", import.meta.url));
for (const target of await listGeneratedTypeScriptFiles(generatedRoot)) {
  const source = await readFile(target, "utf8");
  const normalized = source.replace(/[ \t]+(?=\r?\n)/g, "");
  if (normalized !== source) await writeGeneratedFile(target, normalized);
}
