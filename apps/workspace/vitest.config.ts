import { resolve } from "node:path";
import { configDefaults, defineConfig } from "vitest/config";
import { shouldSerializeWorkspaceTestFiles } from "./vitest-execution-policy";

const deferPostgresIntegration = process.env.QOOVEX_POSTGRES_INTEGRATION_PHASE === "deferred";
const runPostgresIntegration = process.env.QOOVEX_POSTGRES_INTEGRATION_PHASE === "run";

const serializeWorkspaceTestFiles = shouldSerializeWorkspaceTestFiles(process.env);

export default defineConfig({
  test: {
    // PostgreSQL integration suites replace methods on the shared Prisma client.
    // Keep files sequential in CI and in explicit integration/E2E phases so a
    // transaction spy cannot be consumed by another concurrently running file.
    fileParallelism: serializeWorkspaceTestFiles ? false : undefined,
    maxWorkers: serializeWorkspaceTestFiles ? 1 : undefined,
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
