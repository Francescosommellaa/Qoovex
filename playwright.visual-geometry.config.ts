import path from "node:path";
import { defineConfig, devices, type Project } from "@playwright/test";

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
    ? [["github"], ["html", { outputFolder: "output/visual-geometry/report", open: "never" }]]
    : [["line"], ["html", { outputFolder: "output/visual-geometry/report", open: "never" }]],
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
