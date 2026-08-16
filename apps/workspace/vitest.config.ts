import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Local E2E may use Prisma Dev's single-process PostgreSQL-compatible engine.
    // Keep files sequential there; real CI PostgreSQL retains normal parallelism.
    fileParallelism: process.env.QOOVEX_E2E_MODE === "1" ? false : undefined,
    maxWorkers: process.env.QOOVEX_E2E_MODE === "1" ? 1 : undefined,
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
