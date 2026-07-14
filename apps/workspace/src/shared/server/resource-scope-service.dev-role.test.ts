import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WorkspaceAccessContext } from "@qoovex/types";

const mocks = vi.hoisted(() => ({
  findScopedMembership: vi.fn(),
  findWorkerLink: vi.fn(),
  findWorkerAssignments: vi.fn(),
  findManagerAssignments: vi.fn(),
  isCurrentDevAuthIdentity: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("./dev-auth", () => ({ isCurrentDevAuthIdentity: mocks.isCurrentDevAuthIdentity }));
vi.mock("@shared/server/access-errors", () => ({
  AccessError: class AccessError extends Error {
    constructor(message: string, public readonly status: number) {
      super(message);
    }
  },
}));
vi.mock("@qoovex/db", () => ({
  db: {
    organizationMembership: { findFirst: mocks.findScopedMembership },
    workerUserLink: { findFirst: mocks.findWorkerLink },
    jobSiteWorkerAssignment: { findMany: mocks.findWorkerAssignments },
    jobSiteUserAssignment: { findMany: mocks.findManagerAssignments },
  },
}));

import { getResourceScope } from "./resource-scope-service";

function context(role: "SITE_MANAGER" | "WORKER", platformRole: "USER" | "SUPER_ADMIN"): WorkspaceAccessContext {
  return {
    userId: "dev-user",
    platformRole,
    company: { role, organization: { id: "org-1", name: "Azienda", code: "DEV" } },
    support: null,
    permissions: ["organization:read"],
  };
}

beforeEach(() => {
  mocks.findScopedMembership.mockReset().mockResolvedValue({ userId: "scoped-worker" });
  mocks.findWorkerLink.mockReset().mockResolvedValue({
    worker: { id: "worker-1", displayName: "Mario Rossi", roleLabel: "Operativo", status: "ACTIVE" },
  });
  mocks.findWorkerAssignments.mockReset().mockResolvedValue([{ jobSiteId: "site-1" }]);
  mocks.findManagerAssignments.mockReset().mockResolvedValue([]);
  mocks.isCurrentDevAuthIdentity.mockReset().mockResolvedValue(true);
});

describe("dev role resource scope", () => {
  it("uses an active membership of the simulated scoped role", async () => {
    const scope = await getResourceScope(context("WORKER", "SUPER_ADMIN"));

    expect(mocks.findScopedMembership).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ organizationId: "org-1", role: "WORKER", revokedAt: null }),
    }));
    expect(mocks.findWorkerLink).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ organizationId: "org-1", userId: "scoped-worker" }),
    }));
    expect(scope.linkedWorker?.id).toBe("worker-1");
    expect(scope.visibleJobSiteIds).toEqual(["site-1"]);
  });

  it("keeps ordinary scoped users bound to their own identity", async () => {
    await getResourceScope(context("WORKER", "USER"));

    expect(mocks.findScopedMembership).not.toHaveBeenCalled();
    expect(mocks.isCurrentDevAuthIdentity).not.toHaveBeenCalled();
    expect(mocks.findWorkerLink).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ userId: "dev-user" }),
    }));
  });
});
