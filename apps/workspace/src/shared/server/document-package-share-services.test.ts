import type { OrganizationRole } from "@qoovex/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    documentPackage: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    documentPackageItem: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    shareLink: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    jobSite: { findFirst: vi.fn() },
    document: { findFirst: vi.fn() },
    documentVersion: { findFirst: vi.fn() },
    evidence: { findFirst: vi.fn() },
    checklist: { findFirst: vi.fn() },
    $transaction: vi.fn(),
  },
  getWorkspaceAccessContext: vi.fn(),
  getContextOrganizationId: vi.fn(),
  requirePermission: vi.fn(),
  recordSupportAccess: vi.fn(),
  getPrivateBlob: vi.fn(),
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
vi.mock("./blob-storage-service", () => ({ getPrivateBlob: mocks.getPrivateBlob }));

import {
  addDocumentPackageItem,
  archiveDocumentPackage,
  createDocumentPackage,
  getDocumentPackage,
  listDocumentPackages,
  removeDocumentPackageItem,
  updateDocumentPackageItem,
} from "./document-package-service";
import { createShareLink, listShareLinks, revokeShareLink } from "./share-link-service";
import { hashShareToken } from "./share-token-service";
import { getSharedDocumentPackage, getSharedPackageItemDownload } from "./shared-package-access-service";

const now = new Date("2026-07-01T10:00:00.000Z");
const future = new Date("2030-07-08T10:00:00.000Z");

const packageRecord = {
  id: "package-1",
  organizationId: "org-1",
  jobSiteId: "jobsite-1",
  title: "Pacchetto ingresso",
  description: null,
  status: "DRAFT",
  createdById: "user-1",
  createdAt: now,
  updatedAt: now,
  archivedAt: null,
};

const itemRecord = {
  id: "item-1",
  organizationId: "org-1",
  documentPackageId: "package-1",
  itemType: "DOCUMENT_VERSION",
  documentId: null,
  documentVersionId: "version-1",
  evidenceId: null,
  checklistId: null,
  note: null,
  position: 0,
  createdAt: now,
};

const shareLinkRecord = {
  id: "share-1",
  organizationId: "org-1",
  documentPackageId: "package-1",
  expiresAt: future,
  revokedAt: null,
  createdById: "user-1",
  createdAt: now,
  lastAccessedAt: null,
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
  resetModel(mocks.db.documentPackage);
  resetModel(mocks.db.documentPackageItem);
  resetModel(mocks.db.shareLink);
  resetModel(mocks.db.jobSite);
  resetModel(mocks.db.document);
  resetModel(mocks.db.documentVersion);
  resetModel(mocks.db.evidence);
  resetModel(mocks.db.checklist);
  mocks.db.$transaction.mockReset();
  mocks.getWorkspaceAccessContext.mockReset();
  mocks.getContextOrganizationId.mockReset();
  mocks.requirePermission.mockReset();
  mocks.recordSupportAccess.mockReset();
  mocks.getPrivateBlob.mockReset();

  mocks.getContextOrganizationId.mockReturnValue("org-1");
  mocks.requirePermission.mockImplementation(() => undefined);
  mocks.recordSupportAccess.mockResolvedValue(undefined);
  mocks.db.jobSite.findFirst.mockResolvedValue({ id: "jobsite-1" });
  mocks.db.documentPackage.findFirst.mockResolvedValue(packageRecord);
  mocks.db.document.findFirst.mockResolvedValue({ id: "document-1" });
  mocks.db.documentVersion.findFirst.mockResolvedValue({
    id: "version-1",
    blobKey: "organizations/org-1/documents/document-1/versions/version-1/file.pdf",
    originalFileName: "file.pdf",
    mimeType: "application/pdf",
    size: 12,
  });
  mocks.db.evidence.findFirst.mockResolvedValue({
    id: "evidence-1",
    blobKey: "organizations/org-1/evidence/evidence-1/foto.png",
    originalFileName: "foto.png",
    mimeType: "image/png",
    size: 4,
  });
  mocks.db.checklist.findFirst.mockResolvedValue({ id: "checklist-1" });
  mocks.db.documentPackageItem.findFirst.mockResolvedValue(null);
  mocks.db.$transaction.mockImplementation(async (callback) => callback(mocks.db));
  setRole("OWNER");
});

