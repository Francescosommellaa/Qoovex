import { resolve } from "node:path";
import { configDefaults, defineConfig } from "vitest/config";

const deferPostgresIntegration = process.env.QOOVEX_POSTGRES_INTEGRATION_PHASE === "deferred";
const runPostgresIntegration = process.env.QOOVEX_POSTGRES_INTEGRATION_PHASE === "run";

export default defineConfig({
  test: {
    // Local E2E may use Prisma Dev's single-process PostgreSQL-compatible engine.
    // Keep files sequential there; real CI PostgreSQL retains isolation and parallelism.
    fileParallelism: process.env.QOOVEX_E2E_MODE === "1" ? false : undefined,
    maxWorkers: process.env.QOOVEX_E2E_MODE === "1" ? 1 : undefined,
    exclude: [
      ...configDefaults.exclude,
      ...(deferPostgresIntegration ? ["**/*.integration.test.ts"] : []),
    ],
    sequence: runPostgresIntegration ? { hooks: "stack" } : undefined,
    setupFiles: runPostgresIntegration
      ? ["./vitest.postgres-integration.setup.ts"]
      : undefined,
  },
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "src/shared"),
      "@entities": resolve(__dirname, "src/entities"),
      "@features": resolve(__dirname, "src/features"),
      "@widgets": resolve(__dirname, "src/widgets"),
      "@views": resolve(__dirname, "src/views"),
      "@": resolve(__dirname, "src"),
    },
  },
});
