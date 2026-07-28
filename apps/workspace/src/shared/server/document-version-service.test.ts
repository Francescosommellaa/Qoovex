import { organizationPermissions, type OrganizationAccessPreset, type OrganizationPermission, type OrganizationRole } from "@qoovex/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    $transaction: vi.fn(),
    document: { findFirst: vi.fn(), update: vi.fn() },
    documentVersion: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    workerUserLink: { findFirst: vi.fn() },
    jobSiteUserAssignment: { findMany: vi.fn() },
    jobSiteWorkerAssignment: { findMany: vi.fn() },
    organizationMembership: { findFirst: vi.fn() },
  },
  getWorkspaceAccessContext: vi.fn(),
  getContextOrganizationId: vi.fn(),
  requirePermission: vi.fn(),
  recordSupportAccess: vi.fn(),
  putPrivateBlob: vi.fn(),
  getPrivateBlob: vi.fn(),
  deletePrivateBlob: vi.fn(),
  enqueueOperationalProcess: vi.fn(),
  appendContextTimelineEvent: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: mocks.db }));
vi.mock("@shared/server/access-errors", () => ({
  AccessError: class AccessError extends Error {
    constructor(message: string, public readonly status: 401 | 403 | 404 | 409 | 410) {
      super(message);
      this.name = "AccessError";
    }
  },
}));
vi.mock("@shared/server/access-context-service", () => ({
  getWorkspaceAccessContext: mocks.getWorkspaceAccessContext,
  getContextOrganizationId: mocks.getContextOrganizationId,
  requirePermission: mocks.requirePermission,
}));
vi.mock("@shared/server/support-access-service", () => ({ recordSupportAccess: mocks.recordSupportAccess }));
vi.mock("./blob-storage-service", () => ({
  putPrivateBlob: mocks.putPrivateBlob,
  getPrivateBlob: mocks.getPrivateBlob,
  deletePrivateBlob: mocks.deletePrivateBlob,
}));
vi.mock("@shared/server/operational-process-service", () => ({ enqueueOperationalProcess: mocks.enqueueOperationalProcess }));
vi.mock("./context-timeline-service", () => ({ appendContextTimelineEvent: mocks.appendContextTimelineEvent }));

import {
  DOCUMENT_VERSION_MAX_SIZE_BYTES,
  archiveDocumentVersion,
  getDocumentVersionDownload,
  listDocumentVersions,
  listDocumentVersionsByDocumentIds,
  reviewDocumentVersion,
  uploadDocumentVersion,
} from "./document-version-service";

const now = new Date("2026-06-30T12:00:00.000Z");

const documentRecord = {
  id: "doc-1",
  organizationId: "org-1",
  status: "MISSING",
  ownerType: "WORKER",
  workerId: "worker-1",
  jobSiteId: null,
};

const versionRecord = {
  id: "version-1",
  organizationId: "org-1",
  documentId: "doc-1",
  blobKey: "organizations/org-1/documents/doc-1/versions/version-1/documento.pdf",
  originalFileName: "documento.pdf",
  mimeType: "application/pdf",
  size: 4,
  checksum: "checksum",
  uploadedById: "user-1",
  createdAt: now,
  archivedAt: null,
};

function resetModel(model: Record<string, ReturnType<typeof vi.fn>>) {
  for (const method of Object.values(model)) method.mockReset();
}

function setRole(role: OrganizationRole, preset: OrganizationAccessPreset | null = null, permissions: OrganizationPermission[] = role === "OWNER" ? [...organizationPermissions] : [], scopeMode: "FULL" | "ASSIGNED" = role === "OWNER" ? "FULL" : "ASSIGNED") {
  mocks.getWorkspaceAccessContext.mockResolvedValue({
    userId: "user-1",
    platformRole: "USER",
    company: { id: "member-1", role, preset, scopeMode, organization: { id: "org-1", name: "Azienda", code: "QVX-1" } },
    support: null,
    permissions,
  });
}

function makeFile(input: { name?: string; type?: string; bytes?: number[]; sizeBytes?: number } = {}) {
  const bytes = input.sizeBytes === undefined
    ? new Uint8Array(input.bytes ?? [0x25, 0x50, 0x44, 0x46])
    : new Uint8Array(input.sizeBytes);
  return new File([bytes], input.name ?? "documento.pdf", { type: input.type ?? "application/pdf" });
}