describe("document package service", () => {
  it("lets owners create, read, update item positions and archive packages", async () => {
    mocks.db.documentPackage.create.mockResolvedValue(packageRecord);
    mocks.db.documentPackage.findMany.mockResolvedValue([packageRecord]);
    mocks.db.documentPackage.findFirst
      .mockResolvedValueOnce({ ...packageRecord, items: [itemRecord] })
      .mockResolvedValue(packageRecord);
    mocks.db.documentPackage.update.mockResolvedValue({ ...packageRecord, status: "ARCHIVED", archivedAt: now });
    mocks.db.documentPackageItem.findFirst.mockResolvedValue(itemRecord);
    mocks.db.documentPackageItem.update.mockResolvedValue({ ...itemRecord, position: 2 });

    await expect(createDocumentPackage({ title: " Pacchetto ingresso ", jobSiteId: "jobsite-1" })).resolves.toMatchObject({ title: "Pacchetto ingresso" });
    await expect(listDocumentPackages()).resolves.toEqual([packageRecord]);
    await expect(getDocumentPackage("package-1")).resolves.toMatchObject({ items: [itemRecord] });
    await expect(updateDocumentPackageItem("package-1", "item-1", { position: 2 })).resolves.toMatchObject({ position: 2 });
    await expect(archiveDocumentPackage("package-1")).resolves.toMatchObject({ status: "ARCHIVED" });

    expect(mocks.db.documentPackage.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-1", archivedAt: null },
    }));
    expect(mocks.db.documentPackage.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "ARCHIVED", archivedAt: expect.any(Date) }),
    }));
  });

  it("lets safety consultants read/create package items but not share links", async () => {
    setRole("SAFETY_CONSULTANT");
    mocks.db.documentPackageItem.findFirst.mockResolvedValueOnce(null).mockResolvedValue({ position: -1 });
    mocks.db.documentPackageItem.create.mockResolvedValue({ ...itemRecord, itemType: "NOTE", note: "Nota per revisione", documentVersionId: null });

    await expect(addDocumentPackageItem("package-1", { itemType: "NOTE", note: "Nota per revisione" })).resolves.toMatchObject({ itemType: "NOTE" });
    await expect(listShareLinks("package-1")).rejects.toMatchObject({ status: 404 });
    await expect(createShareLink("package-1")).rejects.toMatchObject({ status: 404 });
  });

  it("denies broad internal package access to site managers, workers and destinatari esterni", async () => {
    for (const role of ["SITE_MANAGER", "WORKER"] as const) {
      setRole(role);
      await expect(listDocumentPackages()).rejects.toMatchObject({ status: 404 });
      await expect(createDocumentPackage({ title: "Pacchetto" })).rejects.toMatchObject({ status: 404 });
      await expect(addDocumentPackageItem("package-1", { itemType: "NOTE", note: "Nota" })).rejects.toMatchObject({ status: 404 });
    }
  });

  it("rejects cross-organization packages and archived references", async () => {
    mocks.db.documentPackage.findFirst.mockResolvedValue(null);
    await expect(getDocumentPackage("foreign-package")).rejects.toMatchObject({ status: 404 });
    expect(mocks.db.documentPackage.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "foreign-package", organizationId: "org-1", archivedAt: null },
    }));

    mocks.db.documentPackage.findFirst.mockResolvedValue(packageRecord);
    mocks.db.document.findFirst.mockResolvedValue(null);
    await expect(addDocumentPackageItem("package-1", { itemType: "DOCUMENT", documentId: "foreign-document" })).rejects.toMatchObject({ status: 404 });
  });

  it("validates package items and removes them with physical delete because item has no archivedAt", async () => {
    await expect(addDocumentPackageItem("package-1", { itemType: "DOCUMENT" })).rejects.toMatchObject({ status: 409 });
    await expect(addDocumentPackageItem("package-1", { itemType: "DOCUMENT", evidenceId: "evidence-1" })).rejects.toMatchObject({ status: 409 });
    mocks.db.documentPackageItem.findFirst.mockResolvedValueOnce({ id: "duplicate" });
    await expect(addDocumentPackageItem("package-1", { itemType: "DOCUMENT_VERSION", documentVersionId: "version-1" })).rejects.toMatchObject({ status: 409 });

    mocks.db.documentPackageItem.findFirst.mockResolvedValue(itemRecord);
    mocks.db.documentPackageItem.delete.mockResolvedValue(itemRecord);
    await expect(removeDocumentPackageItem("package-1", "item-1")).resolves.toEqual(itemRecord);
    expect(mocks.db.documentPackageItem.delete).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "item-1" } }));
  });
});

