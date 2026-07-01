import type { OrganizationRole } from "@qoovex/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    worker: { findMany: vi.fn(), create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    jobSite: { findMany: vi.fn(), create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
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

import { archiveJobSite, createJobSite, getJobSite, listJobSites, updateJobSite } from "./job-site-service";
import { archiveWorker, createWorker, getWorker, listWorkers, updateWorker } from "./worker-service";

const now = new Date("2026-06-30T12:00:00.000Z");

const workerRecord = {
  id: "worker-1",
  organizationId: "org-1",
  displayName: "Mario Rossi",
  email: "mario@example.com",
  phone: null,
  roleLabel: "Operativo",
  status: "ACTIVE",
  notes: null,
  createdAt: now,
  updatedAt: now,
  archivedAt: null,
};

const jobSiteRecord = {
  id: "jobsite-1",
  organizationId: "org-1",
  name: "Cantiere Centro",
  address: "Via Roma 1",
  clientName: "Cliente",
  status: "ACTIVE",
  startDate: new Date("2026-07-01T00:00:00.000Z"),
  endDate: null,
  notes: null,
  createdAt: now,
  updatedAt: now,
  archivedAt: null,
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

beforeEach(() => {
  resetModel(mocks.db.worker);
  resetModel(mocks.db.jobSite);
  mocks.getViewerContext.mockReset();
  mocks.getContextOrganizationId.mockReset();
  mocks.requirePermission.mockReset();
  mocks.recordSupportAccess.mockReset();
  mocks.getContextOrganizationId.mockReturnValue("org-1");
  mocks.requirePermission.mockImplementation(() => undefined);
  mocks.recordSupportAccess.mockResolvedValue(undefined);
  setRole("OWNER");
});

describe("worker service", () => {
  it("lets owners create, read, update and archive workers", async () => {
    mocks.db.worker.create.mockResolvedValue(workerRecord);
    mocks.db.worker.findMany.mockResolvedValue([workerRecord]);
    mocks.db.worker.findFirst.mockResolvedValue({ id: "worker-1" });
    mocks.db.worker.update.mockResolvedValue({ ...workerRecord, displayName: "Mario Bianchi" });

    await expect(createWorker({ displayName: " Mario Rossi ", email: "MARIO@EXAMPLE.COM" })).resolves.toMatchObject({ email: "mario@example.com" });
    await expect(listWorkers()).resolves.toEqual([workerRecord]);
    await expect(getWorker("worker-1")).resolves.toMatchObject({ id: "worker-1" });
    await expect(updateWorker("worker-1", { displayName: "Mario Bianchi" })).resolves.toMatchObject({ displayName: "Mario Bianchi" });
    await expect(archiveWorker("worker-1")).resolves.toMatchObject({ displayName: "Mario Bianchi" });

    expect(mocks.db.worker.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-1", archivedAt: null },
    }));
    expect(mocks.db.worker.update).toHaveBeenLastCalledWith(expect.objectContaining({
      where: { id: "worker-1" },
      data: expect.objectContaining({ archivedAt: expect.any(Date), status: "ARCHIVED" }),
    }));
  });

  it("lets admins manage workers and keeps safety consultants read-only", async () => {
    setRole("ADMIN");
    mocks.db.worker.create.mockResolvedValue(workerRecord);
    await expect(createWorker({ displayName: "Mario Rossi" })).resolves.toMatchObject({ id: "worker-1" });

    setRole("SAFETY_CONSULTANT");
    mocks.db.worker.findMany.mockResolvedValue([workerRecord]);
    await expect(listWorkers()).resolves.toEqual([workerRecord]);
    await expect(createWorker({ displayName: "Mario Rossi" })).rejects.toMatchObject({ status: 404 });
    await expect(updateWorker("worker-1", { displayName: "Mario" })).rejects.toMatchObject({ status: 404 });
    await expect(archiveWorker("worker-1")).rejects.toMatchObject({ status: 404 });
  });

  it("denies workers endpoint to site managers, workers and viewers", async () => {
    for (const role of ["SITE_MANAGER", "WORKER", "VIEWER"] as const) {
      setRole(role);
      await expect(listWorkers()).rejects.toMatchObject({ status: 404 });
      await expect(createWorker({ displayName: "Mario Rossi" })).rejects.toMatchObject({ status: 404 });
    }
    expect(mocks.db.worker.findMany).not.toHaveBeenCalled();
  });

  it("filters worker detail, update and archive by organization", async () => {
    mocks.db.worker.findFirst.mockResolvedValue(null);

    await expect(getWorker("worker-foreign")).rejects.toMatchObject({ status: 404 });
    await expect(updateWorker("worker-foreign", { displayName: "Mario" })).rejects.toMatchObject({ status: 404 });
    await expect(archiveWorker("worker-foreign")).rejects.toMatchObject({ status: 404 });

    expect(mocks.db.worker.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "worker-foreign", organizationId: "org-1", archivedAt: null },
    }));
  });

  it("rejects invalid worker input and sensitive fields", async () => {
    await expect(createWorker({ displayName: " " })).rejects.toMatchObject({ status: 409 });
    await expect(createWorker({ displayName: "Mario", email: "not-email" })).rejects.toMatchObject({ status: 409 });
    await expect(createWorker({ displayName: "Mario", status: "ENABLED" })).rejects.toMatchObject({ status: 409 });
    await expect(createWorker({ displayName: "Mario", status: "ARCHIVED" })).rejects.toMatchObject({ status: 409 });
    await expect(createWorker({ displayName: "Mario", healthData: "x" })).rejects.toMatchObject({ status: 409 });
    expect(mocks.db.worker.create).not.toHaveBeenCalled();
  });
});

