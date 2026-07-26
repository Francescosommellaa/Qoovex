import type { OrganizationRole } from "@qoovex/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    documentType: { findMany: vi.fn(), create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    document: { findMany: vi.fn(), create: vi.fn(), findFirst: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
    worker: { findFirst: vi.fn() },
    jobSite: { findFirst: vi.fn() },
    deadline: { findMany: vi.fn(), create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    workerUserLink: { findFirst: vi.fn() },
    jobSiteUserAssignment: { findMany: vi.fn() },
    jobSiteWorkerAssignment: { findMany: vi.fn() },
  },
  getWorkspaceAccessContext: vi.fn(),
  getContextOrganizationId: vi.fn(),
  requirePermission: vi.fn(),
  recordSupportAccess: vi.fn(),
  deletePrivateBlobs: vi.fn(),
  recordRuntimeErrorBestEffort: vi.fn(),
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
vi.mock("@shared/server/blob-storage-service", () => ({ deletePrivateBlobs: mocks.deletePrivateBlobs }));
vi.mock("@shared/server/runtime-error-service", () => ({ recordRuntimeErrorBestEffort: mocks.recordRuntimeErrorBestEffort }));

import { archiveDeadline, createDeadline, listDeadlines } from "./deadline-service";
import { archiveDocument, createDocument, getDocument, getDocumentWithVersions, listDocuments, permanentlyDeleteArchivedDocument, restoreDocument, updateDocument } from "./document-service";
import { createDocumentType, listDocumentTypes } from "./document-type-service";

const now = new Date("2026-06-30T10:00:00.000Z");

const documentTypeRecord = {
  id: "dt-1",
  organizationId: "org-1",
  name: "Documento configurato",
  description: null,
  appliesTo: "WORKER",
  categoryKey: "WORKER_TRAINING_QUALIFICATIONS",
  sensitivity: "STANDARD",
  requiresExpiryDate: false,
  createdAt: now,
  updatedAt: now,
  archivedAt: null,
  _count: { documents: 0 },
};

const organizationDocumentTypeRecord = {
  ...documentTypeRecord,
  id: "dt-company",
  name: "Visura camerale",
  appliesTo: "ORGANIZATION",
  categoryKey: "COMPANY_IDENTITY_REGISTRATIONS",
};

const documentRecord = {
  id: "doc-1",
  organizationId: "org-1",
  documentTypeId: "dt-company",
  ownerType: "ORGANIZATION",
  workerId: null,
  jobSiteId: null,
  title: "Documento presente",
  status: "TO_REVIEW",
  expiryDate: null,
  reviewedAt: null,
  reviewedById: null,
  notes: null,
  createdAt: now,
  updatedAt: now,
  archivedAt: null,
  documentType: organizationDocumentTypeRecord,
  worker: null,
  jobSite: null,
};

const documentVersionRecord = {
  id: "version-1",
  organizationId: "org-1",
  documentId: "doc-1",
  originalFileName: "documento.pdf",
  mimeType: "application/pdf",
  size: 10,
  checksum: null,
  uploadedById: "user-1",
  createdAt: now,
  archivedAt: null,
};

const deadlineRecord = {
  id: "deadline-1",
  organizationId: "org-1",
  title: "Scadenza registrata",
  dueDate: new Date("2099-01-10T00:00:00.000Z"),
  sourceType: "MANUAL",
  documentId: null,
  workerId: null,
  jobSiteId: null,
  status: "SCHEDULED",
  remindAt: null,
  createdAt: now,
  updatedAt: now,
  archivedAt: null,
};

function resetModel(model: Record<string, ReturnType<typeof vi.fn>>) {
  for (const method of Object.values(model)) method.mockReset();
}

function setRole(role: OrganizationRole) {
  mocks.getWorkspaceAccessContext.mockResolvedValue({
    userId: "user-1",
    platformRole: "USER",
    company: { id: "member-1", role, organization: { id: "org-1", name: "Azienda", code: "QVX-1" } },
    support: null,
    permissions: [],
  });
}

