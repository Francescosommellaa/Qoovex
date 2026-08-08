import "server-only";

import { randomUUID } from "node:crypto";
import { db, Prisma } from "@qoovex/db";
import { fingerprintPayload } from "./job-site-contracts";
import { JOB_SITE_PROCESS_DEFINITIONS, type JobSiteProcessDefinition } from "./job-site-registry";
import { runSerializableTransaction } from "./serializable-transaction";

const LEASE_MS = 60_000;
const MAX_RUN_BATCH = 10;

export async function enqueueJobSiteProcess(input: {
  organizationId: string;
  jobSiteId: string;
  definitionKey: JobSiteProcessDefinition;
  businessKey: string;
  payload: Record<string, unknown>;
}) {
  const activeKey = `${input.jobSiteId}:${input.definitionKey}:${input.businessKey}`;
  const definition = JOB_SITE_PROCESS_DEFINITIONS[input.definitionKey];
  return db.jobSiteProcess.upsert({
    where: { activeKey },
    create: {
      organizationId: input.organizationId,
      jobSiteId: input.jobSiteId,
      definitionKey: input.definitionKey,
      activeKey,
      input: input.payload as Prisma.InputJsonValue,
      inputFingerprint: fingerprintPayload(input.payload),
      steps: { create: definition.map((key, ordinal) => ({ key, ordinal })) },
      events: { create: { sequence: 1, type: "ENQUEUED", payload: { definitionKey: input.definitionKey } } },
    },
    update: {},
    select: { id: true, status: true, definitionKey: true },
  });
}

async function claimOne(workerId: string) {
  const now = new Date();
  const staleLease = { lt: now };
  const candidate = await db.jobSiteProcess.findFirst({
    where: {
      status: { in: ["PENDING", "WAITING", "RUNNING"] },
      nextAttemptAt: { lte: now },
      OR: [{ status: { in: ["PENDING", "WAITING"] } }, { status: "RUNNING", leaseExpiresAt: staleLease }],
    },
    orderBy: [{ nextAttemptAt: "asc" }, { createdAt: "asc" }],
    select: { id: true, status: true, fencingToken: true, attemptCount: true, maxAttempts: true },
  });
  if (!candidate || candidate.attemptCount >= candidate.maxAttempts) return null;
  const claimed = await db.jobSiteProcess.updateMany({
    where: {
      id: candidate.id,
      status: candidate.status,
      fencingToken: candidate.fencingToken,
      ...(candidate.status === "RUNNING" ? { leaseExpiresAt: staleLease } : {}),
    },
    data: {
      status: "RUNNING",
      claimedBy: workerId,
      leaseExpiresAt: new Date(now.getTime() + LEASE_MS),
      fencingToken: { increment: 1 },
      attemptCount: { increment: 1 },
    },
  });
  if (claimed.count !== 1) return null;
  return db.jobSiteProcess.findUnique({
    where: { id: candidate.id },
    select: { id: true, organizationId: true, jobSiteId: true, definitionKey: true, input: true, fencingToken: true, claimedBy: true, maxAttempts: true, steps: { orderBy: { ordinal: "asc" } }, _count: { select: { events: true } } },
  });
}

async function executeProcessEffect(process: NonNullable<Awaited<ReturnType<typeof claimOne>>>) {
  if (process.definitionKey !== "JOB_SITE_EXPORT@1") return;
  const input = process.input && typeof process.input === "object" && !Array.isArray(process.input)
    ? process.input as Record<string, unknown>
    : {};
  const exportId = typeof input.exportId === "string" ? input.exportId : null;
  if (!exportId) throw new Error("JOB_SITE_EXPORT_INPUT_INVALID");
  const { generateJobSiteExport } = await import("./job-site-export-service");
  await generateJobSiteExport(exportId);
}

