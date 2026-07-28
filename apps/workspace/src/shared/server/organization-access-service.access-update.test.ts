import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  context: {
    userId: "owner-1",
    platformRole: "USER",
    company: { role: "OWNER", organization: { id: "org-1", name: "Azienda", code: "QVX" } },
    support: null,
    permissions: ["members:manage"],
  },
  db: {
    $transaction: vi.fn(),
    organizationMembership: { findFirst: vi.fn(), updateMany: vi.fn() },
    organizationMembershipResourceGrant: { deleteMany: vi.fn(), createMany: vi.fn() },
    user: { update: vi.fn() },
    session: { deleteMany: vi.fn() },
    securityAuditEvent: { create: vi.fn() },
  },
  getWorkspaceAccessContext: vi.fn(),
  requirePermission: vi.fn(),
  validateGrants: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: mocks.db }));
vi.mock("@shared/server/access-context-service", () => ({
  getWorkspaceAccessContext: mocks.getWorkspaceAccessContext,
  getContextOrganizationId: () => "org-1",
  requireIdentity: vi.fn(),
  requirePermission: mocks.requirePermission,
}));
vi.mock("@shared/server/access-errors", () => ({
  AccessError: class AccessError extends Error { constructor(message: string, public readonly status: number) { super(message); } },
}));
vi.mock("./organization-invitation-service", () => ({ validateOrganizationResourceGrants: mocks.validateGrants }));
vi.mock("./support-access-service", () => ({ recordSupportAccess: vi.fn() }));
vi.mock("@shared/server/support-access-service", () => ({ recordSupportAccess: vi.fn() }));
vi.mock("./product-audit-service", () => ({ auditActorFromContext: vi.fn(), recordProductAuditEventBestEffort: vi.fn() }));
vi.mock("./serializable-transaction", () => ({
  isPrismaKnownRequestError: vi.fn(),
  SerializableTransactionConflictError: class SerializableTransactionConflictError extends Error {},
  runSerializableTransaction: (callback: (tx: typeof mocks.db) => unknown) => callback(mocks.db),
}));

import { updateMemberAccess } from "./organization-access-service";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getWorkspaceAccessContext.mockResolvedValue(mocks.context);
  mocks.validateGrants.mockImplementation(async (_organizationId, grants) => grants);
  mocks.db.organizationMembership.findFirst.mockResolvedValue({
    id: "member-1",
    userId: "collaborator-1",
    permissionKeys: ["organization:read", "documents:read"],
    scopeMode: "ASSIGNED",
    expiresAt: null,
    accessVersion: 2,
  });
  mocks.db.organizationMembership.updateMany.mockResolvedValue({ count: 1 });
  mocks.db.organizationMembershipResourceGrant.deleteMany.mockResolvedValue({ count: 1 });
  mocks.db.organizationMembershipResourceGrant.createMany.mockResolvedValue({ count: 1 });
});

describe("organization collaborator access updates", () => {
  it("updates access atomically, replaces grants and invalidates sessions", async () => {
    await expect(updateMemberAccess("member-1", {
      expectedVersion: 2,
      preset: "DOCUMENT_REVIEWER",
      permissions: ["documents:verify"],
      scopeMode: "ASSIGNED",
      grants: [{ resourceType: "JOB_SITE", resourceId: "site-1" }],
    })).resolves.toEqual({ updated: true, accessVersion: 3 });

    expect(mocks.db.organizationMembership.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: "member-1", organizationId: "org-1", role: "COLLABORATOR", accessVersion: 2 }),
      data: expect.objectContaining({ accessVersion: { increment: 1 }, accessUpdatedById: "owner-1" }),
    }));
    expect(mocks.db.organizationMembershipResourceGrant.createMany).toHaveBeenCalledWith({ data: [expect.objectContaining({ organizationId: "org-1", membershipId: "member-1", resourceId: "site-1" })] });
    expect(mocks.db.session.deleteMany).toHaveBeenCalledWith({ where: { userId: "collaborator-1" } });
    expect(mocks.db.securityAuditEvent.create).toHaveBeenCalled();
  });

  it("rejects stale optimistic-concurrency versions", async () => {
    mocks.db.organizationMembership.updateMany.mockResolvedValue({ count: 0 });
    await expect(updateMemberAccess("member-1", {
      expectedVersion: 1,
      preset: "READ_ONLY",
      permissions: ["documents:read"],
      scopeMode: "FULL",
    })).rejects.toMatchObject({ status: 409 });
    expect(mocks.db.organizationMembershipResourceGrant.deleteMany).not.toHaveBeenCalled();
  });

  it("does not let a collaborator manage another collaborator", async () => {
    mocks.getWorkspaceAccessContext.mockResolvedValue({ ...mocks.context, company: { ...mocks.context.company, role: "COLLABORATOR" } });
    await expect(updateMemberAccess("member-1", {
      expectedVersion: 2,
      preset: "READ_ONLY",
      permissions: ["documents:read"],
      scopeMode: "FULL",
    })).rejects.toMatchObject({ status: 404 });
    expect(mocks.db.organizationMembership.findFirst).not.toHaveBeenCalled();
  });
});
