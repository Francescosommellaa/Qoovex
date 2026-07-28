import { readFile, writeFile } from "node:fs/promises";

const generatedModel = new URL("../generated/prisma/models/DataControlJob.ts", import.meta.url);
const source = await readFile(generatedModel, "utf8");
const normalized = source.replace(
  /   \* \r?\n(   \* Select which fields to (?:average|sum))/g,
  "   *\n$1",
);

if (normalized !== source) await writeFile(generatedModel, normalized, "utf8");

const generatedFilesWithPrismaWhitespace = [
  "../generated/prisma/browser.ts",
  "../generated/prisma/client.ts",
  "../generated/prisma/internal/prismaNamespace.ts",
  "../generated/prisma/models/CalendarEvent.ts",
  "../generated/prisma/models/OrganizationInvitation.ts",
  "../generated/prisma/models/OrganizationMembership.ts",
];

for (const relativePath of generatedFilesWithPrismaWhitespace) {
  const target = new URL(relativePath, import.meta.url);
  const source = await readFile(target, "utf8");
  const normalized = source.replace(/[ \t]+(?=\r?\n)/g, "");
  if (normalized !== source) await writeFile(target, normalized, "utf8");
}