async function failClaimedProcess(process: NonNullable<Awaited<ReturnType<typeof claimOne>>>, workerId: string, error: unknown) {
  const retry = await db.jobSiteProcess.findUnique({ where: { id: process.id }, select: { attemptCount: true, _count: { select: { events: true } } } });
  const terminal = (retry?.attemptCount ?? process.maxAttempts) >= process.maxAttempts;
  await db.jobSiteProcess.updateMany({
    where: { id: process.id, status: "RUNNING", claimedBy: workerId, fencingToken: process.fencingToken },
    data: {
      status: terminal ? "FAILED" : "WAITING",
      activeKey: terminal ? null : undefined,
      nextAttemptAt: new Date(Date.now() + 30_000),
      claimedBy: null,
      leaseExpiresAt: null,
    },
  });
  await db.jobSiteProcessStep.updateMany({
    where: { processId: process.id, status: { in: ["PENDING", "RUNNING"] } },
    data: { status: terminal ? "FAILED" : "PENDING", errorCode: error instanceof Error ? error.message.slice(0, 120) : "PROCESS_FAILED" },
  });
  if (retry) await db.jobSiteProcessEvent.create({ data: { processId: process.id, sequence: retry._count.events + 1, type: terminal ? "FAILED" : "RETRY_SCHEDULED", fencingToken: process.fencingToken, payload: { errorCode: error instanceof Error ? error.message.slice(0, 120) : "PROCESS_FAILED" } } });
}

async function finishClaimedProcess(process: NonNullable<Awaited<ReturnType<typeof claimOne>>>, workerId: string) {
  return runSerializableTransaction(async (tx) => {
    const current = await tx.jobSiteProcess.findFirst({
      where: { id: process.id, status: "RUNNING", claimedBy: workerId, fencingToken: process.fencingToken, leaseExpiresAt: { gt: new Date() } },
      select: { id: true, fencingToken: true, _count: { select: { events: true } } },
    });
    if (!current) return false;
    let sequence = current._count.events;
    for (const step of process.steps) {
      if (step.status === "COMPLETED" || step.status === "SKIPPED") continue;
      await tx.jobSiteProcessStep.update({ where: { id: step.id }, data: { status: "RUNNING", attemptCount: { increment: 1 }, startedAt: new Date() } });
      sequence += 1;
      await tx.jobSiteProcessEvent.create({ data: { processId: process.id, sequence, type: "STEP_STARTED", fencingToken: current.fencingToken, payload: { stepKey: step.key } } });
      await tx.jobSiteProcessStep.update({ where: { id: step.id }, data: { status: "COMPLETED", completedAt: new Date(), output: { receipt: fingerprintPayload({ processId: process.id, stepKey: step.key, fencingToken: current.fencingToken.toString() }) } } });
      sequence += 1;
      await tx.jobSiteProcessEvent.create({ data: { processId: process.id, sequence, type: "STEP_COMPLETED", fencingToken: current.fencingToken, payload: { stepKey: step.key } } });
    }
    sequence += 1;
    await tx.jobSiteProcessEvent.create({ data: { processId: process.id, sequence, type: "COMPLETED", fencingToken: current.fencingToken } });
    const completed = await tx.jobSiteProcess.updateMany({
      where: { id: process.id, status: "RUNNING", claimedBy: workerId, fencingToken: current.fencingToken },
      data: { status: "COMPLETED", activeKey: null, completedAt: new Date(), claimedBy: null, leaseExpiresAt: null },
    });
    return completed.count === 1;
  });
}

export async function runJobSiteProcesses(workerId = randomUUID()) {
  let scanned = 0;
  let completed = 0;
  for (let index = 0; index < MAX_RUN_BATCH; index += 1) {
    const process = await claimOne(workerId);
    if (!process) break;
    scanned += 1;
    try {
      await db.jobSiteProcessEvent.create({ data: { processId: process.id, sequence: process._count.events + 1, type: "CLAIMED", fencingToken: process.fencingToken, payload: { workerId } } });
      await executeProcessEffect(process);
      if (await finishClaimedProcess(process, workerId)) completed += 1;
    } catch (error) {
      await failClaimedProcess(process, workerId, error);
    }
  }
  const { runJobSiteRetentionCleanup } = await import("./job-site-retention-service");
  const { runJobSiteNotificationDeliveries } = await import("./job-site-notification-service");
  const { expireChangeProposals } = await import("./job-site-collaboration-service");
  const [retention, deliveries, expiredProposals] = await Promise.all([runJobSiteRetentionCleanup(), runJobSiteNotificationDeliveries(), expireChangeProposals()]);
  return { scanned, completed, skipped: scanned - completed, retention, deliveries, expiredProposals, generatedAt: new Date().toISOString() };
}
