import crypto from "node:crypto";
import { defineConfig, devices } from "@playwright/test";

const workspaceUrl = process.env.E2E_WORKSPACE_URL ?? "http://localhost:3001";
const sinkPort = 43119;
const sinkSecret = crypto.randomBytes(32).toString("hex");
const sinkUrl = `http://127.0.0.1:${sinkPort}/messages`;
process.env.QOOVEX_E2E_EMAIL_SINK_URL = sinkUrl;
process.env.QOOVEX_E2E_EMAIL_SINK_SECRET = sinkSecret;

function assertSafeE2eTarget() {
  if (process.env.QOOVEX_E2E_MODE !== "1") throw new Error("QOOVEX_E2E_MODE=1 e obbligatorio per eseguire Playwright.");
  if (process.env.NODE_ENV === "production") throw new Error("Playwright E2E non puo essere eseguito con NODE_ENV=production.");
  const parsedWorkspaceUrl = new URL(workspaceUrl);
  if (!["localhost", "127.0.0.1", "::1"].includes(parsedWorkspaceUrl.hostname)) throw new Error("E2E_WORKSPACE_URL deve puntare a loopback.");

  const databaseUrl = process.env.DATABASE_URL ?? process.env.DATABASE_PRISMA_DATABASE_URL ?? process.env.DATABASE_POSTGRES_URL;
  if (!databaseUrl || process.env.QOOVEX_E2E_DATABASE_TARGET !== databaseUrl) throw new Error("Il target database E2E dichiarato non coincide con il target runtime.");
  if (!process.env.BLOB_STORE_ID || process.env.QOOVEX_E2E_BLOB_TARGET !== process.env.BLOB_STORE_ID) throw new Error("Il target Blob E2E dichiarato non coincide con il target runtime.");
  if (process.env.QOOVEX_E2E_RUN_ATTESTATION !== "I_ACKNOWLEDGE_FIXTURE_SCOPED_CLEANUP") throw new Error("Manca l'attestazione E2E per questo run.");
}

assertSafeE2eTarget();

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
  webServer: [
    {
      command: "node tests/e2e/support/email-sink.mjs",
      url: `http://127.0.0.1:${sinkPort}/health`,
      reuseExistingServer: false,
      timeout: 30_000,
      env: { ...process.env, QOOVEX_E2E_EMAIL_SINK_PORT: String(sinkPort), QOOVEX_E2E_EMAIL_SINK_SECRET: sinkSecret },
    },
    {
      command: "pnpm --filter @qoovex/workspace dev",
      url: workspaceUrl,
      reuseExistingServer: false,
      timeout: 120_000,
      env: { ...process.env, QOOVEX_E2E_MODE: "1", QOOVEX_E2E_EMAIL_SINK_URL: sinkUrl, QOOVEX_E2E_EMAIL_SINK_SECRET: sinkSecret },
    },
  ],
});
