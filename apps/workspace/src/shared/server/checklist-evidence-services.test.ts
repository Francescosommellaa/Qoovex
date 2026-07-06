import type { OrganizationRole } from "@qoovex/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    checklist: { findMany: vi.fn(), create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    checklistItem: { findMany: vi.fn(), create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    jobSite: { findFirst: vi.fn() },
    worker: { findFirst: vi.fn() },
    evidence: { findMany: vi.fn(), create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    workerUserLink: { findFirst: vi.fn() },
    jobSiteUserAssignment: { findMany: vi.fn() },
    jobSiteWorkerAssignment: { findMany: vi.fn() },
  },
  getViewerContext: vi.fn(),
  getContextOrganizationId: vi.fn(),
  requirePermission: vi.fn(),
  recordSupportAccess: vi.fn(),
  putPrivateBlob: vi.fn(),
  getPrivateBlob: vi.fn(),
  deletePrivateBlob: vi.fn(),
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
  getViewerContext: mocks.getViewerContext,
  getContextOrganizationId: mocks.getContextOrganizationId,
  requirePermission: mocks.requirePermission,
}));
vi.mock("@shared/server/support-access-service", () => ({ recordSupportAccess: mocks.recordSupportAccess }));
vi.mock("./blob-storage-service", () => ({
  putPrivateBlob: mocks.putPrivateBlob,
  getPrivateBlob: mocks.getPrivateBlob,
  deletePrivateBlob: mocks.deletePrivateBlob,
}));

import {
  archiveChecklist,
  archiveChecklistItem,
  createChecklist,
  createChecklistItem,
  listChecklists,
  updateChecklistItem,
} from "./checklist-service";
import {
  EVIDENCE_MAX_SIZE_BYTES,
  archiveEvidence,
  createEvidenceNote,
  getEvidenceDownload,
  listEvidence,
  uploadEvidenceFile,
} from "./evidence-service";

const now = new Date("2026-07-01T10:00:00.000Z");

const checklistRecord = {
  id: "checklist-1",
  organizationId: "org-1",
  jobSiteId: "jobsite-1",
  name: "Controllo ingresso",
  description: null,
  status: "ACTIVE",
  createdAt: now,
  updatedAt: now,
  archivedAt: null,
};

const itemRecord = {
  id: "item-1",
  organizationId: "org-1",
  checklistId: "checklist-1",
  label: "Foto area ingresso",
  description: null,
  status: "OPEN",
  completedAt: null,
  completedById: null,
  createdAt: now,
  updatedAt: now,
};

const evidenceRecord = {
  id: "evidence-1",
  organizationId: "org-1",
  jobSiteId: "jobsite-1",
  workerId: null,
  checklistItemId: "item-1",
  type: "NOTE",
  title: "Nota operativa",
  description: "Materiale presente",
  blobKey: null,
  originalFileName: null,
  mimeType: null,
  size: null,
  createdById: "user-1",
  createdAt: now,
  archivedAt: null,
};

const fileEvidenceRecord = {
  ...evidenceRecord,
  type: "PHOTO",
  blobKey: "organizations/org-1/evidence/evidence-1/foto.png",
  originalFileName: "foto.png",
  mimeType: "image/png",
  size: 4,
};

function resetModel(model: Record<string, ReturnType<typeof vi.fn>>) {
  for (const method of Object.values(model)) method.mockReset();
}

function setRole(role: OrganizationRole) {
  mocks.getViewerContext.mockResolvedValue({
    userId: "user-1",
    platformRole: "USER",
    membership: { id: "member-1", role, organization: { id: "org-1", name: "Azienda", code: "QVX-1" } },
    support: null,
    permissions: [],
  });
}

function makeFile(input: { name?: string; type?: string; bytes?: number[]; sizeBytes?: number } = {}) {
  const bytes = input.sizeBytes === undefined
    ? new Uint8Array(input.bytes ?? [1, 2, 3, 4])
    : new Uint8Array(input.sizeBytes);
  return new File([bytes], input.name ?? "foto.png", { type: input.type ?? "image/png" });
}

