import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runDataControlJobs: vi.fn(),
  runScheduledEmailDigest: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@shared/server/access-errors", () => ({
  asAccessResponse: vi.fn((error: unknown) => Response.json({ message: error instanceof Error ? error.message : "Errore" }, { status: 500 })),
}));
vi.mock("@shared/server/cron-auth", () => ({
  isAuthorizedCronRequest: (request: Request) => request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`,
}));
vi.mock("@shared/server/data-control-job-service", () => ({ runDataControlJobs: mocks.runDataControlJobs }));
vi.mock("@shared/server/scheduled-email-digest-service", () => ({ runScheduledEmailDigest: mocks.runScheduledEmailDigest }));

import { GET as runDataJobs } from "../../app/api/data/jobs/run/route";
import { GET as runDigest } from "../../app/api/reminders/email-digest/run/route";

describe("cron routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "cron-secret-long-enough-for-tests";
    mocks.runDataControlJobs.mockResolvedValue({ scanned: 0, completed: 0, failed: 0, skipped: 0, generatedAt: new Date().toISOString() });
    mocks.runScheduledEmailDigest.mockResolvedValue({ scanned: 0, sent: 0, failed: 0, skipped: 0, generatedAt: new Date().toISOString() });
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it.each([
    ["data-control", runDataJobs, mocks.runDataControlJobs],
    ["digest", runDigest, mocks.runScheduledEmailDigest],
  ])("accepts only Bearer auth for %s", async (_name, handler, service) => {
    const missing = await handler(new Request("https://app.qoovex.com/api/run?secret=cron-secret-long-enough-for-tests", {
      headers: { "x-qoovex-cron-secret": "cron-secret-long-enough-for-tests" },
    }));
    expect(missing.status).toBe(404);
    expect(service).not.toHaveBeenCalled();

    const valid = await handler(new Request("https://app.qoovex.com/api/run", {
      headers: { authorization: "Bearer cron-secret-long-enough-for-tests" },
    }));
    expect(valid.status).toBe(200);
    expect(service).toHaveBeenCalledTimes(1);
  });
});
