import type { OrganizationRole } from "@qoovex/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    $transaction: vi.fn(),
    worker: { findMany: vi.fn(), findFirst: vi.fn() },
    jobSite: { findMany: vi.fn(), findFirst: vi.fn() },
    organizationMembership: { findMany: vi.fn(), findFirst: vi.fn() },
    workerUserLink: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    jobSiteUserAssignment: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    jobSiteWorkerAssignment: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
  getWorkspaceAccessContext: vi.fn(),
  getContextOrganizationId: vi.fn(),
  requirePermission: vi.fn(),
  recordProductAuditEventBestEffort: vi.fn(),
  auditActorFromContext: vi.fn(),
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
vi.mock("./product-audit-service", () => ({
  recordProductAuditEventBestEffort: mocks.recordProductAuditEventBestEffort,
  auditActorFromContext: mocks.auditActorFromContext,
}));
vi.mock("./context-timeline-service", () => ({ appendContextTimelineEvent: mocks.appendContextTimelineEvent }));

import {
  archiveJobSiteUserAssignment,
  createJobSiteUserAssignment,
  createJobSiteWorkerAssignment,
  createWorkerUserLink,
  getResourceAssignmentOptions,
  listJobSiteUserAssignments,
  listJobSiteWorkerAssignments,
  listWorkerUserLinks,
} from "./resource-assignment-service";

const now = new Date("2026-07-08T08:00:00.000Z");
const user = { id: "user-worker", name: "Mario Utente", email: "mario@example.com" };
const worker = { id: "worker-1", displayName: "Mario Rossi", roleLabel: "Operativo", status: "ACTIVE" };
const jobSite = { id: "jobsite-1", name: "Cantiere Centro", status: "ACTIVE" };
const workerLink = {
  id: "link-1",
  workerId: "worker-1",
  userId: "user-worker",
  linkedById: "user-owner",
  createdAt: now,
  updatedAt: now,
  archivedAt: null,
  worker,
  user,
};
const jobSiteUserAssignment = {
  id: "assignment-1",
  jobSiteId: "jobsite-1",
  userId: "user-worker",
  assignmentRole: "SITE_MANAGER",
  assignedById: "user-owner",
  createdAt: now,
  updatedAt: now,
  archivedAt: null,
  jobSite,
  user,
};
const jobSiteWorkerAssignment = {
  id: "assignment-worker-1",
  jobSiteId: "jobsite-1",
  workerId: "worker-1",
  assignedById: "user-owner",
  createdAt: now,
  updatedAt: now,
  archivedAt: null,
  jobSite,
  worker,
};

function resetModel(model: Record<string, ReturnType<typeof vi.fn>>) {
  for (const method of Object.values(model)) method.mockReset();
}

function setRole(role: OrganizationRole) {
  mocks.getWorkspaceAccessContext.mockResolvedValue({
    userId: "user-owner",
    platformRole: "USER",
    company: { role, organization: { id: "org-1", name: "Azienda", code: "QVX-1" } },
    support: null,
    permissions: [],
  });
}

beforeEach(() => {
  for (const model of Object.values(mocks.db)) if (typeof model === "object") resetModel(model);
  vi.clearAllMocks();
  mocks.db.$transaction.mockImplementation(async (callback) => callback(mocks.db));
  mocks.appendContextTimelineEvent.mockResolvedValue({ id: "timeline-1" });
  mocks.getContextOrganizationId.mockReturnValue("org-1");
  mocks.requirePermission.mockImplementation(() => undefined);
  mocks.auditActorFromContext.mockReturnValue({ actorUserId: "user-owner", actorRole: "OWNER", supportSessionId: null });
  mocks.db.worker.findFirst.mockResolvedValue(worker);
  mocks.db.jobSite.findFirst.mockResolvedValue(jobSite);
  mocks.db.organizationMembership.findFirst.mockResolvedValue({ id: "member-worker", role: "COLLABORATOR", preset: "LIMITED_UPLOAD", permissionKeys: ["jobSites:read"], user });
  mocks.db.workerUserLink.findFirst.mockResolvedValue(null);
  mocks.db.jobSiteUserAssignment.findFirst.mockResolvedValue(null);
  mocks.db.jobSiteWorkerAssignment.findFirst.mockResolvedValue(null);
  mocks.db.workerUserLink.create.mockResolvedValue(workerLink);
  mocks.db.jobSiteUserAssignment.create.mockResolvedValue(jobSiteUserAssignment);
  mocks.db.jobSiteWorkerAssignment.create.mockResolvedValue(jobSiteWorkerAssignment);
  mocks.db.workerUserLink.findMany.mockResolvedValue([workerLink]);
  mocks.db.jobSiteUserAssignment.findMany.mockResolvedValue([jobSiteUserAssignment]);
  mocks.db.jobSiteWorkerAssignment.findMany.mockResolvedValue([jobSiteWorkerAssignment]);
  mocks.db.jobSiteUserAssignment.update.mockResolvedValue({ ...jobSiteUserAssignment, archivedAt: now });
  setRole("OWNER");
});

