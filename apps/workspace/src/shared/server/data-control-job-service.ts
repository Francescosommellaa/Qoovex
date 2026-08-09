import "server-only";

import { db, Prisma } from "@qoovex/db";
import type {
  BlobOrphanCleanupResponse,
  BlobOrphanDryRunResponse,
  CreateDataExportJobResponse,
  DataControlJobListResponse,
  DataControlJobResponse,
  DataControlJobType,
  RunDataControlJobsResponse,
} from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { deletePrivateBlobs, getPrivateBlob, listPrivateBlobs, putPrivateBlob } from "./blob-storage-service";
import { requireDataControlAccess } from "./data-control-access";
import { buildDataExportForOrganization } from "./data-export-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { recordSupportAccess } from "./support-access-service";
import { canonicalize } from "./job-site-contracts";

const MAX_EXPORT_SIZE_BYTES = 50 * 1024 * 1024;
const BLOB_CLEANUP_MIN_AGE_MS = 24 * 60 * 60 * 1000;
const DEFAULT_ORPHAN_SCAN_LIMIT = 500;
const DEFAULT_CLEANUP_LIMIT = 50;
const STALE_JOB_AFTER_MS = 30 * 60 * 1000;
const MAX_JOB_ATTEMPTS = 5;
const RETRY_DELAYS_MS = [60_000, 5 * 60_000, 15 * 60_000, 60 * 60_000] as const;

const jobSelect = {
  id: true,
  organizationId: true,
  requestedById: true,
  type: true,
  status: true,
  attemptCount: true,
  nextAttemptAt: true,
  activeKey: true,
  blobKey: true,
  resultSummary: true,
  errorCode: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
} as const;

type JobRecord = {
  id: string;
  organizationId: string;
  requestedById: string;
  type: DataControlJobType;
  status: DataControlJobResponse["status"];
  attemptCount: number;
  nextAttemptAt: Date;
  activeKey: string | null;
  blobKey: string | null;
  resultSummary: unknown;
  errorCode: string | null;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
};

type JobResult = { blobKey?: string | null; resultSummary?: Record<string, unknown> };

function iso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function toJobResponse(job: JobRecord): DataControlJobResponse {
  return {
    id: job.id,
    organizationId: job.organizationId,
    requestedById: job.requestedById,
    type: job.type,
    status: job.status,
    resultSummary: job.resultSummary && typeof job.resultSummary === "object" && !Array.isArray(job.resultSummary)
      ? job.resultSummary as Record<string, unknown>
      : null,
    errorCode: job.errorCode,
    createdAt: job.createdAt.toISOString(),
    startedAt: iso(job.startedAt),
    completedAt: iso(job.completedAt),
  };
}

async function createJob(input: {
  organizationId: string;
  requestedById: string;
  type: DataControlJobType;
  activeKey?: string;
  resultSummary?: Record<string, unknown>;
}) {
  return db.dataControlJob.create({
    data: {
      organizationId: input.organizationId,
      requestedById: input.requestedById,
      type: input.type,
      activeKey: input.activeKey,
      resultSummary: input.resultSummary as Prisma.InputJsonValue | undefined,
    },
    select: jobSelect,
  });
}

export async function listDataControlJobs(): Promise<DataControlJobListResponse> {
  const { context, organizationId } = await requireDataControlAccess();
  const jobs = await db.dataControlJob.findMany({
    where: { organizationId },
    select: jobSelect,
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "data-control-jobs" });
  return { jobs: jobs.map(toJobResponse), generatedAt: new Date().toISOString() };
}

export async function createMetadataExportJob(): Promise<CreateDataExportJobResponse> {
  const { context, organizationId, actorRole } = await requireDataControlAccess();
  const job = await createJob({ organizationId, requestedById: context.userId, type: "METADATA_EXPORT" });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "data-control-job", resourceId: job.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DATA_CONTROL_JOB_CREATED",
    entityType: "DATA_CONTROL_JOB",
    entityId: job.id,
    metadata: { type: job.type },
  });
  return { job: toJobResponse(job), created: true };
}

export async function getDataExportJobBlob(jobId: string) {
  const { context, organizationId } = await requireDataControlAccess();
  const job = await db.dataControlJob.findFirst({
    where: { id: jobId, organizationId, type: "METADATA_EXPORT", status: "COMPLETED" },
    select: { id: true, blobKey: true },
  });
  if (!job?.blobKey) throw new AccessError("Export non disponibile.", 404);
  const blob = await getPrivateBlob(job.blobKey);
  if (!blob) throw new AccessError("File export non disponibile.", 404);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "data-export-job", resourceId: job.id });
  return { blob, fileName: `qoovex-export-${job.id}.json` };
}