describe("job site service", () => {
  it("lets owners create, read, update and archive job sites", async () => {
    mocks.db.jobSite.create.mockResolvedValue(jobSiteRecord);
    mocks.db.jobSite.findMany.mockResolvedValue([jobSiteRecord]);
    mocks.db.jobSite.findFirst.mockResolvedValue({ id: "jobsite-1", startDate: jobSiteRecord.startDate, endDate: null });
    mocks.db.jobSite.update.mockResolvedValue({ ...jobSiteRecord, name: "Cantiere Nord" });

    await expect(createJobSite({ name: " Cantiere Centro ", startDate: "2026-07-01" })).resolves.toMatchObject({ name: "Cantiere Centro" });
    await expect(listJobSites()).resolves.toEqual([jobSiteRecord]);
    await expect(getJobSite("jobsite-1")).resolves.toMatchObject({ id: "jobsite-1" });
    await expect(updateJobSite("jobsite-1", { name: "Cantiere Nord" })).resolves.toMatchObject({ name: "Cantiere Nord" });
    await expect(archiveJobSite("jobsite-1")).resolves.toMatchObject({ name: "Cantiere Nord" });

    expect(mocks.db.jobSite.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-1", archivedAt: null },
    }));
    expect(mocks.db.jobSite.update).toHaveBeenLastCalledWith(expect.objectContaining({
      where: { id: "jobsite-1" },
      data: expect.objectContaining({ archivedAt: expect.any(Date), status: "ARCHIVED" }),
    }));
  });

  it("lets admins manage job sites and keeps safety consultants read-only", async () => {
    setRole("ADMIN");
    mocks.db.jobSite.create.mockResolvedValue(jobSiteRecord);
    await expect(createJobSite({ name: "Cantiere Centro" })).resolves.toMatchObject({ id: "jobsite-1" });

    setRole("SAFETY_CONSULTANT");
    mocks.db.jobSite.findMany.mockResolvedValue([jobSiteRecord]);
    await expect(listJobSites()).resolves.toEqual([jobSiteRecord]);
    await expect(createJobSite({ name: "Cantiere Centro" })).rejects.toMatchObject({ status: 404 });
    await expect(updateJobSite("jobsite-1", { name: "Cantiere" })).rejects.toMatchObject({ status: 404 });
    await expect(archiveJobSite("jobsite-1")).rejects.toMatchObject({ status: 404 });
  });

  it("denies job site endpoint to site managers, workers and viewers", async () => {
    for (const role of ["SITE_MANAGER", "WORKER", "VIEWER"] as const) {
      setRole(role);
      await expect(listJobSites()).rejects.toMatchObject({ status: 404 });
      await expect(createJobSite({ name: "Cantiere Centro" })).rejects.toMatchObject({ status: 404 });
    }
    expect(mocks.db.jobSite.findMany).not.toHaveBeenCalled();
  });

  it("filters job site detail, update and archive by organization", async () => {
    mocks.db.jobSite.findFirst.mockResolvedValue(null);

    await expect(getJobSite("jobsite-foreign")).rejects.toMatchObject({ status: 404 });
    await expect(updateJobSite("jobsite-foreign", { name: "Cantiere" })).rejects.toMatchObject({ status: 404 });
    await expect(archiveJobSite("jobsite-foreign")).rejects.toMatchObject({ status: 404 });

    expect(mocks.db.jobSite.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "jobsite-foreign", organizationId: "org-1", archivedAt: null },
    }));
  });

  it("rejects invalid job site input, date ranges and coordinates", async () => {
    await expect(createJobSite({ name: " " })).rejects.toMatchObject({ status: 409 });
    await expect(createJobSite({ name: "Cantiere", status: "OPEN" })).rejects.toMatchObject({ status: 409 });
    await expect(createJobSite({ name: "Cantiere", status: "ARCHIVED" })).rejects.toMatchObject({ status: 409 });
    await expect(createJobSite({ name: "Cantiere", startDate: "2026-08-01", endDate: "2026-07-01" })).rejects.toMatchObject({ status: 409 });
    await expect(createJobSite({ name: "Cantiere", latitude: 45 })).rejects.toMatchObject({ status: 409 });
    expect(mocks.db.jobSite.create).not.toHaveBeenCalled();
  });
});
