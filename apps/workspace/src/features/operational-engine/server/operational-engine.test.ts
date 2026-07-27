import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    operationalStep: { findMany: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn() },
    operationalProcess: { updateMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: mocks.db, Prisma: { TransactionIsolationLevel: { Serializable: "Serializable" } } }));
vi.mock("@shared/server/reminder-service", () => ({ syncOrganizationReminderRecords: vi.fn() }));
vi.mock("./operational-process-service", () => ({ captureRequirementSnapshots: vi.fn(), enqueueOperationalProcess: vi.fn() }));

import { claimNextOperationalStep, finalizeClaimedOperationalStep, retryOrFailClaimedOperationalStep } from "./operational-engine";

const now = new Date("2026-07-26T12:00:00.000Z");
const claimedStep = {
  id: "step-1", organizationId: "org-1", processId: "process-1", key: "capture-context", position: 0,
  status: "RUNNING", attemptCount: 1, maxAttempts: 5, nextAttemptAt: now, claimToken: "claim-1",
  claimedAt: now, leaseExpiresAt: new Date(now.getTime() + 300_000), lastErrorCode: null, input: null, resultSummary: null,
  startedAt: now, completedAt: null, createdAt: now, updatedAt: now,
  process: { id: "process-1", organizationId: "org-1", type: "WORKER_CREATED", status: "RUNNING", startedAt: now, artifactRefs: [] },
};

beforeEach(() => {
  for (const model of [mocks.db.operationalStep, mocks.db.operationalProcess]) for (const method of Object.values(model)) method.mockReset();
  mocks.db.$transaction.mockReset();
});

describe("operational runner concurrency", () => {
  it("claims atomically and uses a five minute lease", async () => {
    mocks.db.operationalStep.findMany.mockResolvedValue([{ id: "step-1" }]);
    mocks.db.operationalStep.updateMany.mockResolvedValue({ count: 1 });
    mocks.db.operationalStep.findUnique.mockResolvedValue(claimedStep);
    mocks.db.operationalProcess.updateMany.mockResolvedValue({ count: 1 });

    await expect(claimNextOperationalStep(now)).resolves.toEqual(claimedStep);
    expect(mocks.db.operationalStep.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ leaseExpiresAt: new Date(now.getTime() + 300_000), attemptCount: { increment: 1 } }) }));
  });

  it("skips a candidate lost to a concurrent claimant", async () => {
    mocks.db.operationalStep.findMany.mockResolvedValue([{ id: "step-1" }]);
    mocks.db.operationalStep.updateMany.mockResolvedValue({ count: 0 });
    await expect(claimNextOperationalStep(now)).resolves.toBeNull();
    expect(mocks.db.operationalStep.findUnique).not.toHaveBeenCalled();
  });

  it("fences completion when the claim token no longer owns the step", async () => {
    const tx = { operationalStep: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) } };
    mocks.db.$transaction.mockImplementation(async (callback) => callback(tx));
    await expect(finalizeClaimedOperationalStep(claimedStep as never, { summary: "done" })).resolves.toBe("FENCED");
    expect(tx.operationalStep.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ claimToken: "claim-1" }) }));
  });

  it("schedules the existing one minute first backoff without exceeding five attempts", async () => {
    const tx = {
      operationalStep: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      operationalProcess: { update: vi.fn().mockResolvedValue({}) },
      operationalEvent: { createMany: vi.fn().mockResolvedValue({ count: 1 }) },
    };
    mocks.db.$transaction.mockImplementation(async (callback) => callback(tx));
    vi.useFakeTimers();
    vi.setSystemTime(now);
    await expect(retryOrFailClaimedOperationalStep(claimedStep as never, new Error("DB_TEMPORARY"))).resolves.toBe("RETRY");
    expect(tx.operationalStep.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "RETRY_SCHEDULED", nextAttemptAt: new Date(now.getTime() + 60_000) }) }));
    vi.useRealTimers();
  });
});
