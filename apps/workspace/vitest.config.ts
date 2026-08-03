import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
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
