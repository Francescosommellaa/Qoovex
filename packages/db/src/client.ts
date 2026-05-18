import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_ENV_NAMES = [
  "DATABASE_URL",
  "DATABASE_PRISMA_DATABASE_URL",
  "DATABASE_POSTGRES_URL",
] as const;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = getDatabaseConnectionString();
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

function getDatabaseConnectionString() {
  for (const envName of DATABASE_ENV_NAMES) {
    const value = process.env[envName]?.trim();
    if (value) return value;
  }

  throw new Error(
    `[qoovex/db] Database connection env missing. Set one of: ${DATABASE_ENV_NAMES.join(", ")}.`,
  );
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
