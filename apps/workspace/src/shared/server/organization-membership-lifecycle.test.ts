import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
    constructor(public readonly code: string) {
      super(code);
      this.name = "PrismaClientKnownRequestError";
    }
  },
  db: {
    organizationMembership: { findUnique: vi.fn() },
    organizationInvitation: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
  tx: {
    organization: { create: vi.fn() },
    worker: { findFirst: vi.fn() },
    workerUserLink: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    organizationMembership: { findUnique: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
    organizationInvitation: { findUnique: vi.fn(), updateMany: vi.fn() },
    user: { update: vi.fn() },
  },
  requireIdentity: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({
  db: mocks.db,
  Prisma: {
    PrismaClientKnownRequestError: mocks.PrismaClientKnownRequestError,
    TransactionIsolationLevel: { Serializable: "Serializable" },
  },
}));
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
import { acceptInvitation, getInvitationPreview } from "./organization-invitation-service";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireIdentity.mockResolvedValue({ id: "user-1", email: "user@example.com", emailVerified: new Date() });
  mocks.db.$transaction.mockImplementation(async (callback: (tx: typeof mocks.tx) => unknown) => callback(mocks.tx));
  mocks.tx.organization.create.mockResolvedValue({ id: "org-new", name: "Nuova Azienda", code: "QVX-NEW" });
  mocks.tx.organizationMembership.updateMany.mockResolvedValue({ count: 1 });
  mocks.tx.organizationInvitation.updateMany.mockResolvedValue({ count: 1 });
  mocks.tx.user.update.mockResolvedValue({ id: "user-1" });
  mocks.tx.worker.findFirst.mockResolvedValue({ id: "worker-1" });
  mocks.tx.workerUserLink.findFirst.mockResolvedValue(null);
  mocks.tx.workerUserLink.create.mockResolvedValue({ id: "link-1" });
});