describe("share link and destinatario esterno access", () => {
  it("creates share links with hashed token only and default expiry", async () => {
    mocks.db.shareLink.create.mockImplementation(async ({ data }) => ({
      ...shareLinkRecord,
      organizationId: data.organizationId,
      documentPackageId: data.documentPackageId,
      expiresAt: data.expiresAt,
      createdById: data.createdById,
    }));
    mocks.db.documentPackage.update.mockResolvedValue({ id: "package-1" });

    const response = await createShareLink("package-1");

    expect(response.token).toEqual(expect.any(String));
    expect(response.shareLink).not.toHaveProperty("tokenHash");
    expect(mocks.db.shareLink.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        organizationId: "org-1",
        documentPackageId: "package-1",
        tokenHash: hashShareToken(response.token),
        expiresAt: expect.any(Date),
      }),
    }));
    expect(mocks.db.shareLink.create.mock.calls[0][0].data).not.toHaveProperty("token");
    expect(mocks.db.documentPackage.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: "SHARED" } }));
  });

  it("rejects past share link expiry and revokes links without deleting them", async () => {
    await expect(createShareLink("package-1", { expiresAt: "2020-01-01T00:00:00.000Z" })).rejects.toMatchObject({ status: 409 });

    mocks.db.shareLink.findFirst.mockResolvedValue({ id: "share-1" });
    mocks.db.shareLink.update.mockResolvedValue({ ...shareLinkRecord, revokedAt: now });
    await expect(revokeShareLink("package-1", "share-1")).resolves.toMatchObject({ revokedAt: now });
    expect(mocks.db.shareLink.update).toHaveBeenCalledWith(expect.objectContaining({ data: { revokedAt: expect.any(Date) } }));
  });

  it("lists share links without raw tokens or token hashes", async () => {
    mocks.db.shareLink.findMany.mockResolvedValue([shareLinkRecord]);
    const links = await listShareLinks("package-1");
    expect(links[0]).not.toHaveProperty("token");
    expect(links[0]).not.toHaveProperty("tokenHash");
  });

  it("lets a valid token read only included destinatario esterno-safe package data", async () => {
    const token = "raw-token";
    mocks.db.shareLink.findUnique.mockResolvedValue({
      ...shareLinkRecord,
      tokenHash: hashShareToken(token),
      documentPackage: packageRecord,
    });
    mocks.db.documentPackageItem.findMany.mockResolvedValue([
      {
        ...itemRecord,
        document: null,
        documentVersion: {
          originalFileName: "file.pdf",
          mimeType: "application/pdf",
          size: 12,
          archivedAt: null,
          document: { title: "Documento", status: "TO_REVIEW", archivedAt: null },
        },
        evidence: null,
        checklist: null,
      },
    ]);
    mocks.db.shareLink.update.mockResolvedValue({ id: "share-1" });

    const shared = await getSharedDocumentPackage(token);
    expect(shared).toMatchObject({ title: "Pacchetto ingresso", items: [expect.objectContaining({ hasFile: true, originalFileName: "file.pdf" })] });
    expect(shared).not.toHaveProperty("organizationId");
    expect(JSON.stringify(shared)).not.toContain("blobKey");
    expect(JSON.stringify(shared)).not.toContain("tokenHash");
  });

  it("denies expired, revoked and archived package share links", async () => {
    mocks.db.shareLink.findUnique.mockResolvedValue({ ...shareLinkRecord, expiresAt: new Date("2020-01-01T00:00:00.000Z"), documentPackage: packageRecord });
    await expect(getSharedDocumentPackage("expired")).rejects.toMatchObject({ status: 404 });

    mocks.db.shareLink.findUnique.mockResolvedValue({ ...shareLinkRecord, revokedAt: now, documentPackage: packageRecord });
    await expect(getSharedDocumentPackage("revoked")).rejects.toMatchObject({ status: 404 });

    mocks.db.shareLink.findUnique.mockResolvedValue({ ...shareLinkRecord, documentPackage: { ...packageRecord, archivedAt: now } });
    await expect(getSharedDocumentPackage("archived")).rejects.toMatchObject({ status: 404 });
  });

  it("downloads only included document versions or evidence through Blob without permanent URLs", async () => {
    mocks.db.shareLink.findUnique.mockResolvedValue({ ...shareLinkRecord, documentPackage: packageRecord });
    mocks.db.documentPackageItem.findFirst.mockResolvedValue({ id: "item-1", itemType: "DOCUMENT_VERSION", documentVersionId: "version-1", evidenceId: null });
    const stream = new ReadableStream<Uint8Array>();
    mocks.getPrivateBlob.mockResolvedValue({ stream, contentType: "application/pdf", size: 12 });
    mocks.db.shareLink.update.mockResolvedValue({ id: "share-1" });

    const documentDownload = await getSharedPackageItemDownload("token", "item-1");
    expect(documentDownload).toMatchObject({ stream, originalFileName: "file.pdf", mimeType: "application/pdf" });

    mocks.db.documentPackageItem.findFirst.mockResolvedValue({ id: "item-2", itemType: "EVIDENCE", documentVersionId: null, evidenceId: "evidence-1" });
    const evidenceDownload = await getSharedPackageItemDownload("token", "item-2");
    expect(evidenceDownload).toMatchObject({ stream, originalFileName: "foto.png", mimeType: "image/png" });
  });

  it("denies destinatario esterno download for items not included or archived files", async () => {
    mocks.db.shareLink.findUnique.mockResolvedValue({ ...shareLinkRecord, documentPackage: packageRecord });
    mocks.db.documentPackageItem.findFirst.mockResolvedValue(null);
    await expect(getSharedPackageItemDownload("token", "missing-item")).rejects.toMatchObject({ status: 404 });

    mocks.db.documentPackageItem.findFirst.mockResolvedValue({ id: "item-1", itemType: "DOCUMENT_VERSION", documentVersionId: "version-1", evidenceId: null });
    mocks.db.documentVersion.findFirst.mockResolvedValue(null);
    await expect(getSharedPackageItemDownload("token", "item-1")).rejects.toMatchObject({ status: 404 });
  });
});