beforeEach(() => {
  mocks.db.$transaction.mockReset();
  resetModel(mocks.db.document);
  resetModel(mocks.db.documentVersion);
  resetModel(mocks.db.workerUserLink);
  resetModel(mocks.db.jobSiteUserAssignment);
  resetModel(mocks.db.jobSiteWorkerAssignment);
  resetModel(mocks.db.organizationMembership);
  mocks.getWorkspaceAccessContext.mockReset();
  mocks.getContextOrganizationId.mockReset();
  mocks.requirePermission.mockReset();
  mocks.recordSupportAccess.mockReset();
  mocks.putPrivateBlob.mockReset();
  mocks.getPrivateBlob.mockReset();
  mocks.deletePrivateBlob.mockReset();
  mocks.enqueueOperationalProcess.mockReset().mockResolvedValue({ id: "process-1" });
  mocks.appendContextTimelineEvent.mockReset().mockResolvedValue({ id: "timeline-1" });
  mocks.getContextOrganizationId.mockReturnValue("org-1");
  mocks.requirePermission.mockImplementation((context, permission) => { if (!context.permissions.includes(permission)) throw Object.assign(new Error("Risorsa non disponibile."), { status: 404 }); });
  mocks.recordSupportAccess.mockResolvedValue(undefined);
  mocks.putPrivateBlob.mockResolvedValue({ pathname: versionRecord.blobKey, etag: "etag", contentType: "application/pdf" });
  mocks.deletePrivateBlob.mockResolvedValue(undefined);
  mocks.db.$transaction.mockImplementation(async (callback) => callback(mocks.db));
  mocks.db.document.findFirst.mockResolvedValue(documentRecord);
  mocks.db.workerUserLink.findFirst.mockResolvedValue({ worker: { id: "worker-1", displayName: "Mario", roleLabel: null, status: "ACTIVE" } });
  mocks.db.jobSiteUserAssignment.findMany.mockResolvedValue([]);
  mocks.db.jobSiteWorkerAssignment.findMany.mockResolvedValue([]);
  mocks.db.organizationMembership.findFirst.mockResolvedValue({ id: "membership-1", resourceGrants: [] });
  mocks.db.document.update.mockResolvedValue({ id: "doc-1" });
  mocks.db.documentVersion.create.mockImplementation(async ({ data }) => ({
    ...versionRecord,
    ...data,
    createdAt: now,
    archivedAt: null,
  }));
  setRole("OWNER");
});

