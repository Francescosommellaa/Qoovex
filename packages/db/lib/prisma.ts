import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { normalizeDatabaseConnectionString } from "../src/connection-string";

const DATABASE_ENV_NAMES = [
  "DATABASE_URL",
  "DATABASE_PRISMA_DATABASE_URL",
  "DATABASE_POSTGRES_URL",
] as const;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function getDatabaseConnectionString() {
  for (const envName of DATABASE_ENV_NAMES) {
    const value = process.env[envName]?.trim();
    if (value) return value;
  }

  throw new Error(
    `[qoovex/db] Database connection env missing. Set one of: ${DATABASE_ENV_NAMES.join(", ")}.`,
  );
}

function createPrismaClient() {
  const connectionString = normalizeDatabaseConnectionString(getDatabaseConnectionString());
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