describe("single organization membership lifecycle", () => {
  it("returns only safe preview data for an active invitation", async () => {
    const expiresAt = new Date(Date.now() + 60_000);
    mocks.db.organizationInvitation.findUnique.mockResolvedValue({
      role: "WORKER",
      expiresAt,
      acceptedAt: null,
      revokedAt: null,
      organization: { name: "Azienda Demo" },
    });

    await expect(getInvitationPreview("token")).resolves.toEqual({
      organizationName: "Azienda Demo",
      role: "WORKER",
      expiresAt,
    });
  });

  it("does not preview expired or already used invitations", async () => {
    mocks.db.organizationInvitation.findUnique.mockResolvedValue({
      role: "WORKER",
      expiresAt: new Date(Date.now() - 60_000),
      acceptedAt: null,
      revokedAt: null,
      organization: { name: "Azienda Demo" },
    });
    await expect(getInvitationPreview("token")).resolves.toBeNull();
  });

  it("rejects a second active membership", async () => {
    mocks.tx.organizationMembership.findUnique.mockResolvedValue({ id: "membership-1", revokedAt: null });
    await expect(createOrganization("Nuova Azienda")).rejects.toMatchObject({ status: 409 });
    expect(mocks.db.$transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: "Serializable" });
    expect(mocks.tx.organization.create).not.toHaveBeenCalled();
  });

  it("reuses a revoked row when creating an organization", async () => {
    mocks.tx.organizationMembership.findUnique.mockResolvedValue({ id: "membership-1", revokedAt: new Date() });
    await expect(createOrganization("Nuova Azienda")).resolves.toMatchObject({ id: "org-new" });
    expect(mocks.tx.organizationMembership.updateMany).toHaveBeenCalledWith({
      where: { id: "membership-1", userId: "user-1", revokedAt: { not: null } },
      data: { organizationId: "org-new", role: "OWNER", revokedAt: null },
    });
    expect(mocks.tx.organizationMembership.create).not.toHaveBeenCalled();
  });

  it("reassigns a revoked membership when accepting an invitation", async () => {
    mocks.tx.organizationMembership.findUnique.mockResolvedValue({ id: "membership-1", revokedAt: new Date() });
    mocks.tx.organizationInvitation.findUnique.mockResolvedValue({
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
      where: { id: "membership-1", userId: "user-1", revokedAt: { not: null } },
      data: expect.objectContaining({ organizationId: "org-invite", role: "WORKER", preset: "LIMITED_UPLOAD", scopeMode: "ASSIGNED", revokedAt: null }),
    });
    expect(mocks.tx.organizationInvitation.updateMany).toHaveBeenCalledWith({
      where: { id: "invite-1", acceptedAt: null, revokedAt: null, expiresAt: { gt: expect.any(Date) } },
      data: { acceptedAt: expect.any(Date) },
    });
  });

  it("creates the WORKER profile link in the same Serializable acceptance transaction", async () => {
    mocks.tx.organizationMembership.findUnique.mockResolvedValue(null);
    mocks.tx.organizationInvitation.findUnique.mockResolvedValue({
      id: "invite-worker",
      email: "user@example.com",
      role: "WORKER",
      organizationId: "org-invite",
      workerId: "worker-1",
      invitedById: "owner-1",
      expiresAt: new Date(Date.now() + 60_000),
      acceptedAt: null,
      revokedAt: null,
    });

    await expect(acceptInvitation("token")).resolves.toEqual({ accepted: true });
    expect(mocks.tx.worker.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "worker-1", organizationId: "org-invite", archivedAt: null },
    }));
    expect(mocks.tx.workerUserLink.create).toHaveBeenCalledWith({
      data: {
        organizationId: "org-invite",
        workerId: "worker-1",
        userId: "user-1",
        linkedById: "owner-1",
      },
    });
    expect(mocks.tx.organizationInvitation.updateMany).toHaveBeenCalled();
  });

  it("does not consume the invitation when the automatic WORKER link fails", async () => {
    mocks.tx.organizationMembership.findUnique.mockResolvedValue(null);
    mocks.tx.organizationInvitation.findUnique.mockResolvedValue({
      id: "invite-worker",
      email: "user@example.com",
      role: "WORKER",
      organizationId: "org-invite",
      workerId: "worker-1",
      invitedById: "owner-1",
      expiresAt: new Date(Date.now() + 60_000),
      acceptedAt: null,
      revokedAt: null,
    });
    const linkError = new Error("link failed");
    mocks.tx.workerUserLink.create.mockRejectedValue(linkError);

    await expect(acceptInvitation("token")).rejects.toBe(linkError);
    expect(mocks.tx.organizationInvitation.updateMany).not.toHaveBeenCalled();
    expect(mocks.tx.user.update).not.toHaveBeenCalled();
  });

  it("rejects a concurrent claim of a revoked membership", async () => {
    mocks.tx.organizationMembership.findUnique.mockResolvedValue({ id: "membership-1", revokedAt: new Date() });
    mocks.tx.organizationInvitation.findUnique.mockResolvedValue({
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
    expect(mocks.tx.organizationInvitation.updateMany).not.toHaveBeenCalled();
  });

  it("retries a P2034 conflict and keeps Serializable isolation", async () => {
    mocks.tx.organizationMembership.findUnique.mockResolvedValue(null);
    mocks.db.$transaction
      .mockRejectedValueOnce(new mocks.PrismaClientKnownRequestError("P2034"))
      .mockImplementationOnce(async (callback: (tx: typeof mocks.tx) => unknown) => callback(mocks.tx));

    await expect(createOrganization("Nuova Azienda")).resolves.toMatchObject({ id: "org-new" });
    expect(mocks.db.$transaction).toHaveBeenCalledTimes(2);
    expect(mocks.db.$transaction).toHaveBeenNthCalledWith(2, expect.any(Function), { isolationLevel: "Serializable" });
  });

  it("does not retry non-retryable database errors", async () => {
    const databaseError = new Error("database unavailable");
    mocks.db.$transaction.mockRejectedValue(databaseError);

    await expect(createOrganization("Nuova Azienda")).rejects.toBe(databaseError);
    expect(mocks.db.$transaction).toHaveBeenCalledTimes(1);
  });

  it("maps an exhausted P2034 conflict to a safe 409", async () => {
    mocks.db.$transaction.mockRejectedValue(new mocks.PrismaClientKnownRequestError("P2034"));

    await expect(createOrganization("Nuova Azienda")).rejects.toMatchObject({
      status: 409,
      message: "Operazione concorrente. Riprova.",
    });
    expect(mocks.db.$transaction).toHaveBeenCalledTimes(5);
  });

  it("maps a membership P2002 race to 409 without retrying", async () => {
    mocks.db.$transaction.mockRejectedValue(new mocks.PrismaClientKnownRequestError("P2002"));
    mocks.db.organizationMembership.findUnique.mockResolvedValue({ revokedAt: null });

    await expect(acceptInvitation("token")).rejects.toMatchObject({ status: 409 });
    expect(mocks.db.$transaction).toHaveBeenCalledTimes(1);
  });

  it("retries a P2002 organization-code collision when no active membership exists", async () => {
    mocks.tx.organizationMembership.findUnique.mockResolvedValue(null);
    mocks.db.organizationMembership.findUnique.mockResolvedValue(null);
    mocks.db.$transaction
      .mockRejectedValueOnce(new mocks.PrismaClientKnownRequestError("P2002"))
      .mockImplementationOnce(async (callback: (tx: typeof mocks.tx) => unknown) => callback(mocks.tx));

    await expect(createOrganization("Nuova Azienda")).resolves.toMatchObject({ id: "org-new" });
    expect(mocks.db.$transaction).toHaveBeenCalledTimes(2);
  });

  it("rolls back the membership claim when the invitation cannot be consumed", async () => {
    mocks.tx.organizationMembership.findUnique.mockResolvedValue({ id: "membership-1", revokedAt: new Date() });
    mocks.tx.organizationInvitation.findUnique.mockResolvedValue({
      id: "invite-1",
      email: "user@example.com",
      role: "WORKER",
      organizationId: "org-invite",
      expiresAt: new Date(Date.now() + 60_000),
      acceptedAt: null,
      revokedAt: null,
    });
    mocks.tx.organizationInvitation.updateMany.mockResolvedValue({ count: 0 });

    await expect(acceptInvitation("token")).rejects.toMatchObject({ status: 410 });
    expect(mocks.tx.user.update).not.toHaveBeenCalled();
  });
});
