import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  class PrismaClientKnownRequestError extends Error {
    code: string;
    constructor(code: string) {
      super(code);
      this.code = code;
    }
  }
  return {
    PrismaClientKnownRequestError,
    db: {
      dataControlJob: {
        create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), updateMany: vi.fn(),
      },
      organization: { findUnique: vi.fn(), deleteMany: vi.fn() },
      documentVersion: { findMany: vi.fn() },
      evidence: { findMany: vi.fn() },
      user: { findMany: vi.fn() },
    },
    requireDataControlAccess: vi.fn(),
    buildDataExportForOrganization: vi.fn(),
    listPrivateBlobs: vi.fn(),
    putPrivateBlob: vi.fn(),
    getPrivateBlob: vi.fn(),
    deletePrivateBlobs: vi.fn(),
    recordSupportAccess: vi.fn(),
    recordProductAuditEventBestEffort: vi.fn(),
  };
});

vi.mock("server-only", () => ({}));
vi.mock("@shared/server/access-errors", () => ({
  AccessError: class AccessError extends Error {
    constructor(message: string, public readonly status: number) {
      super(message);
    }
  },
}));
vi.mock("@qoovex/db", () => ({
  db: mocks.db,
  Prisma: { PrismaClientKnownRequestError: mocks.PrismaClientKnownRequestError },
}));
vi.mock("./data-control-access", () => ({ requireDataControlAccess: mocks.requireDataControlAccess }));
vi.mock("./data-export-service", () => ({ buildDataExportForOrganization: mocks.buildDataExportForOrganization }));
vi.mock("./blob-storage-service", () => ({
  listPrivateBlobs: mocks.listPrivateBlobs,
  putPrivateBlob: mocks.putPrivateBlob,
  getPrivateBlob: mocks.getPrivateBlob,
  deletePrivateBlobs: mocks.deletePrivateBlobs,
}));
vi.mock("./support-access-service", () => ({ recordSupportAccess: mocks.recordSupportAccess }));
vi.mock("./product-audit-service", () => ({
  auditActorFromContext: vi.fn(() => ({ actorUserId: "user-1", actorRole: "OWNER", supportSessionId: null })),
  recordProductAuditEventBestEffort: mocks.recordProductAuditEventBestEffort,
}));

import {
  createOrganizationDeletionJob,
  getBlobOrphanDryRun,
  runDataControlJobs,
} from "./data-control-job-service";

const now = new Date("2026-07-12T10:00:00.000Z");

function job(type: "METADATA_EXPORT" | "ORGANIZATION_DELETE" | "ORPHAN_BLOB_CLEANUP" = "METADATA_EXPORT") {
  return {
    id: `job-${type}`,
    organizationId: "org-1",
    requestedById: "user-1",
    type,
    status: "RUNNING" as const,
    attemptCount: 1,
    nextAttemptAt: now,
    activeKey: type === "ORGANIZATION_DELETE" ? "organization-delete:org-1" : null,
    blobKey: null,
    resultSummary: null,
    errorCode: null,
    createdAt: now,
    startedAt: now,
    completedAt: null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireDataControlAccess.mockResolvedValue({
    context: { userId: "user-1" }, organizationId: "org-1", actorRole: "OWNER",
  });
  mocks.recordSupportAccess.mockResolvedValue(undefined);
  mocks.recordProductAuditEventBestEffort.mockResolvedValue(undefined);
  mocks.db.organization.findUnique.mockResolvedValue({ code: "QVX-1" });
  mocks.db.organization.deleteMany.mockResolvedValue({ count: 1 });
  mocks.db.documentVersion.findMany.mockResolvedValue([]);
  mocks.db.evidence.findMany.mockResolvedValue([]);
  mocks.db.user.findMany.mockResolvedValue([]);
  mocks.listPrivateBlobs.mockResolvedValue({ cursor: undefined, hasMore: false, blobs: [] });
  mocks.putPrivateBlob.mockResolvedValue({ pathname: "organizations/org-1/exports/job-METADATA_EXPORT/metadata.json" });
  mocks.deletePrivateBlobs.mockResolvedValue(undefined);
  mocks.buildDataExportForOrganization.mockResolvedValue({ exportedAt: now.toISOString(), organization: { id: "org-1" } });
});

