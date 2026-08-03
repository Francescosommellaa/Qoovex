import { prisma } from "../lib/prisma";
import { inspectMigrationHistory } from "./migration-history";

const expected = process.argv[2]?.trim();
if (!expected) throw new Error("Expected migration head argument is required.");

async function main() {
  try {
    const history = await inspectMigrationHistory(prisma, { allowPending: true });
    const actual = history.applied.at(-1)?.name;
    if (actual !== expected) {
      throw new Error(`Database migration head mismatch: expected=${expected}, actual=${actual ?? "none"}.`);
    }
    console.log(`Database migration head verified: ${actual}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
