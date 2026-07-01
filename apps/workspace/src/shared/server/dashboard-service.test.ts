import type { OrganizationRole } from "@qoovex/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    document: { groupBy: vi.fn(), findMany: vi.fn() },
    deadline: { count: vi.fn(), findMany: vi.fn(), groupBy: vi.fn() },
    jobSite: { count: vi.fn(), findMany: vi.fn() },
    worker: { count: vi.fn(), findMany: vi.fn() },
    documentPackage: { count: vi.fn(), findMany: vi.fn() },
    evidence: { findMany: vi.fn() },
    checklist: { groupBy: vi.fn() },
  },
  getViewerContext: vi.fn(),
  getContextOrganizationId: vi.fn(),
  requirePermission: vi.fn(),
  recordSupportAccess: vi.fn(),
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

import { getDashboardData } from "./dashboard-service";

const now = new Date("2026-07-01T10:00:00.000Z");

function resetModel(model: Record<string, ReturnType<typeof vi.fn>>) {
  for (const method of Object.values(model)) method.mockReset();
}

function setRole(role: OrganizationRole) {
  mocks.getViewerContext.mockResolvedValue({
    userId: "user-1",
    platformRole: "USER",
    membership: { id: "member-1", role, organization: { id: "org-1", name: "Azienda Demo", code: "QVX-1" } },
    support: null,
    permissions: [],
  });
}

function primeDashboardMocks() {
  mocks.db.document.groupBy
    .mockResolvedValueOnce([
      { status: "MISSING", _count: { _all: 2 } },
      { status: "EXPIRED", _count: { _all: 1 } },
      { status: "EXPIRING_SOON", _count: { _all: 3 } },
      { status: "TO_REVIEW", _count: { _all: 4 } },
      { status: "PRESENT", _count: { _all: 5 } },
    ])
    .mockResolvedValueOnce([{ jobSiteId: "jobsite-1", _count: { _all: 2 } }])
    .mockResolvedValueOnce([{ workerId: "worker-1", _count: { _all: 1 } }]);
  mocks.db.deadline.groupBy.mockResolvedValue([{ workerId: "worker-1", _count: { _all: 1 } }]);
  mocks.db.checklist.groupBy.mockResolvedValue([{ jobSiteId: "jobsite-1", _count: { _all: 3 } }]);
  mocks.db.deadline.count.mockResolvedValue(2);
  mocks.db.jobSite.count.mockResolvedValue(1);
  mocks.db.worker.count.mockResolvedValue(1);
  mocks.db.documentPackage.count.mockResolvedValueOnce(1).mockResolvedValueOnce(1);
  mocks.db.deadline.findMany.mockResolvedValue([
    { id: "deadline-1", title: "Scadenza registrata", dueDate: now, sourceType: "MANUAL", status: "EXPIRING_SOON", documentId: null, workerId: "worker-1", jobSiteId: null },
  ]);
  mocks.db.document.findMany.mockResolvedValue([
    {
      id: "document-1",
      title: "Documento da verificare",
      status: "TO_REVIEW",
      ownerType: "WORKER",
      expiryDate: null,
      updatedAt: now,
      worker: { displayName: "Mario Rossi" },
      jobSite: null,
    },
  ]);
  mocks.db.jobSite.findMany.mockResolvedValue([{ id: "jobsite-1", name: "Cantiere Centro", status: "ACTIVE" }]);
  mocks.db.worker.findMany.mockResolvedValue([{ id: "worker-1", displayName: "Mario Rossi", status: "ACTIVE" }]);
  mocks.db.documentPackage.findMany.mockResolvedValue([
    { id: "package-1", title: "Pacchetto revisione", status: "READY_FOR_REVIEW", updatedAt: now, _count: { items: 2 }, shareLinks: [{ id: "share-1" }] },
  ]);
  mocks.db.evidence.findMany.mockResolvedValue([
    { id: "evidence-1", type: "PHOTO", title: "Foto collegata", blobKey: "private/blob/key", createdAt: now, jobSiteId: "jobsite-1" },
  ]);
}

