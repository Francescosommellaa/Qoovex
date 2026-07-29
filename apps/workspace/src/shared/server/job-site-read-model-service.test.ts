import type { WorkspaceAccessContext } from "@qoovex/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    jobSite: { findMany: vi.fn() },
    contextTimelineEvent: { findMany: vi.fn() },
  },
  getResourceScope: vi.fn(),
  recordSupportAccess: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: mocks.db }));
vi.mock("./resource-scope-service", () => ({ getResourceScope: mocks.getResourceScope, canReadJobSite: vi.fn() }));
vi.mock("@shared/server/support-access-service", () => ({ recordSupportAccess: mocks.recordSupportAccess }));
vi.mock("./domain-access-service", () => ({ requireOrganizationDomainAccess: vi.fn() }));

import { listWorkspaceJobSiteNavigation } from "./job-site-read-model-service";

function context(permissions: WorkspaceAccessContext["permissions"]): WorkspaceAccessContext {
  return {
    userId: "user-1",
    platformRole: "USER",
    company: { role: "COLLABORATOR", organization: { id: "org-1", name: "Impresa", code: "QVX" } },
    support: null,
    permissions,
  };
}

function site(index: number) {
  return { id: `site-${index}`, name: `Cantiere ${index}`, operationalPhase: "IN_PROGRESS" as const, updatedAt: new Date(`2026-07-${20 - index}T10:00:00.000Z`) };
}

describe("workspace job-site navigation read model", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getResourceScope.mockResolvedValue({ organizationId: "org-1", fullAccess: true, visibleJobSiteIds: [] });
    mocks.db.jobSite.findMany.mockResolvedValue([1, 2, 3, 4, 5, 6, 7].map(site));
    mocks.db.contextTimelineEvent.findMany.mockResolvedValue([]);
  });

  it("uses a tenant-safe bounded query and returns at most six recently modified sites", async () => {
    const result = await listWorkspaceJobSiteNavigation(context(["jobSites:read", "contextMessages:read"]));

    expect(result).toHaveLength(6);
    expect(mocks.db.jobSite.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-1", archivedAt: null, operationalPhase: { not: "COMPLETED" } },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      take: 6,
    }));
    expect(mocks.db.contextTimelineEvent.findMany).toHaveBeenCalledTimes(1);
    expect(mocks.recordSupportAccess).toHaveBeenCalledWith(expect.objectContaining({ resourceType: "workspace-job-sites-navigation" }));
  });

  it("preserves assigned scope and caps updates at three per site with constant query count", async () => {
    mocks.getResourceScope.mockResolvedValue({ organizationId: "org-1", fullAccess: false, visibleJobSiteIds: ["site-1", "site-2"] });
    mocks.db.jobSite.findMany.mockResolvedValue([site(1), site(2)]);
    mocks.db.contextTimelineEvent.findMany.mockResolvedValue([1, 2, 3, 4].map((index) => ({
      id: `event-${index}`,
      targetId: "site-1",
      title: `Evento ${index}`,
      summary: null,
      eventType: "CONTEXT_MESSAGE_ADDED",
      occurredAt: new Date(`2026-07-2${index}T10:00:00.000Z`),
    })));

    const result = await listWorkspaceJobSiteNavigation(context(["jobSites:read", "contextMessages:read"]));

    expect(mocks.db.jobSite.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { organizationId: "org-1", archivedAt: null, operationalPhase: { not: "COMPLETED" }, id: { in: ["site-1", "site-2"] } } }));
    expect(result[0]?.updates).toHaveLength(3);
    expect(mocks.db.jobSite.findMany).toHaveBeenCalledTimes(1);
    expect(mocks.db.contextTimelineEvent.findMany).toHaveBeenCalledTimes(1);
  });

  it("does not expose sites or timeline data without the existing permissions", async () => {
    await expect(listWorkspaceJobSiteNavigation(context([]))).resolves.toEqual([]);
    expect(mocks.getResourceScope).not.toHaveBeenCalled();
    expect(mocks.db.jobSite.findMany).not.toHaveBeenCalled();

    await listWorkspaceJobSiteNavigation(context(["jobSites:read"]));
    expect(mocks.db.contextTimelineEvent.findMany).not.toHaveBeenCalled();
  });
});