async function collectReferencedBlobPathnames(organizationId: string) {
  const [exports, jobSiteAttachments, jobSiteExports, propertyImages, avatarUsers] = await Promise.all([
    db.dataControlJob.findMany({ where: { organizationId, blobKey: { not: null } }, select: { blobKey: true } }),
    db.jobSiteAttachment.findMany({ where: { organizationId }, select: { blobKey: true } }),
    db.jobSiteExport.findMany({ where: { organizationId, blobKey: { not: null } }, select: { blobKey: true } }),
    db.clientProperty.findMany({
      where: { imageBlobKey: { not: null }, jobSites: { some: { organizationId, archivedAt: null } } },
      select: { imageBlobKey: true },
    }),
    db.user.findMany({
      where: { organizationMemberships: { some: { organizationId, revokedAt: null } }, avatarBlobPathname: { not: null } },
      select: { avatarBlobPathname: true },
    }),
  ]);
  return new Set([
    ...exports.flatMap((item) => item.blobKey ? [item.blobKey] : []),
    ...jobSiteAttachments.map((item) => item.blobKey),
    ...jobSiteExports.flatMap((item) => item.blobKey ? [item.blobKey] : []),
    ...propertyImages.flatMap((item) => item.imageBlobKey ? [item.imageBlobKey] : []),
    ...avatarUsers.flatMap((item) => item.avatarBlobPathname ? [item.avatarBlobPathname] : []),
  ]);
}

async function scanOrganizationBlobOrphans(organizationId: string, now = new Date(), limit = DEFAULT_ORPHAN_SCAN_LIMIT) {
  const prefix = `organizations/${organizationId}/`;
  const referenced = await collectReferencedBlobPathnames(organizationId);
  const listed: Awaited<ReturnType<typeof listPrivateBlobs>>["blobs"] = [];
  const seenCursors = new Set<string>();
  let cursor: string | undefined;
  do {
    const page = await listPrivateBlobs({ prefix, limit, cursor });
    listed.push(...page.blobs);
    if (!page.hasMore) break;
    if (!page.cursor || seenCursors.has(page.cursor)) throw new Error("BLOB_LIST_CURSOR_MISSING");
    seenCursors.add(page.cursor);
    cursor = page.cursor;
  } while (true);
  const orphans = listed.filter((blob) => blob.pathname.startsWith(prefix) && !referenced.has(blob.pathname));
  const deletable = orphans.filter((blob) => blob.uploadedAt && now.getTime() - blob.uploadedAt.getTime() >= BLOB_CLEANUP_MIN_AGE_MS);
  return { listed, referenced, orphans, deletable };
}

export async function getBlobOrphanDryRun(): Promise<BlobOrphanDryRunResponse> {
  const { context, organizationId } = await requireDataControlAccess();
  const scan = await scanOrganizationBlobOrphans(organizationId);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "blob-orphans" });
  return {
    scanned: scan.listed.length,
    referenced: scan.referenced.size,
    orphanCount: scan.orphans.length,
    deletableCount: scan.deletable.length,
    generatedAt: new Date().toISOString(),
  };
}

export async function createBlobOrphanCleanupJob(): Promise<BlobOrphanCleanupResponse> {
  const { context, organizationId, actorRole } = await requireDataControlAccess();
  const dryRun = await scanOrganizationBlobOrphans(organizationId);
  const job = await createJob({
    organizationId,
    requestedById: context.userId,
    type: "ORPHAN_BLOB_CLEANUP",
    resultSummary: { orphanCount: dryRun.orphans.length, deletableCount: dryRun.deletable.length, limit: DEFAULT_CLEANUP_LIMIT },
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DATA_CONTROL_JOB_CREATED",
    entityType: "DATA_CONTROL_JOB",
    entityId: job.id,
    metadata: { type: job.type },
  });
  return { job: toJobResponse(job), created: true };
}

async function claimNextJob(now = new Date()): Promise<JobRecord | null> {
  const staleBefore = new Date(now.getTime() - STALE_JOB_AFTER_MS);
  const claimable = {
    OR: [
      { status: "PENDING" as const, nextAttemptAt: { lte: now } },
      { status: "RUNNING" as const, OR: [{ startedAt: null }, { startedAt: { lte: staleBefore } }] },
    ],
  };
  const candidates = await db.dataControlJob.findMany({
    where: claimable,
    select: { id: true },
    orderBy: [{ nextAttemptAt: "asc" }, { createdAt: "asc" }],
    take: 5,
  });

  for (const candidate of candidates) {
    const claimed = await db.dataControlJob.updateMany({
      where: { id: candidate.id, ...claimable },
      data: {
        status: "RUNNING",
        startedAt: now,
        completedAt: null,
        errorCode: null,
        attemptCount: { increment: 1 },
      },
    });
    if (claimed.count !== 1) continue;
    return db.dataControlJob.findUnique({ where: { id: candidate.id }, select: jobSelect });
  }
  return null;
}