beforeEach(() => {
  resetModel(mocks.db.checklist);
  resetModel(mocks.db.checklistItem);
  resetModel(mocks.db.jobSite);
  resetModel(mocks.db.worker);
  resetModel(mocks.db.evidence);
  resetModel(mocks.db.workerUserLink);
  resetModel(mocks.db.jobSiteUserAssignment);
  resetModel(mocks.db.jobSiteWorkerAssignment);
  mocks.getViewerContext.mockReset();
  mocks.getContextOrganizationId.mockReset();
  mocks.requirePermission.mockReset();
  mocks.recordSupportAccess.mockReset();
  mocks.putPrivateBlob.mockReset();
  mocks.getPrivateBlob.mockReset();
  mocks.deletePrivateBlob.mockReset();
  mocks.getContextOrganizationId.mockReturnValue("org-1");
  mocks.requirePermission.mockImplementation(() => undefined);
  mocks.recordSupportAccess.mockResolvedValue(undefined);
  mocks.db.jobSite.findFirst.mockResolvedValue({ id: "jobsite-1" });
  mocks.db.worker.findFirst.mockResolvedValue({ id: "worker-1" });
  mocks.db.checklist.findFirst.mockResolvedValue({ id: "checklist-1", organizationId: "org-1", jobSiteId: "jobsite-1" });
  mocks.db.checklistItem.findFirst.mockResolvedValue({ ...itemRecord, checklist: { jobSiteId: "jobsite-1" } });
  mocks.db.workerUserLink.findFirst.mockResolvedValue(null);
  mocks.db.jobSiteUserAssignment.findMany.mockResolvedValue([]);
  mocks.db.jobSiteWorkerAssignment.findMany.mockResolvedValue([]);
  mocks.putPrivateBlob.mockResolvedValue({ pathname: fileEvidenceRecord.blobKey, etag: "etag", contentType: "image/png" });
  mocks.deletePrivateBlob.mockResolvedValue(undefined);
  setRole("OWNER");
});

