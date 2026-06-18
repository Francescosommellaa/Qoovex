import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: [
    "tests/e2e/**/*.spec.ts",
  ],
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-375",
      use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 } },
    },
    {
      name: "chromium-375-short",
      use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 667 } },
    },
    {
      name: "chromium-812-landscape",
      use: { ...devices["Desktop Chrome"], viewport: { width: 812, height: 375 } },
    },
    {
      name: "chromium-768",
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } },
    },
    {
      name: "chromium-1024",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1024, height: 900 } },
    },
    {
      name: "chromium-1440",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "webkit-375",
      use: { ...devices["Desktop Safari"], viewport: { width: 375, height: 812 } },
    },
    {
      name: "webkit-1440",
      use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 1000 } },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter @qoovex/web dev",
      url: "http://localhost:3000/",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter @qoovex/workspace dev",
      url: "http://localhost:3001/api/auth/providers",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter @qoovex/sirio dev",
      url: "http://localhost:3002",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
