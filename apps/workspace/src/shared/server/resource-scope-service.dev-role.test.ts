import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WorkspaceAccessContext } from "@qoovex/types";

const mocks = vi.hoisted(() => ({ findMembership: vi.fn(), findWorkerLink: vi.fn(), findWorkerAssignments: vi.fn(), findManagerAssignments: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@shared/server/access-errors", () => ({ AccessError: class AccessError extends Error { constructor(message: string, public readonly status: number) { super(message); } } }));
vi.mock("@qoovex/db", () => ({ db: {
  organizationMembership: { findFirst: mocks.findMembership }, workerUserLink: { findFirst: mocks.findWorkerLink },
  jobSiteWorkerAssignment: { findMany: mocks.findWorkerAssignments }, jobSiteUserAssignment: { findMany: mocks.findManagerAssignments },
} }));
import { getResourceScope } from "./resource-scope-service";

function context(): WorkspaceAccessContext {
  return { userId: "dev-user", platformRole: "USER", devView: "BUSINESS", company: { role: "COLLABORATOR", preset: "LIMITED_UPLOAD", scopeMode: "ASSIGNED", organization: { id: "org-1", name: "Azienda", code: "DEV" } }, support: null, permissions: ["organization:read"] };
}

beforeEach(() => {
  mocks.findMembership.mockReset().mockResolvedValue({ id: "membership-1", resourceGrants: [] });
  mocks.findWorkerLink.mockReset().mockResolvedValue({ worker: { id: "worker-1", displayName: "Mario Rossi", roleLabel: "Operativo", status: "ACTIVE" } });
  mocks.findWorkerAssignments.mockReset().mockResolvedValue([{ jobSiteId: "site-1" }]);
  mocks.findManagerAssignments.mockReset().mockResolvedValue([]);
});

describe("dev resource scope", () => {
  it("keeps the signed Owner view bound to the persistent identity", async () => {
    const scope = await getResourceScope(context());
    expect(mocks.findWorkerLink).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ organizationId: "org-1", userId: "dev-user" }) }));
    expect(scope.linkedWorker?.id).toBe("worker-1");
    expect(scope.visibleJobSiteIds).toEqual(["site-1"]);
  });
});
