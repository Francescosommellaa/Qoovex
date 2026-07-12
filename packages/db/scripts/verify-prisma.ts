import { prisma } from "../lib/prisma";
import { inspectMigrationHistory } from "./migration-history";
import { assertNoSchemaDrift } from "./prisma-cli";

async function main() {
  await prisma.organization.findFirst({ select: { id: true } });
  const history = await inspectMigrationHistory(prisma, { allowPending: false });
  assertNoSchemaDrift();
  console.log(`[verify-prisma] Connessione, ${history.applied.length} migration e schema verificati.`);
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
