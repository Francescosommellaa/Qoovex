import "dotenv/config";
import { inspectMigrationHistory } from "./migration-history";
import { verifyParticipantReferenceIntegrity } from "./participant-reference-integrity";
import { assertNoSchemaDrift } from "./prisma-cli";
import { assertDatabaseTargetForCommand } from "../src/database-target-guard";

async function main() {
  assertDatabaseTargetForCommand("verify:prisma");
  const { prisma } = await import("../lib/prisma");
  try {
    await prisma.organization.findFirst({ select: { id: true } });
    await verifyParticipantReferenceIntegrity(prisma);
    const history = await inspectMigrationHistory(prisma, { allowPending: false });
    assertNoSchemaDrift();
    console.log(`[verify-prisma] Connessione, ${history.applied.length} migration e schema verificati.`);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
