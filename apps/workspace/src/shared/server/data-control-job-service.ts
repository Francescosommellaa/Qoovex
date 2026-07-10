import "server-only";

import { db, Prisma } from "@qoovex/db";
import type {
  BlobOrphanCandidate,
  BlobOrphanCleanupResponse,
  BlobOrphanDryRunResponse,
  CreateDataExportJobResponse,
  CreateOrganizationDeletionJobInput,
  CreateOrganizationDeletionJobResponse,
  DataControlJobResponse,
  DataControlJobType,
  DataControlJobListResponse,
  RunDataControlJobsResponse,
} from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { deletePrivateBlob, getPrivateBlob, listPrivateBlobs, putPrivateBlob } from "./blob-storage-service";
import { requireDataControlAccess } from "./data-control-access";
import { buildDataExportForOrganization } from "./data-export-service";
import { trimRequiredText } from "./document-domain-validation";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { recordSupportAccess } from "./support-access-service";

const MAX_EXPORT_SIZE_BYTES = 50 * 1024 * 1024;
const BLOB_CLEANUP_MIN_AGE_MS = 24 * 60 * 60 * 1000;
const DEFAULT_ORPHAN_SCAN_LIMIT = 500;
const DEFAULT_CLEANUP_LIMIT = 50;
const DELETE_CONFIRMATION = "ELIMINA DEFINITIVAMENTE";

const jobSelect = {
  id: true,
  organizationId: true,
  requestedById: true,
  type: true,
  status: true,
  blobKey: true,
  resultSummary: true,
  errorCode: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
} as const;

function iso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function toJobResponse(job: {
  id: string;
  organizationId: string;
  requestedById: string;
  type: DataControlJobType;
  status: DataControlJobResponse["status"];
  blobKey: string | null;
  resultSummary: unknown;
  errorCode: string | null;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}): DataControlJobResponse {
  return {
    id: job.id,
    organizationId: job.organizationId,
    requestedById: job.requestedById,
    type: job.type,
    status: job.status,
    blobKey: job.blobKey,
    resultSummary: job.resultSummary && typeof job.resultSummary === "object" && !Array.isArray(job.resultSummary) ? job.resultSummary as Record<string, unknown> : null,
    errorCode: job.errorCode,
    createdAt: job.createdAt.toISOString(),
    startedAt: iso(job.startedAt),
    completedAt: iso(job.completedAt),
  };
}