describe("checklist service", () => {
  it("lets owners create, list and archive checklists", async () => {
    mocks.db.checklist.create.mockResolvedValue(checklistRecord);
    mocks.db.checklist.findMany.mockResolvedValue([checklistRecord]);
    mocks.db.checklist.update.mockResolvedValue({ ...checklistRecord, status: "ARCHIVED", archivedAt: now });

    await expect(createChecklist({ name: " Controllo ingresso ", jobSiteId: "jobsite-1" })).resolves.toMatchObject({ name: "Controllo ingresso" });
    await expect(listChecklists()).resolves.toEqual([checklistRecord]);
    await expect(archiveChecklist("checklist-1")).resolves.toMatchObject({ status: "ARCHIVED" });

    expect(mocks.db.checklist.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-1", archivedAt: null },
    }));
    expect(mocks.db.checklist.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "checklist-1" },
      data: expect.objectContaining({ status: "ARCHIVED", archivedAt: expect.any(Date) }),
    }));
  });

  it("lets safety consultants manage checklist items and site managers complete assigned items", async () => {
    setRole("SAFETY_CONSULTANT");
    mocks.db.checklistItem.create.mockResolvedValue({ ...itemRecord, status: "DONE", completedAt: now, completedById: "user-1" });
    await expect(createChecklistItem("checklist-1", { label: "Completa voce", status: "DONE" })).resolves.toMatchObject({
      status: "DONE",
      completedById: "user-1",
    });

    setRole("SITE_MANAGER");
    mocks.db.jobSiteUserAssignment.findMany.mockResolvedValue([{ jobSiteId: "jobsite-1" }]);
    mocks.db.checklist.findMany.mockResolvedValue([checklistRecord]);
    mocks.db.checklistItem.update.mockResolvedValue({ ...itemRecord, status: "DONE", completedAt: now, completedById: "user-1" });
    await expect(listChecklists()).resolves.toEqual([checklistRecord]);
    await expect(updateChecklistItem("checklist-1", "item-1", { status: "DONE" })).resolves.toMatchObject({ status: "DONE" });
    await expect(createChecklistItem("checklist-1", { label: "Voce" })).rejects.toMatchObject({ status: 404 });

    setRole("WORKER");
    await expect(listChecklists()).rejects.toMatchObject({ status: 404 });

    setRole("VIEWER");
    await expect(listChecklists()).rejects.toMatchObject({ status: 404 });
  });

  it("completes and reopens checklist items using the server context user", async () => {
    mocks.db.checklistItem.update.mockResolvedValue({ ...itemRecord, status: "DONE", completedAt: now, completedById: "user-1" });
    await updateChecklistItem("checklist-1", "item-1", { status: "DONE" });
    expect(mocks.requirePermission).toHaveBeenLastCalledWith(expect.anything(), "checklists:complete");
    expect(mocks.db.checklistItem.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "DONE", completedAt: expect.any(Date), completedById: "user-1" }),
    }));

    mocks.db.checklistItem.update.mockResolvedValue({ ...itemRecord, status: "OPEN" });
    await updateChecklistItem("checklist-1", "item-1", { status: "OPEN" });
    expect(mocks.db.checklistItem.update).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "OPEN", completedAt: null, completedById: null }),
    }));
  });

  it("archives checklist items via status without deleting records", async () => {
    mocks.db.checklistItem.update.mockResolvedValue({ ...itemRecord, status: "ARCHIVED" });

    await expect(archiveChecklistItem("checklist-1", "item-1")).resolves.toMatchObject({ status: "ARCHIVED" });
    expect(mocks.db.checklistItem.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { status: "ARCHIVED", completedAt: null, completedById: null },
    }));
  });

  it("rejects invalid checklist input and cross-organization references", async () => {
    await expect(createChecklist({ name: " " })).rejects.toMatchObject({ status: 409 });
    mocks.db.jobSite.findFirst.mockResolvedValue(null);
    await expect(createChecklist({ name: "Controllo", jobSiteId: "foreign-jobsite" })).rejects.toMatchObject({ status: 404 });
    expect(mocks.db.jobSite.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "foreign-jobsite", organizationId: "org-1", archivedAt: null },
    }));

    await expect(createChecklistItem("checklist-1", { label: " " })).rejects.toMatchObject({ status: 409 });
    mocks.db.checklist.findFirst.mockResolvedValue(null);
    await expect(createChecklistItem("foreign-checklist", { label: "Voce" })).rejects.toMatchObject({ status: 404 });
  });
});

