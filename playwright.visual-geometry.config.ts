import path from "node:path";
import { defineConfig, devices, type Project } from "@playwright/test";

const inertDatabaseUrl = "postgresql://visual_geometry:visual_geometry@127.0.0.1:9/visual_geometry?connect_timeout=1";
const projects = [
  ["sirio", "light", "http://127.0.0.1:3002"],
  ["sirio", "dark", "http://127.0.0.1:3002"],
  ["web", "light", "http://127.0.0.1:3000"],
  ["web", "dark", "http://127.0.0.1:3000"],
  ["workspace", "light", "http://127.0.0.1:3001"],
  ["workspace", "dark", "http://127.0.0.1:3001"],
] as const;

function visualProject([app, theme, baseURL]: (typeof projects)[number]): Project {
  const name = `${app}-${theme}`;
  return {
    name,
    grep: new RegExp(`\\[${name}\\]`),
    metadata: { app, theme },
    use: {
      ...devices["Desktop Chrome"],
      baseURL,
      colorScheme: theme,
    },
  };
}

export default defineConfig({
  testDir: "./tests/visual-geometry",
  testMatch: "visual-geometry.spec.ts",
  timeout: 45_000,
  expect: {
    timeout: 8_000,
    toHaveScreenshot: {
      stylePath: path.join(__dirname, "tests/visual-geometry/snapshot-style.css"),
      threshold: 0.2,
    },
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  workers: 1,
  retries: 0,
  outputDir: "output/visual-geometry/test-results",
  snapshotPathTemplate: "{testDir}/__snapshots__/{platform}/{projectName}/{arg}{ext}",
  reporter: process.env.CI
    ? [
        ["github"],
        ["html", { outputFolder: "output/visual-geometry/report", open: "never" }],
        ["json", { outputFile: "output/visual-geometry/results.json" }],
      ]
    : [
        ["line"],
        ["html", { outputFolder: "output/visual-geometry/report", open: "never" }],
        ["json", { outputFile: "output/visual-geometry/results.json" }],
      ],
  webServer: [
    {
      command: "pnpm --filter @qoovex/web exec next start --port 3000",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: "pnpm --filter @qoovex/workspace exec next start --port 3001",
      env: {
        ...process.env,
        DATABASE_URL: inertDatabaseUrl,
        DATABASE_PRISMA_DATABASE_URL: inertDatabaseUrl,
        DATABASE_POSTGRES_URL: inertDatabaseUrl,
        AUTH_SECRET: "visual-geometry-local-only-auth-secret-0000000000000000",
        AUTH_URL: "http://127.0.0.1:3001",
        QOOVEX_VISUAL_GEOMETRY: "1",
      },
      url: "http://127.0.0.1:3001/sign-in",
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: "pnpm --filter @qoovex/sirio exec next start --port 3002",
      url: "http://127.0.0.1:3002/components/button",
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
  use: {
    browserName: "chromium",
    deviceScaleFactor: 1,
    locale: "it-IT",
    timezoneId: "Europe/Rome",
    trace: "retain-on-failure",
    viewport: { width: 1440, height: 1000 },
  },
  projects: projects.map(visualProject),
});
