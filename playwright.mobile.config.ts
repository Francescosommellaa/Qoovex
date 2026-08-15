import { defineConfig, devices } from "@playwright/test";

const urls = {
  web: process.env.MOBILE_WEB_URL ?? "http://localhost:3000",
  workspace: process.env.MOBILE_WORKSPACE_URL ?? "http://localhost:3001",
  sirio: process.env.MOBILE_SIRIO_URL ?? "http://localhost:3002",
};

function assertSafeMobileTargets() {
  if (process.env.QOOVEX_MOBILE_MODE !== "1") {
    throw new Error("QOOVEX_MOBILE_MODE=1 is required for the mobile Playwright gate.");
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("The mobile Playwright gate cannot run with NODE_ENV=production.");
  }
  for (const [name, value] of Object.entries(urls)) {
    const target = new URL(value);
    if (!["localhost", "127.0.0.1", "::1"].includes(target.hostname)) {
      throw new Error(`${name} mobile target must use loopback.`);
    }
  }
  if (process.env.CI) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl || process.env.QOOVEX_DATABASE_ENVIRONMENT !== "test") {
      throw new Error("CI mobile role coverage requires the declared ephemeral test database.");
    }
    const database = new URL(databaseUrl);
    if (
      !["localhost", "127.0.0.1", "::1"].includes(database.hostname) ||
      !database.pathname.endsWith("_ci")
    ) {
      throw new Error("CI mobile database must be a loopback *_ci target.");
    }
  }
}

assertSafeMobileTargets();

export default defineConfig({
  testDir: "./tests/mobile",
  outputDir: "test-results/mobile",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { outputFolder: "playwright-report/mobile", open: "never" }]]
    : "list",
  use: {
    ...devices["Desktop Chrome"],
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command: "pnpm --filter @qoovex/web dev",
      url: urls.web,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command: process.env.CI
        ? "pnpm --filter @qoovex/workspace exec next dev --port 3001"
        : "pnpm --filter @qoovex/workspace dev",
      url: `${urls.workspace}/sign-in`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: { ...process.env, QOOVEX_E2E_MODE: "1" },
    },
    {
      command: "pnpm --filter @qoovex/sirio dev",
      url: `${urls.sirio}/components/button`,
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
    },
  ],
});