async function completeJob(job: JobRecord, data: JobResult) {
  if (!job.startedAt) return false;
  const completed = await db.dataControlJob.updateMany({
    where: { id: job.id, status: "RUNNING", startedAt: job.startedAt },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      errorCode: null,
      blobKey: data.blobKey,
      resultSummary: data.resultSummary as Prisma.InputJsonValue | undefined,
    },
  });
  return completed.count === 1;
}

async function retryOrFailJob(job: JobRecord) {
  if (!job.startedAt) return false;
  const terminal = job.attemptCount >= MAX_JOB_ATTEMPTS;
  const delayIndex = Math.min(Math.max(job.attemptCount - 1, 0), RETRY_DELAYS_MS.length - 1);
  const errorCode = `${job.type}_FAILED`;
  const transitioned = await db.dataControlJob.updateMany({
    where: { id: job.id, status: "RUNNING", startedAt: job.startedAt },
    data: terminal
      ? { status: "FAILED", completedAt: new Date(), errorCode, activeKey: null }
      : {
          status: "PENDING",
          startedAt: null,
          completedAt: null,
          nextAttemptAt: new Date(Date.now() + RETRY_DELAYS_MS[delayIndex]),
          errorCode,
        },
  });
  return transitioned.count === 1;
}

async function runMetadataExportJob(job: JobRecord): Promise<JobResult> {
  const exportPayload = await buildDataExportForOrganization(job.organizationId);
  const body = Buffer.from(JSON.stringify(canonicalize(exportPayload), null, 2), "utf8");
  const blobKey = `organizations/${job.organizationId}/exports/${job.id}/metadata.json`;
  await putPrivateBlob({
    pathname: blobKey,
    body,
    contentType: "application/json",
    maximumSizeInBytes: MAX_EXPORT_SIZE_BYTES,
    allowOverwrite: true,
  });
  return { blobKey, resultSummary: { byteLength: body.byteLength, exportedAt: exportPayload.exportedAt } };
}

async function runOrphanBlobCleanupJob(job: JobRecord): Promise<JobResult> {
  const scan = await scanOrganizationBlobOrphans(job.organizationId);
  const targets = scan.deletable.slice(0, DEFAULT_CLEANUP_LIMIT);
  await deletePrivateBlobs(targets.map((blob) => blob.pathname));
  return {
    resultSummary: {
      scanned: scan.listed.length,
      orphanCount: scan.orphans.length,
      deleted: targets.length,
      limit: DEFAULT_CLEANUP_LIMIT,
    },
  };
}

async function executeJob(job: JobRecord): Promise<JobResult> {
  if (job.type === "METADATA_EXPORT") return runMetadataExportJob(job);
  if (job.type === "ORPHAN_BLOB_CLEANUP") return runOrphanBlobCleanupJob(job);
  throw new Error("UNSUPPORTED_DATA_CONTROL_JOB");
}

export async function runDataControlJobs(): Promise<RunDataControlJobsResponse> {
  const runningJob = await claimNextJob();
  const result = { scanned: runningJob ? 1 : 0, completed: 0, failed: 0, skipped: 0 };
  if (!runningJob) return { ...result, generatedAt: new Date().toISOString() };

  try {
    const jobResult = await executeJob(runningJob);
    if (!(await completeJob(runningJob, jobResult))) {
      result.skipped += 1;
      return { ...result, generatedAt: new Date().toISOString() };
    }
    await recordProductAuditEventBestEffort({
        organizationId: runningJob.organizationId,
        actorUserId: runningJob.requestedById,
        action: runningJob.type === "ORPHAN_BLOB_CLEANUP" ? "ORPHAN_BLOB_CLEANUP_RUN" : "DATA_CONTROL_JOB_RUN",
        entityType: "DATA_CONTROL_JOB",
        entityId: runningJob.id,
        outcome: "SUCCESS",
        metadata: { type: runningJob.type },
    });
    result.completed += 1;
  } catch {
    if (!(await retryOrFailJob(runningJob))) {
      result.skipped += 1;
      return { ...result, generatedAt: new Date().toISOString() };
    }
    await recordProductAuditEventBestEffort({
        organizationId: runningJob.organizationId,
        actorUserId: runningJob.requestedById,
        action: "DATA_CONTROL_JOB_RUN",
        entityType: "DATA_CONTROL_JOB",
        entityId: runningJob.id,
        outcome: "FAILED",
        metadata: { type: runningJob.type },
    });
    result.failed += 1;
  }

  return { ...result, generatedAt: new Date().toISOString() };
}
