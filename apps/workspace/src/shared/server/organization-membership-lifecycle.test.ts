import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    organizationMembership: { findUnique: vi.fn() },
    organizationInvitation: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
  tx: {
    organization: { create: vi.fn() },
    organizationMembership: { create: vi.fn(), updateMany: vi.fn() },
    organizationInvitation: { update: vi.fn() },
    user: { update: vi.fn() },
  },
  requireIdentity: vi.fn(),
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
  requireIdentity: mocks.requireIdentity,
  getContextOrganizationId: vi.fn(),
  getWorkspaceAccessContext: vi.fn(),
  requirePermission: vi.fn(),
}));
vi.mock("@shared/server/authorization-policy", () => ({ canInviteRole: vi.fn(), canRevokeRole: vi.fn() }));
vi.mock("@shared/server/transactional-email-service", () => ({ sendTransactionalEmail: vi.fn() }));
vi.mock("@shared/server/support-access-service", () => ({ recordSupportAccess: vi.fn() }));

import { createOrganization } from "./organization-access-service";
import { acceptInvitation } from "./organization-invitation-service";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireIdentity.mockResolvedValue({ id: "user-1", email: "user@example.com", emailVerified: new Date() });
  mocks.db.$transaction.mockImplementation(async (callback: (tx: typeof mocks.tx) => unknown) => callback(mocks.tx));
  mocks.tx.organization.create.mockResolvedValue({ id: "org-new", name: "Nuova Azienda", code: "QVX-NEW" });
  mocks.tx.organizationMembership.updateMany.mockResolvedValue({ count: 1 });
  mocks.tx.organizationInvitation.update.mockResolvedValue({ id: "invite-1" });
  mocks.tx.user.update.mockResolvedValue({ id: "user-1" });
});

describe("single organization membership lifecycle", () => {
  it("rejects a second active membership", async () => {
    mocks.db.organizationMembership.findUnique.mockResolvedValue({ id: "membership-1", revokedAt: null });
    await expect(createOrganization("Nuova Azienda")).rejects.toMatchObject({ status: 409 });
  });

  it("reuses a revoked row when creating an organization", async () => {
    mocks.db.organizationMembership.findUnique.mockResolvedValue({ id: "membership-1", revokedAt: new Date() });
    await expect(createOrganization("Nuova Azienda")).resolves.toMatchObject({ id: "org-new" });
    expect(mocks.tx.organizationMembership.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", revokedAt: { not: null } },
      data: { organizationId: "org-new", role: "OWNER", revokedAt: null },
    });
    expect(mocks.tx.organizationMembership.create).not.toHaveBeenCalled();
  });

  it("reassigns a revoked membership when accepting an invitation", async () => {
    mocks.db.organizationMembership.findUnique.mockResolvedValue({ revokedAt: new Date() });
    mocks.db.organizationInvitation.findUnique.mockResolvedValue({
      id: "invite-1",
      email: "user@example.com",
      role: "WORKER",
      organizationId: "org-invite",
      expiresAt: new Date(Date.now() + 60_000),
      acceptedAt: null,
      revokedAt: null,
    });

    await expect(acceptInvitation("token")).resolves.toEqual({ accepted: true });
    expect(mocks.tx.organizationMembership.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", revokedAt: { not: null } },
      data: { organizationId: "org-invite", role: "WORKER", revokedAt: null },
    });
  });

  it("rejects a concurrent claim of a revoked membership", async () => {
    mocks.db.organizationMembership.findUnique
      .mockResolvedValueOnce({ revokedAt: new Date() })
      .mockResolvedValueOnce({ revokedAt: null });
    mocks.db.organizationInvitation.findUnique.mockResolvedValue({
      id: "invite-1",
      email: "user@example.com",
      role: "WORKER",
      organizationId: "org-invite",
      expiresAt: new Date(Date.now() + 60_000),
      acceptedAt: null,
      revokedAt: null,
    });
    mocks.tx.organizationMembership.updateMany.mockResolvedValue({ count: 0 });

    await expect(acceptInvitation("token")).rejects.toMatchObject({ status: 409 });
    expect(mocks.tx.organizationInvitation.update).not.toHaveBeenCalled();
  });
});