beforeEach(() => {
  resetModel(mocks.db.document);
  resetModel(mocks.db.deadline);
  resetModel(mocks.db.jobSite);
  resetModel(mocks.db.worker);
  resetModel(mocks.db.documentPackage);
  resetModel(mocks.db.evidence);
  resetModel(mocks.db.checklist);
  mocks.getViewerContext.mockReset();
  mocks.getContextOrganizationId.mockReset();
  mocks.requirePermission.mockReset();
  mocks.recordSupportAccess.mockReset();

  mocks.getContextOrganizationId.mockReturnValue("org-1");
  mocks.requirePermission.mockImplementation(() => undefined);
  mocks.recordSupportAccess.mockResolvedValue(undefined);
  setRole("OWNER");
  primeDashboardMocks();
});

describe("dashboard service", () => {
  it("lets owners, admins and safety consultants read the dashboard", async () => {
    for (const role of ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] as const) {
      setRole(role);
      primeDashboardMocks();
      await expect(getDashboardData()).resolves.toMatchObject({ organization: { role } });
    }
  });

  it("denies broad dashboard access to site managers, workers and viewers", async () => {
    for (const role of ["SITE_MANAGER", "WORKER", "VIEWER"] as const) {
      setRole(role);
      await expect(getDashboardData()).rejects.toMatchObject({ status: 404 });
    }
  });

  it("filters every aggregate by organization and excludes archived records", async () => {
    await getDashboardData();

    expect(mocks.requirePermission).toHaveBeenCalledWith(expect.anything(), "organization:read");
    expect(mocks.db.document.groupBy).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ organizationId: "org-1", archivedAt: null }),
    }));
    expect(mocks.db.deadline.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ organizationId: "org-1", archivedAt: null }),
      orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    }));
    expect(mocks.db.jobSite.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-1", archivedAt: null },
    }));
    expect(mocks.db.worker.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-1", archivedAt: null },
    }));
    expect(mocks.db.documentPackage.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-1", archivedAt: null },
    }));
    expect(mocks.db.evidence.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-1", archivedAt: null },
    }));
  });

  it("returns document status counts and attention lists without sensitive fields", async () => {
    const dashboard = await getDashboardData();
    const serialized = JSON.stringify(dashboard);

    expect(dashboard.summary.documents).toEqual({
      present: 5,
      missing: 2,
      expired: 1,
      expiringSoon: 3,
      toReview: 4,
    });
    expect(dashboard.documentsToReview[0]).toMatchObject({
      title: "Documento da verificare",
      ownerLabel: "Mario Rossi",
      nextAction: "Verifica informazioni",
    });
    expect(serialized).not.toContain("blobKey");
    expect(serialized).not.toContain("tokenHash");
    expect(serialized).not.toContain("private/blob/key");
    expect(serialized).not.toContain("downloadUrl");
  });

  it("summarizes job sites, workers, packages and recent evidence", async () => {
    const dashboard = await getDashboardData();

    expect(dashboard.jobSites).toEqual([{ id: "jobsite-1", name: "Cantiere Centro", status: "ACTIVE", documentsToReview: 2, openChecklists: 3 }]);
    expect(dashboard.workers).toEqual([{ id: "worker-1", displayName: "Mario Rossi", status: "ACTIVE", documentsToReview: 1, openDeadlines: 1 }]);
    expect(dashboard.packages[0]).toMatchObject({ title: "Pacchetto revisione", itemCount: 2, hasActiveShareLink: true });
    expect(dashboard.recentEvidence).toEqual([{ id: "evidence-1", type: "PHOTO", title: "Foto collegata", hasFile: true, createdAt: now.toISOString(), jobSiteId: "jobsite-1" }]);
  });
});
