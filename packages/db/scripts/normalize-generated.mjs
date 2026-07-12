import { readFile, writeFile } from "node:fs/promises";

const generatedModel = new URL("../generated/prisma/models/DataControlJob.ts", import.meta.url);
const source = await readFile(generatedModel, "utf8");
const normalized = source.replace(
  /   \* \r?\n(   \* Select which fields to (?:average|sum))/g,
  "   *\n$1",
);

if (normalized !== source) await writeFile(generatedModel, normalized, "utf8");
