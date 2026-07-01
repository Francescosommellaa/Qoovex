import { prisma } from "../lib/prisma";

async function main() {
  await prisma.organization.findFirst({ select: { id: true } });
  console.log("✅ Connected.");
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
