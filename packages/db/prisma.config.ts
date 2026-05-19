import "dotenv/config";
import { defineConfig } from "prisma/config";

const FALLBACK_GENERATE_DATABASE_URL =
  "postgresql://qoovex:qoovex@localhost:5432/qoovex?schema=public";

function getPrismaConfigDatabaseUrl() {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.DATABASE_PRISMA_DATABASE_URL?.trim() ||
    process.env.DATABASE_POSTGRES_URL?.trim() ||
    FALLBACK_GENERATE_DATABASE_URL
  );
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: getPrismaConfigDatabaseUrl(),
  },
});