async function createJob(input: { organizationId: string; requestedById: string; type: DataControlJobType; resultSummary?: Record<string, unknown> }) {
  return db.dataControlJob.create({
    data: {
      organizationId: input.organizationId,
      requestedById: input.requestedById,
      type: input.type,
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
  const [versions, evidence, exports, avatarUsers] = await Promise.all([
    db.documentVersion.findMany({ where: { organizationId }, select: { blobKey: true } }),
    db.evidence.findMany({ where: { organizationId, blobKey: { not: null } }, select: { blobKey: true } }),
    db.dataControlJob.findMany({ where: { organizationId, blobKey: { not: null } }, select: { blobKey: true } }),
    db.user.findMany({
      where: { organizationMemberships: { some: { organizationId, revokedAt: null } }, avatarBlobPathname: { not: null } },
      select: { avatarBlobPathname: true },
    }),
  ]);
  return new Set([
    ...versions.map((item) => item.blobKey),
    ...evidence.flatMap((item) => item.blobKey ? [item.blobKey] : []),
    ...exports.flatMap((item) => item.blobKey ? [item.blobKey] : []),
    ...avatarUsers.flatMap((item) => item.avatarBlobPathname ? [item.avatarBlobPathname] : []),
  ]);
}

async function scanOrganizationBlobOrphans(organizationId: string, now = new Date(), limit = DEFAULT_ORPHAN_SCAN_LIMIT) {
  const prefix = `organizations/${organizationId}/`;
  const referenced = await collectReferencedBlobPathnames(organizationId);
  const listed = await listPrivateBlobs({ prefix, limit });
  const orphans = listed.blobs.filter((blob) => blob.pathname.startsWith(prefix) && !referenced.has(blob.pathname));
  const deletable = orphans.filter((blob) => {
    if (!blob.uploadedAt) return false;
    return now.getTime() - blob.uploadedAt.getTime() >= BLOB_CLEANUP_MIN_AGE_MS;
  });
  return { prefix, listed: listed.blobs, referenced, orphans, deletable };
}

function toCandidate(blob: { pathname: string; size?: number | null; uploadedAt?: Date | null }): BlobOrphanCandidate {
  return { pathname: blob.pathname, size: blob.size ?? null, uploadedAt: iso(blob.uploadedAt) };
}

export async function getBlobOrphanDryRun(): Promise<BlobOrphanDryRunResponse> {
  const { context, organizationId } = await requireDataControlAccess();
  const scan = await scanOrganizationBlobOrphans(organizationId);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "blob-orphans" });
  return {
    prefix: scan.prefix,
    scanned: scan.listed.length,
    referenced: scan.referenced.size,
    orphanCount: scan.orphans.length,
    deletableCount: scan.deletable.length,
    sample: scan.orphans.slice(0, 20).map(toCandidate),
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

export async function createOrganizationDeletionJob(input: CreateOrganizationDeletionJobInput | Record<string, unknown>): Promise<CreateOrganizationDeletionJobResponse> {
  const { context, organizationId, actorRole } = await requireDataControlAccess();
  const organization = await db.organization.findUnique({ where: { id: organizationId }, select: { code: true } });
  if (!organization) throw new AccessError("Azienda non trovata.", 404);
  const organizationCode = trimRequiredText(input.organizationCode, "Codice azienda", 1, 160);
  const confirmation = trimRequiredText(input.confirmation, "Conferma cancellazione", 1, 160);
  if (organizationCode !== organization.code || confirmation !== DELETE_CONFIRMATION) {
    throw new AccessError("Conferma cancellazione non valida.", 409);
  }
  const job = await createJob({ organizationId, requestedById: context.userId, type: "ORGANIZATION_DELETE", resultSummary: { organizationCode } });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "ORGANIZATION_DELETE_REQUESTED",
    entityType: "DATA_CONTROL_JOB",
    entityId: job.id,
    metadata: { type: job.type },
  });
  return { job: toJobResponse(job), created: true };
}

async function markJobRunning(jobId: string) {
  return db.dataControlJob.update({
    where: { id: jobId },
    data: { status: "RUNNING", startedAt: new Date(), errorCode: null },
    select: jobSelect,
  });
}

async function completeJob(jobId: string, data: { blobKey?: string | null; resultSummary?: Record<string, unknown> }) {
  return db.dataControlJob.update({
    where: { id: jobId },
    data: { status: "COMPLETED", completedAt: new Date(), blobKey: data.blobKey, resultSummary: data.resultSummary as Prisma.InputJsonValue | undefined },
    select: jobSelect,
  });
}

async function failJob(jobId: string, errorCode: string) {
  return db.dataControlJob.update({
    where: { id: jobId },
    data: { status: "FAILED", completedAt: new Date(), errorCode },
    select: jobSelect,
  });
}

async function runMetadataExportJob(job: DataControlJobResponse) {
  const exportPayload = await buildDataExportForOrganization(job.organizationId);
  const body = Buffer.from(JSON.stringify(exportPayload, null, 2), "utf8");
  const blobKey = `organizations/${job.organizationId}/exports/${job.id}/metadata.json`;
  await putPrivateBlob({ pathname: blobKey, body, contentType: "application/json", maximumSizeInBytes: MAX_EXPORT_SIZE_BYTES });
  return completeJob(job.id, { blobKey, resultSummary: { byteLength: body.byteLength, exportedAt: exportPayload.exportedAt } });
}

async function runOrphanBlobCleanupJob(job: DataControlJobResponse) {
  const scan = await scanOrganizationBlobOrphans(job.organizationId);
  const targets = scan.deletable.slice(0, DEFAULT_CLEANUP_LIMIT);
  for (const blob of targets) {
    await deletePrivateBlob(blob.pathname);
  }
  return completeJob(job.id, {
    resultSummary: {
      scanned: scan.listed.length,
      orphanCount: scan.orphans.length,
      deleted: targets.length,
      limit: DEFAULT_CLEANUP_LIMIT,
    },
  });
}

async function runOrganizationDeleteJob(job: DataControlJobResponse) {
  const prefix = `organizations/${job.organizationId}/`;
  let cursor: string | undefined;
  let deletedBlobs = 0;
  do {
    const page = await listPrivateBlobs({ prefix, limit: 100, cursor });
    for (const blob of page.blobs) {
      if (blob.pathname.startsWith(prefix)) {
        await deletePrivateBlob(blob.pathname);
        deletedBlobs += 1;
      }
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  await db.organization.delete({ where: { id: job.organizationId } });
  return completeJob(job.id, { resultSummary: { deletedBlobs, organizationDeleted: true } });
}

export async function runDataControlJobs(): Promise<RunDataControlJobsResponse> {
  const pending = await db.dataControlJob.findMany({
    where: { status: "PENDING" },
    select: jobSelect,
    orderBy: { createdAt: "asc" },
    take: 1,
  });
  const result = { scanned: pending.length, completed: 0, failed: 0, skipped: 0 };
  for (const pendingJob of pending) {
    const runningJob = toJobResponse(await markJobRunning(pendingJob.id));
    try {
      if (runningJob.type === "METADATA_EXPORT") await runMetadataExportJob(runningJob);
      else if (runningJob.type === "ORPHAN_BLOB_CLEANUP") await runOrphanBlobCleanupJob(runningJob);
      else if (runningJob.type === "ORGANIZATION_DELETE") await runOrganizationDeleteJob(runningJob);
      else {
        result.skipped += 1;
        continue;
      }
      await recordProductAuditEventBestEffort({
        organizationId: runningJob.organizationId,
        actorUserId: runningJob.requestedById,
        action: runningJob.type === "ORPHAN_BLOB_CLEANUP" ? "ORPHAN_BLOB_CLEANUP_RUN" : runningJob.type === "ORGANIZATION_DELETE" ? "ORGANIZATION_DELETE_RUN" : "DATA_CONTROL_JOB_RUN",
        entityType: "DATA_CONTROL_JOB",
        entityId: runningJob.id,
        outcome: "SUCCESS",
        metadata: { type: runningJob.type },
      });
      result.completed += 1;
    } catch (error) {
      await failJob(runningJob.id, error instanceof Error ? error.name : "DATA_CONTROL_JOB_ERROR");
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
  }
  return { ...result, generatedAt: new Date().toISOString() };
}
