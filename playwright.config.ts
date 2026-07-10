import { defineConfig, devices } from "@playwright/test";

const workspaceUrl = process.env.E2E_WORKSPACE_URL ?? "http://localhost:3001";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: workspaceUrl,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm --filter @qoovex/workspace dev",
    url: workspaceUrl,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
