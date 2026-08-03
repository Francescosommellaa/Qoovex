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
      jobSiteAttachment: { findMany: vi.fn() },
      jobSiteExport: { findMany: vi.fn() },
      clientProperty: { findMany: vi.fn() },
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
  getBlobOrphanDryRun,
  runDataControlJobs,
} from "./data-control-job-service";

const now = new Date("2026-07-12T10:00:00.000Z");

function job(type: "METADATA_EXPORT" | "ORPHAN_BLOB_CLEANUP" = "METADATA_EXPORT") {
  return {
    id: `job-${type}`,
    organizationId: "org-1",
    requestedById: "user-1",
    type,
    status: "RUNNING" as const,
    attemptCount: 1,
    nextAttemptAt: now,
    activeKey: null,
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
  mocks.db.jobSiteAttachment.findMany.mockResolvedValue([]);
  mocks.db.jobSiteExport.findMany.mockResolvedValue([]);
  mocks.db.clientProperty.findMany.mockResolvedValue([]);
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

  it("scans every Blob page and finds an orphan beyond the first 500 objects", async () => {
    const referenced = Array.from({ length: 500 }, (_, index) => ({ blobKey: `organizations/org-1/referenced-${index}.pdf` }));
    mocks.db.documentVersion.findMany.mockResolvedValue(referenced);
    mocks.db.dataControlJob.findMany.mockResolvedValue([]);
    mocks.listPrivateBlobs
      .mockResolvedValueOnce({
        cursor: "page-2",
        hasMore: true,
        blobs: referenced.map(({ blobKey }) => ({ pathname: blobKey, uploadedAt: new Date(0) })),
      })
      .mockResolvedValueOnce({
        cursor: undefined,
        hasMore: false,
        blobs: [{ pathname: "organizations/org-1/orphan-501.pdf", uploadedAt: new Date(0) }],
      });

    await expect(getBlobOrphanDryRun()).resolves.toMatchObject({ scanned: 501, referenced: 500, orphanCount: 1, deletableCount: 1 });
    expect(mocks.listPrivateBlobs).toHaveBeenNthCalledWith(2, expect.objectContaining({ cursor: "page-2" }));
  });

  it("fails closed when Blob reports another page without a cursor", async () => {
    mocks.db.dataControlJob.findMany.mockResolvedValue([]);
    mocks.listPrivateBlobs.mockResolvedValue({ cursor: undefined, hasMore: true, blobs: [] });

    await expect(getBlobOrphanDryRun()).rejects.toThrow("BLOB_LIST_CURSOR_MISSING");
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
