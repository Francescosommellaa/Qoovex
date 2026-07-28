import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: { document: { groupBy: vi.fn(), count: vi.fn(), findMany: vi.fn() } },
  requireOrganizationDomainAccess: vi.fn(),
  getResourceScope: vi.fn(),
  buildMissing: vi.fn(),
  recordSupportAccess: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: mocks.db }));
vi.mock("./domain-access-service", () => ({ requireOrganizationDomainAccess: mocks.requireOrganizationDomainAccess }));
vi.mock("./resource-scope-service", () => ({ getResourceScope: mocks.getResourceScope }));
vi.mock("./document-requirement-service", () => ({ buildMissingDocumentRequirementItemsForScope: mocks.buildMissing }));
vi.mock("./support-access-service", () => ({ recordSupportAccess: mocks.recordSupportAccess }));
vi.mock("./document-service", () => ({ documentListSelect: { id: true }, toDocumentListRecord: (document: unknown) => document }));

import { getDocumentOverview } from "./document-overview-service";

describe("document overview service", () => {
  beforeEach(() => {
    for (const method of Object.values(mocks.db.document)) method.mockReset();
    mocks.requireOrganizationDomainAccess.mockReset().mockResolvedValue({ context: { userId: "user-1", permissions: ["documents:read", "documents:sensitive:read"] }, organizationId: "org-1", actorRole: "OWNER" });
    mocks.getResourceScope.mockReset().mockResolvedValue({ fullAccess: true, actorRole: "OWNER", preset: null, siteManagerJobSiteIds: [], visibleJobSiteIds: [], linkedWorker: null });
    mocks.buildMissing.mockReset().mockResolvedValue([]);
    mocks.recordSupportAccess.mockReset().mockResolvedValue(undefined);
    mocks.db.document.groupBy.mockResolvedValue([{ ownerType: "ORGANIZATION", status: "PRESENT", _count: { _all: 7 } }]);
    mocks.db.document.count.mockResolvedValue(2);
    mocks.db.document.findMany.mockResolvedValue([]);
  });

  it("uses three bounded document operations and one aggregated missing-items flow", async () => {
    const visibleTargets = { workers: [{ id: "worker-1", displayName: "Mario" }], jobSites: [{ id: "site-1", name: "Cantiere" }] };
    await expect(getDocumentOverview(visibleTargets)).resolves.toMatchObject({ byOwner: { ORGANIZATION: 7 }, byStatus: { PRESENT: 7 }, unclassifiedCount: 2 });

    expect(mocks.db.document.groupBy).toHaveBeenCalledTimes(1);
    expect(mocks.db.document.count).toHaveBeenCalledTimes(1);
    expect(mocks.db.document.findMany).toHaveBeenCalledTimes(1);
    expect(mocks.buildMissing).toHaveBeenCalledTimes(1);
    expect(mocks.buildMissing).toHaveBeenCalledWith(expect.objectContaining({ visibleTargets }));
    expect(mocks.db.document.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 6 }));
  });

  it("adds role and sensitivity scope before every overview operation", async () => {
    mocks.requireOrganizationDomainAccess.mockResolvedValue({ context: { userId: "manager-1", permissions: ["documents:read"] }, organizationId: "org-1", actorRole: "COLLABORATOR" });
    mocks.getResourceScope.mockResolvedValue({ fullAccess: false, actorRole: "COLLABORATOR", preset: "SITE_MANAGER", siteManagerJobSiteIds: ["site-1"], visibleJobSiteIds: ["site-1"], linkedWorker: null });

    await getDocumentOverview();

    expect(mocks.db.document.groupBy).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ organizationId: "org-1", OR: [{ ownerType: "JOB_SITE", jobSiteId: { in: ["site-1"] } }], AND: expect.any(Array) }) }));
  });
});