beforeEach(() => {
  resetModel(mocks.db.documentType);
  resetModel(mocks.db.document);
  resetModel(mocks.db.worker);
  resetModel(mocks.db.jobSite);
  resetModel(mocks.db.deadline);
  resetModel(mocks.db.workerUserLink);
  resetModel(mocks.db.jobSiteUserAssignment);
  resetModel(mocks.db.jobSiteWorkerAssignment);
  mocks.getWorkspaceAccessContext.mockReset();
  mocks.getContextOrganizationId.mockReset();
  mocks.requirePermission.mockReset();
  mocks.recordSupportAccess.mockReset();
  mocks.deletePrivateBlobs.mockReset().mockResolvedValue(undefined);
  mocks.recordRuntimeErrorBestEffort.mockReset().mockResolvedValue(undefined);
  mocks.getContextOrganizationId.mockReturnValue("org-1");
  mocks.requirePermission.mockImplementation(() => undefined);
  mocks.recordSupportAccess.mockResolvedValue(undefined);
  mocks.db.document.deleteMany.mockResolvedValue({ count: 1 });
  mocks.db.workerUserLink.findFirst.mockResolvedValue(null);
  mocks.db.jobSiteUserAssignment.findMany.mockResolvedValue([]);
  mocks.db.jobSiteWorkerAssignment.findMany.mockResolvedValue([]);
  setRole("OWNER");
});

describe("document type service", () => {
  it("lets owners create configurable document types without presets", async () => {
    mocks.db.documentType.create.mockResolvedValue(documentTypeRecord);

    await expect(createDocumentType({ name: " Documento ", appliesTo: "WORKER", categoryKey: "WORKER_TRAINING_QUALIFICATIONS", sensitivity: "STANDARD", requiresExpiryDate: false })).resolves.toMatchObject({ name: "Documento configurato", categoryKey: "WORKER_TRAINING_QUALIFICATIONS", categoryLabel: "Formazione e abilitazioni" });

    expect(mocks.requirePermission).toHaveBeenCalledWith(expect.anything(), "documents:update");
    expect(mocks.db.documentType.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ organizationId: "org-1", name: "Documento", appliesTo: "WORKER" }),
    }));
  });

  it("lists only active document types for the current organization", async () => {
    mocks.db.documentType.findMany.mockResolvedValue([documentTypeRecord]);

    await expect(listDocumentTypes()).resolves.toEqual([{ ...documentTypeRecord, categoryLabel: "Formazione e abilitazioni", documentCount: 0, _count: undefined }]);

    expect(mocks.db.documentType.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-1", archivedAt: null },
    }));
  });

  it("rejects empty document type names and invalid enum values", async () => {
    await expect(createDocumentType({ name: " ", appliesTo: "WORKER" })).rejects.toMatchObject({ status: 409 });
    await expect(createDocumentType({ name: "Documento", appliesTo: "LEGAL" })).rejects.toMatchObject({ status: 409 });
    expect(mocks.db.documentType.create).not.toHaveBeenCalled();
  });
});