describe("document version service", () => {
  it("loads versions for multiple authorized documents with one Prisma operation", async () => {
    mocks.db.documentVersion.findMany.mockResolvedValue([
      versionRecord,
      { ...versionRecord, id: "version-2", documentId: "doc-2" },
    ]);

    await expect(listDocumentVersionsByDocumentIds(["doc-1", "doc-2", "doc-1"])).resolves.toHaveLength(2);
    expect(mocks.db.documentVersion.findMany).toHaveBeenCalledTimes(1);
    expect(mocks.db.documentVersion.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        organizationId: "org-1",
        documentId: { in: ["doc-1", "doc-2"] },
        document: { is: expect.objectContaining({ organizationId: "org-1", archivedAt: null }) },
      }),
    }));
    expect(mocks.db.document.findFirst).not.toHaveBeenCalled();
  });

  it("lets owners upload a private Blob and saves only metadata in Prisma", async () => {
    const version = await uploadDocumentVersion("doc-1", [makeFile()]);

    expect(mocks.requirePermission).toHaveBeenCalledWith(expect.anything(), "documents:upload");
    expect(mocks.putPrivateBlob).toHaveBeenCalledWith(expect.objectContaining({
      contentType: "application/pdf",
      maximumSizeInBytes: DOCUMENT_VERSION_MAX_SIZE_BYTES,
      pathname: expect.stringContaining("organizations/org-1/documents/doc-1/versions/"),
    }));
    expect(mocks.db.documentVersion.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        organizationId: "org-1",
        documentId: "doc-1",
        originalFileName: "documento.pdf",
        mimeType: "application/pdf",
        size: 4,
        uploadedById: "user-1",
        checksum: expect.any(String),
      }),
    }));
    expect(mocks.db.document.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "doc-1" },
      data: { status: "TO_REVIEW" },
    }));
    expect(version).not.toHaveProperty("blobKey");
    expect(version).not.toHaveProperty("url");
    expect(version).not.toHaveProperty("downloadUrl");
  });

  it("lets admins, safety consultants and linked workers upload while denying site managers", async () => {
    setRole("COLLABORATOR", "OPERATIONAL_COLLABORATION", ["documents:upload"], "FULL");
    await expect(uploadDocumentVersion("doc-1", [makeFile()])).resolves.toMatchObject({ documentId: "doc-1" });

    setRole("COLLABORATOR", "DOCUMENT_REVIEWER", ["documents:upload"], "FULL");
    await expect(uploadDocumentVersion("doc-1", [makeFile()])).resolves.toMatchObject({ documentId: "doc-1" });

    setRole("COLLABORATOR", "LIMITED_UPLOAD", ["documents:upload"]);
    await expect(uploadDocumentVersion("doc-1", [makeFile()])).resolves.toMatchObject({ documentId: "doc-1" });

    setRole("COLLABORATOR", "SITE_MANAGER", ["documents:upload"]);
    await expect(uploadDocumentVersion("doc-1", [makeFile()])).rejects.toMatchObject({ status: 404 });
  });

  it("lets safety consultants list and download versions but not archive", async () => {
    setRole("COLLABORATOR", "DOCUMENT_REVIEWER", ["documents:read", "documents:file:read"], "FULL");
    mocks.db.documentVersion.findMany.mockResolvedValue([versionRecord]);
    mocks.db.documentVersion.findFirst.mockResolvedValue(versionRecord);
    const stream = new ReadableStream<Uint8Array>();
    mocks.getPrivateBlob.mockResolvedValue({ stream, contentType: "application/pdf", size: 4 });

    await expect(listDocumentVersions("doc-1")).resolves.toEqual([expect.not.objectContaining({ blobKey: expect.any(String) })]);
    await expect(getDocumentVersionDownload("doc-1", "version-1")).resolves.toMatchObject({ stream, originalFileName: "documento.pdf" });
    await expect(archiveDocumentVersion("doc-1", "version-1")).rejects.toMatchObject({ status: 404 });
  });

  it("allows worker reads only on own document versions and denies others", async () => {
    mocks.db.documentVersion.findMany.mockResolvedValue([versionRecord]);
    mocks.db.documentVersion.findFirst.mockResolvedValue(versionRecord);
    mocks.getPrivateBlob.mockResolvedValue({ stream: new ReadableStream<Uint8Array>(), contentType: "application/pdf", size: 4 });

    setRole("COLLABORATOR", "LIMITED_UPLOAD", ["documents:read", "documents:file:read"]);
    await expect(listDocumentVersions("doc-1")).resolves.toHaveLength(1);
    await expect(getDocumentVersionDownload("doc-1", "version-1")).resolves.toMatchObject({ originalFileName: "documento.pdf" });

    setRole("COLLABORATOR", "SITE_MANAGER", ["documents:read", "documents:file:read"]);
    await expect(listDocumentVersions("doc-1")).rejects.toMatchObject({ status: 404 });
    await expect(getDocumentVersionDownload("doc-1", "version-1")).rejects.toMatchObject({ status: 404 });

    setRole("COLLABORATOR", "READ_ONLY", ["documents:read", "documents:file:read"]);
    await expect(listDocumentVersions("doc-1")).rejects.toMatchObject({ status: 404 });
  });

  it("requires file and sensitive permissions before reading version files", async () => {
    setRole("COLLABORATOR", "CUSTOM", ["documents:read"], "FULL");
    await expect(listDocumentVersions("doc-1")).rejects.toMatchObject({ status: 404 });
    await expect(getDocumentVersionDownload("doc-1", "version-1")).rejects.toMatchObject({ status: 404 });
    expect(mocks.getPrivateBlob).not.toHaveBeenCalled();

    setRole("COLLABORATOR", "CUSTOM", ["documents:read", "documents:file:read"], "FULL");
    mocks.db.document.findFirst.mockResolvedValue({ ...documentRecord, documentType: { sensitivity: "SENSITIVE" } });
    await expect(listDocumentVersions("doc-1")).rejects.toMatchObject({ status: 404 });
    await expect(getDocumentVersionDownload("doc-1", "version-1")).rejects.toMatchObject({ status: 404 });
    expect(mocks.getPrivateBlob).not.toHaveBeenCalled();
  });

  it("filters document and version access by organization", async () => {
    mocks.db.document.findFirst.mockResolvedValue(null);

    await expect(uploadDocumentVersion("doc-foreign", [makeFile()])).rejects.toMatchObject({ status: 404 });
    await expect(listDocumentVersions("doc-foreign")).rejects.toMatchObject({ status: 404 });

    expect(mocks.db.document.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "doc-foreign", organizationId: "org-1", archivedAt: null },
    }));
  });

  it("rejects invalid upload payloads before Blob upload", async () => {
    await expect(uploadDocumentVersion("doc-1", [])).rejects.toMatchObject({ status: 409 });
    await expect(uploadDocumentVersion("doc-1", [makeFile(), makeFile()])).rejects.toMatchObject({ status: 409 });
    await expect(uploadDocumentVersion("doc-1", [makeFile({ bytes: [] })])).rejects.toMatchObject({ status: 409 });
    await expect(uploadDocumentVersion("doc-1", [makeFile({ type: "text/html" })])).rejects.toMatchObject({ status: 409 });
    await expect(uploadDocumentVersion("doc-1", [makeFile({ bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] })])).rejects.toMatchObject({ status: 409 });
    await expect(uploadDocumentVersion("doc-1", [makeFile({ sizeBytes: DOCUMENT_VERSION_MAX_SIZE_BYTES + 1 })])).rejects.toMatchObject({ status: 409 });
    expect(mocks.putPrivateBlob).not.toHaveBeenCalled();
  });

  it("lists only active versions for the document and omits Blob keys", async () => {
    mocks.db.documentVersion.findMany.mockResolvedValue([versionRecord]);

    const versions = await listDocumentVersions("doc-1");

    expect(mocks.db.documentVersion.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { documentId: "doc-1", organizationId: "org-1", archivedAt: null },
    }));
    expect(versions[0]).not.toHaveProperty("blobKey");
  });

  it("soft archives a version without deleting the Blob", async () => {
    mocks.db.documentVersion.findFirst.mockResolvedValue(versionRecord);
    mocks.db.documentVersion.update.mockResolvedValue({ ...versionRecord, archivedAt: now });

    await expect(archiveDocumentVersion("doc-1", "version-1")).resolves.toMatchObject({ archivedAt: now });

    expect(mocks.db.documentVersion.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "version-1" },
      data: expect.objectContaining({ archivedAt: expect.any(Date) }),
    }));
    expect(mocks.deletePrivateBlob).not.toHaveBeenCalled();
  });

  it("promotes an approved version atomically and supersedes the previous current version", async () => {
    mocks.db.document.findFirst.mockResolvedValue({ ...documentRecord, currentVersionId: "version-old", documentType: { sensitivity: "STANDARD" } });
    mocks.db.documentVersion.findFirst.mockResolvedValue({ ...versionRecord, reviewStatus: "TO_REVIEW", reviewedById: null, reviewedAt: null, reviewReason: null });
    mocks.db.documentVersion.updateMany.mockResolvedValue({ count: 1 });
    mocks.db.documentVersion.update.mockResolvedValue({ ...versionRecord, reviewStatus: "CURRENT", reviewedById: "user-1", reviewedAt: now, reviewReason: null });
    mocks.db.document.update.mockResolvedValue({ id: "doc-1" });

    await expect(reviewDocumentVersion("doc-1", "version-1", { decision: "APPROVE" })).resolves.toMatchObject({ id: "version-1", reviewStatus: "CURRENT" });
    expect(mocks.db.documentVersion.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { reviewStatus: "SUPERSEDED" } }));
    expect(mocks.db.document.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ currentVersionId: "version-1", status: "PRESENT" }) }));
    expect(mocks.appendContextTimelineEvent).toHaveBeenCalledWith(expect.objectContaining({ eventType: "DOCUMENT_VERSION_REVIEWED", targetId: "doc-1" }), mocks.db);
  });

  it("denies download for missing or archived versions", async () => {
    mocks.db.documentVersion.findFirst.mockResolvedValue(null);

    await expect(getDocumentVersionDownload("doc-1", "version-archived")).rejects.toMatchObject({ status: 404 });
    expect(mocks.getPrivateBlob).not.toHaveBeenCalled();
  });

  it("cleans up the uploaded Blob if Prisma metadata persistence fails", async () => {
    const failure = new Error("db down");
    mocks.db.$transaction.mockRejectedValue(failure);

    await expect(uploadDocumentVersion("doc-1", [makeFile()])).rejects.toThrow("db down");

    expect(mocks.deletePrivateBlob).toHaveBeenCalledWith(expect.stringContaining("organizations/org-1/documents/doc-1/versions/"));
  });
});