describe("evidence service", () => {
  it("creates note evidence without Blob metadata or permanent URLs", async () => {
    mocks.db.evidence.create.mockResolvedValue(evidenceRecord);

    const evidence = await createEvidenceNote({
      type: "NOTE",
      title: " Nota operativa ",
      description: "Materiale presente",
      jobSiteId: "jobsite-1",
      checklistItemId: "item-1",
    });

    expect(mocks.db.evidence.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        organizationId: "org-1",
        jobSiteId: "jobsite-1",
        checklistItemId: "item-1",
        type: "NOTE",
        title: "Nota operativa",
        createdById: "user-1",
      }),
    }));
    expect(mocks.putPrivateBlob).not.toHaveBeenCalled();
    expect(evidence).toMatchObject({ hasFile: false });
    expect(evidence).not.toHaveProperty("blobKey");
    expect(evidence).not.toHaveProperty("url");
    expect(evidence).not.toHaveProperty("downloadUrl");
  });

  it("uploads photo evidence to Blob and persists metadata only", async () => {
    mocks.db.evidence.create.mockImplementation(async ({ data }) => ({ ...fileEvidenceRecord, ...data, createdAt: now, archivedAt: null }));

    const evidence = await uploadEvidenceFile({
      type: "PHOTO",
      title: "Foto ingresso",
      jobSiteId: "jobsite-1",
    }, [makeFile()]);

    expect(mocks.putPrivateBlob).toHaveBeenCalledWith(expect.objectContaining({
      contentType: "image/png",
      maximumSizeInBytes: EVIDENCE_MAX_SIZE_BYTES,
      pathname: expect.stringContaining("organizations/org-1/evidence/"),
    }));
    expect(mocks.db.evidence.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        organizationId: "org-1",
        blobKey: fileEvidenceRecord.blobKey,
        originalFileName: "foto.png",
        mimeType: "image/png",
        size: 4,
        createdById: "user-1",
      }),
    }));
    expect(evidence).toMatchObject({ hasFile: true, originalFileName: "foto.png" });
    expect(evidence).not.toHaveProperty("blobKey");
  });

  it("lets safety consultants read, upload and download evidence but not archive", async () => {
    setRole("SAFETY_CONSULTANT");
    mocks.db.evidence.findMany.mockResolvedValue([fileEvidenceRecord]);
    mocks.db.evidence.findFirst.mockResolvedValue(fileEvidenceRecord);
    mocks.db.evidence.create.mockResolvedValue(evidenceRecord);
    const stream = new ReadableStream<Uint8Array>();
    mocks.getPrivateBlob.mockResolvedValue({ stream, contentType: "image/png", size: 4 });

    await expect(listEvidence()).resolves.toEqual([expect.objectContaining({ hasFile: true })]);
    await expect(createEvidenceNote({ type: "NOTE", title: "Nota", jobSiteId: "jobsite-1" })).resolves.toMatchObject({ type: "NOTE" });
    await expect(getEvidenceDownload("evidence-1")).resolves.toMatchObject({ stream, originalFileName: "foto.png" });
    await expect(archiveEvidence("evidence-1")).rejects.toMatchObject({ status: 404 });
  });

  it("scopes evidence access for operational roles and denies viewers", async () => {
    setRole("SITE_MANAGER");
    mocks.db.jobSiteUserAssignment.findMany.mockResolvedValue([{ jobSiteId: "jobsite-1" }]);
    mocks.db.evidence.findMany.mockResolvedValue([evidenceRecord]);
    mocks.db.evidence.create.mockResolvedValue(evidenceRecord);
    await expect(listEvidence()).resolves.toHaveLength(1);
    await expect(createEvidenceNote({ type: "NOTE", title: "Nota", jobSiteId: "jobsite-1" })).resolves.toMatchObject({ type: "NOTE" });

    setRole("WORKER");
    mocks.db.workerUserLink.findFirst.mockResolvedValue({ worker: { id: "worker-1", displayName: "Mario", roleLabel: null, status: "ACTIVE" } });
    mocks.db.jobSiteWorkerAssignment.findMany.mockResolvedValue([{ jobSiteId: "jobsite-1" }]);
    mocks.db.evidence.findMany.mockResolvedValue([{ ...evidenceRecord, workerId: "worker-1" }]);
    mocks.db.evidence.create.mockResolvedValue({ ...evidenceRecord, workerId: "worker-1" });
    await expect(listEvidence()).resolves.toHaveLength(1);
    await expect(createEvidenceNote({ type: "NOTE", title: "Nota", workerId: "worker-1" })).resolves.toMatchObject({ type: "NOTE" });

    setRole("VIEWER");
    await expect(listEvidence()).rejects.toMatchObject({ status: 404 });
    await expect(createEvidenceNote({ type: "NOTE", title: "Nota", jobSiteId: "jobsite-1" })).rejects.toMatchObject({ status: 404 });
  });

  it("filters evidence and references by organization", async () => {
    mocks.db.evidence.findFirst.mockResolvedValue(null);
    await expect(getEvidenceDownload("foreign-evidence")).rejects.toMatchObject({ status: 404 });
    expect(mocks.db.evidence.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "foreign-evidence", organizationId: "org-1", archivedAt: null },
    }));

    mocks.db.jobSite.findFirst.mockResolvedValue(null);
    await expect(createEvidenceNote({ type: "NOTE", title: "Nota", jobSiteId: "foreign-jobsite" })).rejects.toMatchObject({ status: 404 });
    mocks.db.jobSite.findFirst.mockResolvedValue({ id: "jobsite-1" });
    mocks.db.worker.findFirst.mockResolvedValue(null);
    await expect(createEvidenceNote({ type: "NOTE", title: "Nota", workerId: "foreign-worker" })).rejects.toMatchObject({ status: 404 });
    mocks.db.worker.findFirst.mockResolvedValue({ id: "worker-1" });
    mocks.db.checklistItem.findFirst.mockResolvedValue(null);
    await expect(createEvidenceNote({ type: "NOTE", title: "Nota", checklistItemId: "foreign-item" })).rejects.toMatchObject({ status: 404 });
  });

  it("rejects invalid evidence payloads and file uploads", async () => {
    await expect(createEvidenceNote({ type: "NOTE", title: " ", jobSiteId: "jobsite-1" })).rejects.toMatchObject({ status: 409 });
    await expect(createEvidenceNote({ type: "NOTE", title: "Nota" })).rejects.toMatchObject({ status: 409 });
    await expect(createEvidenceNote({ type: "NOTE", title: "Nota", jobSiteId: "jobsite-1", file: "x" })).rejects.toMatchObject({ status: 409 });
    await expect(uploadEvidenceFile({ type: "PHOTO", title: "Foto", jobSiteId: "jobsite-1" }, [])).rejects.toMatchObject({ status: 409 });
    await expect(uploadEvidenceFile({ type: "PHOTO", title: "Foto", jobSiteId: "jobsite-1" }, [makeFile(), makeFile()])).rejects.toMatchObject({ status: 409 });
    await expect(uploadEvidenceFile({ type: "PHOTO", title: "Foto", jobSiteId: "jobsite-1" }, [makeFile({ bytes: [] })])).rejects.toMatchObject({ status: 409 });
    await expect(uploadEvidenceFile({ type: "PHOTO", title: "Foto", jobSiteId: "jobsite-1" }, [makeFile({ type: "application/pdf" })])).rejects.toMatchObject({ status: 409 });
    await expect(uploadEvidenceFile({ type: "FILE", title: "File", jobSiteId: "jobsite-1" }, [makeFile({ type: "text/html" })])).rejects.toMatchObject({ status: 409 });
    await expect(uploadEvidenceFile({ type: "FILE", title: "File", jobSiteId: "jobsite-1" }, [makeFile({ sizeBytes: EVIDENCE_MAX_SIZE_BYTES + 1 })])).rejects.toMatchObject({ status: 409 });
    await expect(uploadEvidenceFile({ type: "NOTE", title: "Nota", jobSiteId: "jobsite-1" }, [makeFile()])).rejects.toMatchObject({ status: 409 });
  });

  it("archives evidence without deleting Blob and denies archived downloads", async () => {
    mocks.db.evidence.findFirst.mockResolvedValue(fileEvidenceRecord);
    mocks.db.evidence.update.mockResolvedValue({ ...fileEvidenceRecord, archivedAt: now });

    await expect(archiveEvidence("evidence-1")).resolves.toMatchObject({ archivedAt: now });
    expect(mocks.db.evidence.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ archivedAt: expect.any(Date) }),
    }));
    expect(mocks.deletePrivateBlob).not.toHaveBeenCalled();

    mocks.db.evidence.findFirst.mockResolvedValue(null);
    await expect(getEvidenceDownload("evidence-1")).rejects.toMatchObject({ status: 404 });
  });

  it("cleans up uploaded Blob if Prisma persistence fails", async () => {
    mocks.db.evidence.create.mockRejectedValue(new Error("db down"));

    await expect(uploadEvidenceFile({ type: "FILE", title: "File", jobSiteId: "jobsite-1" }, [makeFile({ type: "application/pdf", name: "file.pdf" })]))
      .rejects.toThrow("db down");

    expect(mocks.deletePrivateBlob).toHaveBeenCalledWith(expect.stringContaining("organizations/org-1/evidence/"));
  });
});
