import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { normalizeDatabaseConnectionString } from "../src/connection-string";
import { assertVercelDatabaseEnvironmentMarker } from "../src/database-target-guard";
import { recordDatabaseOperation } from "../src/operation-metrics";

const DATABASE_ENV_NAMES = [
  "DATABASE_URL",
  "DATABASE_PRISMA_DATABASE_URL",
  "DATABASE_POSTGRES_URL",
] as const;

function getDatabaseConnectionString() {
  for (const envName of DATABASE_ENV_NAMES) {
    const value = process.env[envName]?.trim();
    if (value) return value;
  }

  throw new Error(
    `[qoovex/db] Database connection env missing. Set one of: ${DATABASE_ENV_NAMES.join(", ")}.`,
  );
}

function createPrismaClient(): PrismaClient {
  assertVercelDatabaseEnvironmentMarker();
  const connectionString = normalizeDatabaseConnectionString(getDatabaseConnectionString());
  const target = new URL(connectionString);
  const isCanonicalPrismaDev = process.env.QOOVEX_DATABASE_ENVIRONMENT?.trim() === "local"
    && ["localhost", "127.0.0.1", "::1", "[::1]"].includes(target.hostname.toLowerCase())
    && target.port === "51225";
  // Prisma Dev uses a single-process PGlite protocol server. Queueing through a
  // one-connection pool prevents overlapping prepared messages locally; CI and
  // remote PostgreSQL targets retain the adapter's normal pool concurrency.
  const adapter = new PrismaPg({ connectionString, ...(isCanonicalPrismaDev ? { max: 1 } : {}) });
  return new PrismaClient({ adapter }).$extends({
    name: "qoovex-operation-metrics",
    query: {
      async $allOperations({ model, operation, args, query }) {
        const startedAt = performance.now();
        try {
          return await query(args);
        } finally {
          recordDatabaseOperation({ model, operation, durationMs: performance.now() - startedAt });
        }
      },
    },
  }) as PrismaClient;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