describe("data-control job service", () => {
  it("redacts every Blob pathname from the orphan DTO", async () => {
    mocks.db.dataControlJob.findMany.mockResolvedValue([]);
    mocks.listPrivateBlobs.mockResolvedValue({
      cursor: undefined,
      hasMore: false,
      blobs: [{ pathname: "organizations/org-1/private.pdf", size: 10, uploadedAt: new Date(0) }],
    });

    const response = await getBlobOrphanDryRun();

    expect(response).toEqual(expect.objectContaining({ scanned: 1, orphanCount: 1, deletableCount: 1 }));
    expect(JSON.stringify(response)).not.toMatch(/blobKey|pathname|organizations\//i);
  });

  it("returns the existing deletion job when the active key races", async () => {
    const existing = job("ORGANIZATION_DELETE");
    mocks.db.dataControlJob.create.mockRejectedValue(new mocks.PrismaClientKnownRequestError("P2002"));
    mocks.db.dataControlJob.findUnique.mockResolvedValue(existing);

    const response = await createOrganizationDeletionJob({ organizationCode: "QVX-1", confirmation: "ELIMINA DEFINITIVAMENTE" });

    expect(response.created).toBe(false);
    expect(response.job.id).toBe(existing.id);
    expect(JSON.stringify(response)).not.toContain("blobKey");
  });

  it("claims a pending export once across concurrent runners and overwrites its deterministic Blob", async () => {
    const running = job("METADATA_EXPORT");
    mocks.db.dataControlJob.findMany.mockResolvedValue([{ id: running.id }]);
    mocks.db.dataControlJob.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValueOnce({ count: 1 });
    mocks.db.dataControlJob.findUnique.mockResolvedValue(running);

    const results = await Promise.all([runDataControlJobs(), runDataControlJobs()]);

    expect(results.reduce((sum, result) => sum + result.completed, 0)).toBe(1);
    expect(results.reduce((sum, result) => sum + result.scanned, 0)).toBe(1);
    expect(mocks.putPrivateBlob).toHaveBeenCalledTimes(1);
    expect(mocks.putPrivateBlob).toHaveBeenCalledWith(expect.objectContaining({ allowOverwrite: true }));
    expect(mocks.db.dataControlJob.updateMany.mock.calls[2][0].where).toMatchObject({
      id: running.id, status: "RUNNING", startedAt: now,
    });
  });

  it("deletes the organization before draining Blob pages and accepts an already missing organization", async () => {
    const running = job("ORGANIZATION_DELETE");
    mocks.db.dataControlJob.findMany.mockResolvedValue([{ id: running.id }]);
    mocks.db.dataControlJob.updateMany.mockResolvedValue({ count: 1 });
    mocks.db.dataControlJob.findUnique.mockResolvedValue(running);
    mocks.db.organization.deleteMany.mockResolvedValue({ count: 0 });
    mocks.listPrivateBlobs
      .mockResolvedValueOnce({ cursor: undefined, hasMore: true, blobs: [{ pathname: "organizations/org-1/a.pdf" }] })
      .mockResolvedValueOnce({ cursor: undefined, hasMore: false, blobs: [] });

    await expect(runDataControlJobs()).resolves.toMatchObject({ completed: 1 });

    expect(mocks.db.organization.deleteMany).toHaveBeenCalledWith({ where: { id: "org-1" } });
    expect(mocks.deletePrivateBlobs).toHaveBeenCalledWith(["organizations/org-1/a.pdf"]);
    expect(mocks.db.organization.deleteMany.mock.invocationCallOrder[0]).toBeLessThan(mocks.deletePrivateBlobs.mock.invocationCallOrder[0]);
    expect(mocks.recordProductAuditEventBestEffort).not.toHaveBeenCalled();
  });

  it("does not delete Blob when the database deletion fails and requeues with a safe code", async () => {
    const running = job("ORGANIZATION_DELETE");
    mocks.db.dataControlJob.findMany.mockResolvedValue([{ id: running.id }]);
    mocks.db.dataControlJob.updateMany.mockResolvedValue({ count: 1 });
    mocks.db.dataControlJob.findUnique.mockResolvedValue(running);
    mocks.db.organization.deleteMany.mockRejectedValue(new Error("database details must not leak"));

    await expect(runDataControlJobs()).resolves.toMatchObject({ failed: 1, completed: 0 });

    expect(mocks.deletePrivateBlobs).not.toHaveBeenCalled();
    const retry = mocks.db.dataControlJob.updateMany.mock.calls[1][0];
    expect(retry.data).toMatchObject({ status: "PENDING", errorCode: "ORGANIZATION_DELETE_FAILED" });
    expect(JSON.stringify(retry.data)).not.toContain("database details");
  });

  it("requeues a deletion when Blob cleanup fails after the database commit", async () => {
    const running = job("ORGANIZATION_DELETE");
    mocks.db.dataControlJob.findMany.mockResolvedValue([{ id: running.id }]);
    mocks.db.dataControlJob.updateMany.mockResolvedValue({ count: 1 });
    mocks.db.dataControlJob.findUnique.mockResolvedValue(running);
    mocks.listPrivateBlobs.mockResolvedValue({
      cursor: undefined,
      hasMore: false,
      blobs: [{ pathname: "organizations/org-1/a.pdf" }],
    });
    mocks.deletePrivateBlobs.mockRejectedValue(new Error("storage provider detail"));

    await expect(runDataControlJobs()).resolves.toMatchObject({ failed: 1, completed: 0 });

    expect(mocks.db.organization.deleteMany).toHaveBeenCalledTimes(1);
    const retry = mocks.db.dataControlJob.updateMany.mock.calls[1][0];
    expect(retry.data).toMatchObject({ status: "PENDING", errorCode: "ORGANIZATION_DELETE_FAILED" });
    expect(JSON.stringify(retry.data)).not.toContain("storage provider detail");
  });

  it("does not let a worker complete after losing its fencing token", async () => {
    const running = job("METADATA_EXPORT");
    mocks.db.dataControlJob.findMany.mockResolvedValue([{ id: running.id }]);
    mocks.db.dataControlJob.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    mocks.db.dataControlJob.findUnique.mockResolvedValue(running);

    await expect(runDataControlJobs()).resolves.toMatchObject({ completed: 0, skipped: 1 });

    expect(mocks.db.dataControlJob.updateMany.mock.calls[1][0].where).toMatchObject({
      id: running.id,
      status: "RUNNING",
      startedAt: now,
    });
    expect(mocks.recordProductAuditEventBestEffort).not.toHaveBeenCalled();
  });
});
