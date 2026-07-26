import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    worker: { count: vi.fn(), findMany: vi.fn() },
    organizationMembership: { count: vi.fn(), findMany: vi.fn() },
    organizationInvitation: { count: vi.fn(), findMany: vi.fn() },
    jobSiteWorkerAssignment: { findMany: vi.fn() },
    jobSite: { findMany: vi.fn() },
  },
  requireAccess: vi.fn(),
  getResourceScope: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: mocks.db }));
vi.mock("./access-errors", () => ({
  AccessError: class AccessError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));
vi.mock("./domain-access-service", () => ({ requireOrganizationDomainAccess: mocks.requireAccess }));
vi.mock("./resource-scope-service", () => ({ getResourceScope: mocks.getResourceScope }));

import { getPeopleAccessOverview, getPeopleAssignmentsOverview, getPeopleOverview, listPeopleWorkers } from "./people-service";

const baseWorker = (id: string) => ({
  id,
  displayName: `Worker ${id}`,
  email: `${id}@example.com`,
  phone: "+39000",
  roleLabel: "Operaio",
  status: "ACTIVE",
  documents: [],
  deadlines: [],
  jobSiteAssignments: [],
  userLinks: [],
});

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireAccess.mockResolvedValue({ context: { userId: "owner-1" }, organizationId: "org-1", actorRole: "OWNER" });
  mocks.getResourceScope.mockResolvedValue({ actorRole: "OWNER", linkedWorker: null, siteManagerJobSiteIds: [] });
  mocks.db.worker.count.mockResolvedValue(2);
  mocks.db.worker.findMany.mockResolvedValue([baseWorker("one"), baseWorker("two")]);
  mocks.db.organizationMembership.count.mockResolvedValue(0);
  mocks.db.organizationMembership.findMany.mockResolvedValue([]);
  mocks.db.organizationInvitation.count.mockResolvedValue(0);
  mocks.db.organizationInvitation.findMany.mockResolvedValue([]);
  mocks.db.jobSiteWorkerAssignment.findMany.mockResolvedValue([]);
  mocks.db.jobSite.findMany.mockResolvedValue([]);
});

describe("People server read models", () => {
  it("loads a paginated worker directory with a fixed operation count and tenant filters", async () => {
    const result = await listPeopleWorkers({ page: "1", pageSize: "20", q: "worker" });
    expect(result.items).toHaveLength(2);
    expect(mocks.db.worker.count).toHaveBeenCalledOnce();
    expect(mocks.db.worker.findMany).toHaveBeenCalledOnce();
    expect(mocks.db.organizationInvitation.findMany).toHaveBeenCalledOnce();
    expect(mocks.db.organizationMembership.findMany).toHaveBeenCalledOnce();
    expect(mocks.db.worker.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ organizationId: "org-1", archivedAt: null }),
      skip: 0,
      take: 20,
    }));
  });

  it("adds one scoped assignment read for SITE_MANAGER without per-worker reads", async () => {
    mocks.getResourceScope.mockResolvedValue({ actorRole: "SITE_MANAGER", linkedWorker: null, siteManagerJobSiteIds: ["site-1"] });
    mocks.db.jobSiteWorkerAssignment.findMany.mockResolvedValue([{ workerId: "one" }, { workerId: "two" }]);
    await listPeopleWorkers();
    expect(mocks.db.jobSiteWorkerAssignment.findMany).toHaveBeenCalledOnce();
    expect(mocks.db.worker.findMany).toHaveBeenCalledOnce();
  });

  it("builds the overview in four aggregate operations", async () => {
    mocks.db.worker.findMany.mockResolvedValue([{ id: "one", documents: [] }, { id: "two", documents: [{ id: "doc-1" }] }]);
    const result = await getPeopleOverview();
    expect(result.cards.workers).toEqual({ total: 2, attention: 1 });
    expect(mocks.db.worker.findMany).toHaveBeenCalledOnce();
    expect(mocks.db.worker.count).toHaveBeenCalledOnce();
    expect(mocks.db.organizationMembership.count).toHaveBeenCalledOnce();
    expect(mocks.db.organizationInvitation.count).toHaveBeenCalledOnce();
  });

  it("loads access in two bounded reads and assignments in three bounded reads", async () => {
    await getPeopleAccessOverview();
    expect(mocks.db.organizationMembership.findMany).toHaveBeenCalledOnce();
    expect(mocks.db.organizationInvitation.findMany).toHaveBeenCalledOnce();
    vi.clearAllMocks();
    mocks.requireAccess.mockResolvedValue({ organizationId: "org-1", actorRole: "OWNER" });
    mocks.db.jobSite.findMany.mockResolvedValue([]);
    mocks.db.worker.findMany.mockResolvedValue([]);
    mocks.db.organizationMembership.findMany.mockResolvedValue([]);
    await getPeopleAssignmentsOverview();
    expect(mocks.db.jobSite.findMany).toHaveBeenCalledOnce();
    expect(mocks.db.worker.findMany).toHaveBeenCalledOnce();
    expect(mocks.db.organizationMembership.findMany).toHaveBeenCalledOnce();
  });
});