describe("document service", () => {
  it("lists archived documents with one tenant-scoped query for archive managers", async () => {
    const archivedDocument = { ...documentRecord, status: "ARCHIVED", archivedAt: now };
    mocks.db.document.findMany.mockResolvedValue([archivedDocument]);

    await expect(listDocuments({ status: "ARCHIVED" })).resolves.toMatchObject([{ id: "doc-1", status: "ARCHIVED", categoryKey: "COMPANY_IDENTITY_REGISTRATIONS" }]);

    expect(mocks.requirePermission).toHaveBeenCalledWith(expect.anything(), "documents:archive");
    expect(mocks.db.document.findMany).toHaveBeenCalledTimes(1);
    expect(mocks.db.document.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ organizationId: "org-1", archivedAt: { not: null }, status: "ARCHIVED" }),
    }));
  });

  it("loads document metadata and versions with one Prisma operation", async () => {
    mocks.db.document.findFirst.mockResolvedValue({ ...documentRecord, versions: [documentVersionRecord] });

    await expect(getDocumentWithVersions("doc-1")).resolves.toMatchObject({
      document: { id: "doc-1" },
      versions: [{ id: "version-1" }],
    });
    expect(mocks.db.document.findFirst).toHaveBeenCalledTimes(1);
    expect(mocks.db.document.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "doc-1", organizationId: "org-1", archivedAt: null },
      select: expect.objectContaining({ versions: expect.any(Object) }),
    }));
  });

  it("lets admins create logical organization documents without Blob fields", async () => {
    setRole("ADMIN");
    mocks.db.documentType.findFirst.mockResolvedValue(organizationDocumentTypeRecord);
    mocks.db.document.create.mockResolvedValue(documentRecord);

    await expect(createDocument({ title: " Documento ", documentTypeId: "dt-company", ownerType: "ORGANIZATION", status: "TO_REVIEW" })).resolves.toMatchObject({ id: "doc-1", categoryKey: "COMPANY_IDENTITY_REGISTRATIONS" });

    expect(mocks.requirePermission).toHaveBeenCalledWith(expect.anything(), "documents:update");
    expect(mocks.db.document.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.not.objectContaining({ blobKey: expect.anything() }),
    }));
  });

  it("rejects inconsistent owners and file payload fields", async () => {
    mocks.db.documentType.findFirst.mockResolvedValue(documentTypeRecord);
    await expect(createDocument({ title: "Documento", documentTypeId: "dt-1", ownerType: "WORKER" })).rejects.toMatchObject({ status: 409 });
    await expect(createDocument({ title: "Documento", documentTypeId: "dt-1", ownerType: "ORGANIZATION", blobKey: "blob" })).rejects.toMatchObject({ status: 409 });
    expect(mocks.db.document.create).not.toHaveBeenCalled();
  });

  it("validates related document types inside the same organization", async () => {
    mocks.db.documentType.findFirst.mockResolvedValue(null);

    await expect(createDocument({ title: "Documento", ownerType: "ORGANIZATION", documentTypeId: "dt-other" })).rejects.toMatchObject({ status: 404 });

    expect(mocks.db.documentType.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "dt-other", organizationId: "org-1", archivedAt: null },
    }));
    expect(mocks.db.document.create).not.toHaveBeenCalled();
  });

  it("rejects worker and job site owners outside the current organization or archived", async () => {
    mocks.db.documentType.findFirst.mockResolvedValue(documentTypeRecord);
    mocks.db.worker.findFirst.mockResolvedValue(null);
    await expect(createDocument({ title: "Documento", documentTypeId: "dt-1", ownerType: "WORKER", workerId: "worker-other" })).rejects.toMatchObject({ status: 404 });
    expect(mocks.db.worker.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "worker-other", organizationId: "org-1", archivedAt: null },
    }));

    mocks.db.worker.findFirst.mockReset();
    mocks.db.documentType.findFirst.mockResolvedValue({ ...documentTypeRecord, appliesTo: "JOB_SITE", categoryKey: "SITE_START_AUTHORIZATIONS" });
    mocks.db.jobSite.findFirst.mockResolvedValue(null);
    await expect(createDocument({ title: "Documento", documentTypeId: "dt-1", ownerType: "JOB_SITE", jobSiteId: "jobsite-other" })).rejects.toMatchObject({ status: 404 });
    expect(mocks.db.jobSite.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "jobsite-other", organizationId: "org-1", archivedAt: null },
    }));
    expect(mocks.db.document.create).not.toHaveBeenCalled();
  });

  it("lets safety consultants read and update document metadata but not archive", async () => {
    setRole("SAFETY_CONSULTANT");
    mocks.db.document.findFirst.mockResolvedValue({ id: "doc-1", ownerType: "ORGANIZATION", workerId: null, jobSiteId: null });
    mocks.db.document.update.mockResolvedValue({ ...documentRecord, status: "PRESENT" });

    await expect(updateDocument("doc-1", { status: "PRESENT" })).resolves.toMatchObject({ status: "PRESENT" });
    await expect(archiveDocument("doc-1")).rejects.toMatchObject({ status: 404 });
    await expect(listDocuments({ status: "ARCHIVED" })).rejects.toMatchObject({ status: 404 });
  });

  it("scopes document reads for site managers and workers while destinatari esterni stay denied", async () => {
    setRole("SITE_MANAGER");
    mocks.db.jobSiteUserAssignment.findMany.mockResolvedValue([{ jobSiteId: "jobsite-1" }]);
    mocks.db.document.findMany.mockResolvedValue([{ ...documentRecord, ownerType: "JOB_SITE", jobSiteId: "jobsite-1" }]);
    await expect(listDocuments()).resolves.toHaveLength(1);
    expect(mocks.db.document.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        organizationId: "org-1",
        OR: [{ ownerType: "JOB_SITE", jobSiteId: { in: ["jobsite-1"] } }],
      }),
    }));

    setRole("WORKER");
    mocks.db.workerUserLink.findFirst.mockResolvedValue({ worker: { id: "worker-1", displayName: "Mario", roleLabel: null, status: "ACTIVE" } });
    mocks.db.jobSiteWorkerAssignment.findMany.mockResolvedValue([]);
    mocks.db.document.findMany.mockResolvedValue([{ ...documentRecord, ownerType: "WORKER", workerId: "worker-1" }]);
    await expect(listDocuments()).resolves.toHaveLength(1);
    expect(mocks.db.document.findMany).toHaveBeenLastCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        organizationId: "org-1",
        OR: [{ ownerType: "WORKER", workerId: "worker-1" }],
      }),
    }));

    setRole("SITE_MANAGER");
    await expect(listDocuments()).resolves.toBeDefined();
  });

  it("bounds macroarea document pages without changing tenant and role filters", async () => {
    mocks.db.document.findMany.mockResolvedValue([]);

    await expect(listDocuments({ ownerType: "WORKER", take: 51, skip: 100 })).resolves.toEqual([]);
    expect(mocks.db.document.findMany).toHaveBeenCalledWith(expect.objectContaining({
      take: 51,
      skip: 100,
      where: expect.objectContaining({ organizationId: "org-1", ownerType: "WORKER" }),
    }));
    await expect(listDocuments({ take: 102 })).rejects.toMatchObject({ status: 409 });
    await expect(listDocuments({ skip: -1 })).rejects.toMatchObject({ status: 409 });
  });

  it("applies the attention queue in the existing tenant-scoped document query", async () => {
    mocks.db.document.findMany.mockResolvedValue([]);
    await expect(listDocuments({ statuses: ["MISSING", "EXPIRED", "EXPIRING_SOON", "TO_REVIEW"], take: 51, skip: 50 })).resolves.toEqual([]);
    expect(mocks.db.document.findMany).toHaveBeenCalledTimes(1);
    expect(mocks.db.document.findMany).toHaveBeenCalledWith(expect.objectContaining({
      take: 51,
      skip: 50,
      where: expect.objectContaining({ organizationId: "org-1", status: { in: ["MISSING", "EXPIRED", "EXPIRING_SOON", "TO_REVIEW"] } }),
    }));
  });

  it("filters document detail by organization", async () => {
    mocks.db.document.findFirst.mockResolvedValue(null);

    await expect(getDocument("doc-foreign")).rejects.toMatchObject({ status: 404 });

    expect(mocks.db.document.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "doc-foreign", organizationId: "org-1", archivedAt: null },
    }));
  });

  it("restores only archived documents in the current organization as to review", async () => {
    mocks.db.document.findFirst.mockResolvedValue({ id: "doc-1" });
    mocks.db.document.update.mockResolvedValue({ ...documentRecord, status: "TO_REVIEW", archivedAt: null });

    await expect(restoreDocument("doc-1")).resolves.toMatchObject({ status: "TO_REVIEW", archivedAt: null });

    expect(mocks.db.document.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "doc-1", organizationId: "org-1", archivedAt: { not: null }, status: "ARCHIVED" },
    }));
    expect(mocks.db.document.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "doc-1" },
      data: { archivedAt: null, status: "TO_REVIEW" },
    }));
  });

  it("permanently deletes only the archived document before cleaning private blobs", async () => {
    mocks.db.document.findFirst.mockResolvedValue({
      id: "doc-1",
      versions: [{ id: "version-1", blobKey: "organizations/org-1/documents/doc-1/version-1.pdf" }],
    });

    await expect(permanentlyDeleteArchivedDocument("doc-1")).resolves.toEqual({ deleted: true, storageCleanupPending: false });

    expect(mocks.db.document.deleteMany).toHaveBeenCalledWith({
      where: { id: "doc-1", organizationId: "org-1", archivedAt: { not: null }, status: "ARCHIVED" },
    });
    expect(mocks.deletePrivateBlobs).toHaveBeenCalledWith(["organizations/org-1/documents/doc-1/version-1.pdf"]);
    expect(mocks.db.document.deleteMany.mock.invocationCallOrder[0]).toBeLessThan(mocks.deletePrivateBlobs.mock.invocationCallOrder[0]);
  });

  it("reports pending storage cleanup without hiding a committed document deletion", async () => {
    mocks.db.document.findFirst.mockResolvedValue({
      id: "doc-1",
      versions: [{ id: "version-1", blobKey: "organizations/org-1/documents/doc-1/version-1.pdf" }],
    });
    mocks.deletePrivateBlobs.mockRejectedValue(new Error("storage provider detail"));

    await expect(permanentlyDeleteArchivedDocument("doc-1")).resolves.toEqual({ deleted: true, storageCleanupPending: true });

    expect(mocks.recordRuntimeErrorBestEffort).toHaveBeenCalledWith(expect.objectContaining({
      source: "document-permanent-delete",
      routePath: "/api/documents/[documentId]/archive",
      requestMethod: "DELETE",
    }));
  });
});