describe("resource assignment service", () => {
  it("returns only organization-scoped options for contextual assignment", async () => {
    mocks.db.worker.findMany.mockResolvedValue([worker]);
    mocks.db.jobSite.findMany.mockResolvedValue([jobSite]);
    mocks.db.organizationMembership.findMany.mockResolvedValue([
      { role: "COLLABORATOR", preset: "LIMITED_UPLOAD", permissionKeys: ["documents:upload"], user },
      { role: "COLLABORATOR", preset: "CUSTOM", permissionKeys: ["jobSites:read"], user: { id: "manager-1", name: "Elena Mariani", email: "elena@example.com" } },
    ]);

    await expect(getResourceAssignmentOptions()).resolves.toEqual({
      workers: [worker],
      jobSites: [jobSite],
      users: [
        { id: "user-worker", label: "Mario Utente", email: "mario@example.com", role: "COLLABORATOR", preset: "LIMITED_UPLOAD", permissionKeys: ["documents:upload"] },
        { id: "manager-1", label: "Elena Mariani", email: "elena@example.com", role: "COLLABORATOR", preset: "CUSTOM", permissionKeys: ["jobSites:read"] },
      ],
    });
    expect(mocks.db.worker.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { organizationId: "org-1", archivedAt: null } }));
    expect(mocks.db.jobSite.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { organizationId: "org-1", archivedAt: null } }));
  });

  it("lets owners create worker-user links and records product audit", async () => {
    await expect(createWorkerUserLink({ workerId: "worker-1", userId: "user-worker" })).resolves.toMatchObject({
      workerId: "worker-1",
      userId: "user-worker",
      workerDisplayName: "Mario Rossi",
    });
    expect(mocks.db.workerUserLink.create).toHaveBeenCalledWith(expect.objectContaining({
      data: { organizationId: "org-1", workerId: "worker-1", userId: "user-worker", linkedById: "user-owner" },
    }));
    expect(mocks.recordProductAuditEventBestEffort).toHaveBeenCalledWith(expect.objectContaining({
      action: "WORKER_USER_LINK_CREATED",
      entityType: "WORKER_USER_LINK",
    }));
  });

  it("keeps collaborators without management permission read-only for assignments", async () => {
    setRole("COLLABORATOR");
    mocks.requirePermission.mockImplementationOnce(() => undefined).mockImplementationOnce(() => {
      throw Object.assign(new Error("Azione non disponibile."), { status: 403 });
    });
    await expect(listWorkerUserLinks()).resolves.toHaveLength(1);
    await expect(createWorkerUserLink({ workerId: "worker-1", userId: "user-worker" })).rejects.toMatchObject({ status: 403 });
  });

  it("pushes detail-page assignment filters into tenant-scoped Prisma queries", async () => {
    await Promise.all([
      listWorkerUserLinks({ workerId: "worker-1" }),
      listJobSiteUserAssignments({ jobSiteId: "jobsite-1" }),
      listJobSiteWorkerAssignments({ jobSiteId: "jobsite-1", workerId: "worker-1" }),
    ]);

    expect(mocks.db.workerUserLink.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-1", archivedAt: null, workerId: "worker-1" },
    }));
    expect(mocks.db.jobSiteUserAssignment.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-1", archivedAt: null, jobSiteId: "jobsite-1" },
    }));
    expect(mocks.db.jobSiteWorkerAssignment.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-1", archivedAt: null, jobSiteId: "jobsite-1", workerId: "worker-1" },
    }));
  });

  it("rejects duplicates and cross-organization missing resources", async () => {
    mocks.db.workerUserLink.findFirst.mockResolvedValueOnce({ id: "existing" });
    await expect(createWorkerUserLink({ workerId: "worker-1", userId: "user-worker" })).rejects.toMatchObject({ status: 409 });

    mocks.db.workerUserLink.findFirst.mockResolvedValue(null);
    mocks.db.worker.findFirst.mockResolvedValueOnce(null);
    await expect(createWorkerUserLink({ workerId: "foreign-worker", userId: "user-worker" })).rejects.toMatchObject({ status: 404 });
  });

  it("uses persisted Collaborator permissions for job-site assignments and soft archives them", async () => {
    mocks.db.organizationMembership.findFirst.mockResolvedValueOnce({ id: "member-collaborator", role: "COLLABORATOR", preset: "CUSTOM", permissionKeys: ["jobSites:read"], user });
    await expect(createJobSiteUserAssignment({ jobSiteId: "jobsite-1", userId: "user-worker" })).resolves.toMatchObject({
      jobSiteId: "jobsite-1",
      assignmentRole: "SITE_MANAGER",
    });

    await expect(createJobSiteWorkerAssignment({ jobSiteId: "jobsite-1", workerId: "worker-1" })).resolves.toMatchObject({
      jobSiteId: "jobsite-1",
      workerId: "worker-1",
    });

    mocks.db.jobSiteUserAssignment.findFirst.mockResolvedValueOnce({ id: "assignment-1" });
    await expect(archiveJobSiteUserAssignment("assignment-1")).resolves.toMatchObject({ archived: true });
    expect(mocks.db.jobSiteUserAssignment.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ archivedAt: expect.any(Date), endsAt: expect.any(Date), endedById: "user-owner", endReason: expect.any(String) }),
    }));
  });

  it("rejects a job-site assignment when the Collaborator lacks the required persisted permission", async () => {
    mocks.db.organizationMembership.findFirst.mockResolvedValueOnce({ id: "member-collaborator", role: "COLLABORATOR", preset: "CUSTOM", permissionKeys: ["documents:read"], user });

    await expect(createJobSiteUserAssignment({ jobSiteId: "jobsite-1", userId: "user-worker" })).rejects.toMatchObject({
      status: 409,
      message: "Il Collaboratore non dispone dei permessi richiesti per questa assegnazione.",
    });
  });

  it("denies assignment management when the collaborator lacks the explicit permission", async () => {
    setRole("COLLABORATOR");
    mocks.requirePermission.mockImplementation(() => { throw Object.assign(new Error("Azione non disponibile."), { status: 403 }); });
    await expect(createWorkerUserLink({ workerId: "worker-1", userId: "user-worker" })).rejects.toMatchObject({ status: 403 });
  });
});
