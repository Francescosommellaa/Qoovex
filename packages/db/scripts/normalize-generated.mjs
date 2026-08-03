import { readdir, readFile, writeFile } from "node:fs/promises";

const generatedModel = new URL("../generated/prisma/models/DataControlJob.ts", import.meta.url);
const source = await readFile(generatedModel, "utf8");
const normalized = source.replace(
  /   \* \r?\n(   \* Select which fields to (?:average|sum))/g,
  "   *\n$1",
);

if (normalized !== source) await writeFile(generatedModel, normalized, "utf8");

const generatedRoot = new URL("../generated/prisma/", import.meta.url);

async function normalizeGeneratedDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const target = new URL(entry.name, directory);
    if (entry.isDirectory()) {
      await normalizeGeneratedDirectory(new URL(`${entry.name}/`, directory));
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".ts")) continue;

    const source = await readFile(target, "utf8");
    const normalized = source.replace(/[ \t]+(?=\r?\n)/g, "");
    if (normalized !== source) await writeFile(target, normalized, "utf8");
  }
}

await normalizeGeneratedDirectory(generatedRoot);