describe("deadline service", () => {
  it("lets safety consultants read deadlines but not manage them", async () => {
    setRole("SAFETY_CONSULTANT");
    mocks.db.deadline.findMany.mockResolvedValue([deadlineRecord]);

    await expect(listDeadlines()).resolves.toEqual([deadlineRecord]);
    await expect(createDeadline({ title: "Scadenza", dueDate: "2099-01-10", sourceType: "MANUAL" })).rejects.toMatchObject({ status: 404 });
  });

  it("creates manual deadlines with user supplied dates", async () => {
    setRole("ADMIN");
    mocks.db.deadline.create.mockResolvedValue(deadlineRecord);

    await expect(createDeadline({ title: " Scadenza ", dueDate: "2099-01-10", sourceType: "MANUAL" })).resolves.toEqual(deadlineRecord);

    expect(mocks.db.deadline.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ organizationId: "org-1", title: "Scadenza", sourceType: "MANUAL", status: "SCHEDULED" }),
    }));
  });

  it("requires same-organization documents for document deadlines", async () => {
    mocks.db.document.findFirst.mockResolvedValue(null);

    await expect(createDeadline({ title: "Scadenza", dueDate: "2099-01-10", sourceType: "DOCUMENT", documentId: "doc-other" })).rejects.toMatchObject({ status: 404 });

    expect(mocks.db.document.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "doc-other", organizationId: "org-1", archivedAt: null },
    }));
  });

  it("rejects worker and job site deadlines outside the current organization or archived", async () => {
    mocks.db.worker.findFirst.mockResolvedValue(null);
    await expect(createDeadline({ title: "Scadenza", dueDate: "2099-01-10", sourceType: "MANUAL", workerId: "worker-other" })).rejects.toMatchObject({ status: 404 });
    expect(mocks.db.worker.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "worker-other", organizationId: "org-1", archivedAt: null },
    }));

    mocks.db.worker.findFirst.mockReset();
    mocks.db.jobSite.findFirst.mockResolvedValue(null);
    await expect(createDeadline({ title: "Scadenza", dueDate: "2099-01-10", sourceType: "MANUAL", jobSiteId: "jobsite-other" })).rejects.toMatchObject({ status: 404 });
    expect(mocks.db.jobSite.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "jobsite-other", organizationId: "org-1", archivedAt: null },
    }));
    expect(mocks.db.deadline.create).not.toHaveBeenCalled();
  });

  it("rejects missing dates and reminders after the due date", async () => {
    await expect(createDeadline({ title: "Scadenza", sourceType: "MANUAL" })).rejects.toMatchObject({ status: 409 });
    await expect(createDeadline({ title: "Scadenza", dueDate: "2099-01-10", sourceType: "MANUAL", remindAt: "2099-01-11" })).rejects.toMatchObject({ status: 409 });
    expect(mocks.db.deadline.create).not.toHaveBeenCalled();
  });

  it("soft archives deadlines without deleting rows", async () => {
    mocks.db.deadline.findFirst.mockResolvedValue({ id: "deadline-1" });
    mocks.db.deadline.update.mockResolvedValue({ ...deadlineRecord, status: "ARCHIVED", archivedAt: now });

    await expect(archiveDeadline("deadline-1")).resolves.toMatchObject({ status: "ARCHIVED" });

    expect(mocks.db.deadline.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "deadline-1" },
      data: expect.objectContaining({ status: "ARCHIVED", archivedAt: expect.any(Date) }),
    }));
  });
});
