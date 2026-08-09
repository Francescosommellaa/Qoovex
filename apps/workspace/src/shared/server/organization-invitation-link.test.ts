import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    user: { findUnique: vi.fn() },
    worker: { findFirst: vi.fn() },
    organizationInvitation: { findFirst: vi.fn() },
    $transaction: vi.fn(),
  },
  tx: {
    organizationInvitation: { findFirst: vi.fn(), updateMany: vi.fn(), create: vi.fn() },
  },
  getWorkspaceAccessContext: vi.fn(),
  getContextOrganizationId: vi.fn(),
  canInviteRole: vi.fn(),
  sendTransactionalEmail: vi.fn(),
  recordSupportAccess: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({
  db: mocks.db,
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {},
    TransactionIsolationLevel: { Serializable: "Serializable" },
  },
}));
vi.mock("@shared/server/access-errors", () => ({
  AccessError: class AccessError extends Error {
    constructor(message: string, public readonly status: number) {
      super(message);
      this.name = "AccessError";
    }
  },
}));
vi.mock("@shared/server/access-context-service", () => ({
  getWorkspaceAccessContext: mocks.getWorkspaceAccessContext,
  getContextOrganizationId: mocks.getContextOrganizationId,
  requireIdentity: vi.fn(),
}));
vi.mock("@shared/server/authorization-policy", () => ({
  canInviteRole: mocks.canInviteRole,
  getPermissionsForPreset: () => ["organization:read", "jobSites:read"],
  getPermissionsForRole: () => ["organization:read"],
  normalizeCollaboratorPermissions: (values: string[]) => values,
}));
vi.mock("@shared/server/transactional-email-service", () => ({ sendTransactionalEmail: mocks.sendTransactionalEmail }));
vi.mock("@shared/server/support-access-service", () => ({ recordSupportAccess: mocks.recordSupportAccess }));

import { createInvitation, resendInvitation } from "./organization-invitation-service";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("AUTH_URL", "https://app.qoovex.com/auth/");
  mocks.getWorkspaceAccessContext.mockResolvedValue({
    userId: "owner-1",
    company: { role: "OWNER", organization: { id: "org-1", name: "Azienda Demo", code: "DEMO" } },
    support: null,
  });
  mocks.getContextOrganizationId.mockReturnValue("org-1");
  mocks.canInviteRole.mockReturnValue(true);
  mocks.db.user.findUnique.mockResolvedValue(null);
  mocks.db.worker.findFirst.mockResolvedValue({ id: "worker-1", email: "worker@example.com", userLinks: [] });
  mocks.db.organizationInvitation.findFirst.mockResolvedValue(null);
  mocks.tx.organizationInvitation.findFirst.mockResolvedValue(null);
  mocks.db.$transaction.mockImplementation(async (callback: (tx: typeof mocks.tx) => unknown) => callback(mocks.tx));
  mocks.tx.organizationInvitation.create.mockResolvedValue({
    id: "invite-1",
    email: "worker@example.com",
    role: "COLLABORATOR",
    expiresAt: new Date("2026-07-20T10:00:00.000Z"),
    organization: { name: "Azienda Demo" },
  });
  mocks.tx.organizationInvitation.updateMany.mockResolvedValue({ count: 1 });
  mocks.sendTransactionalEmail.mockResolvedValue({ providerMessageId: "mail-1" });
});

describe("organization invitation recipient link", () => {
  it("sends a normalized URL backed by the invitation page", async () => {
    await createInvitation({ email: "worker@example.com", role: "COLLABORATOR", preset: "LIMITED_UPLOAD", workerId: "worker-1" });

    expect(mocks.sendTransactionalEmail).toHaveBeenCalledOnce();
    const input = mocks.sendTransactionalEmail.mock.calls[0]?.[0] as {
      template: { acceptUrl: string };
    };
    const url = new URL(input.template.acceptUrl);
    expect(url.origin).toBe("https://app.qoovex.com");
    expect(url.pathname).toBe("/invite");
    expect(url.searchParams.get("token")).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("requires an operational profile for the limited-upload preset", async () => {
    await expect(createInvitation({ email: "worker@example.com", role: "COLLABORATOR", preset: "LIMITED_UPLOAD" })).rejects.toMatchObject({ status: 409 });
    expect(mocks.db.$transaction).not.toHaveBeenCalled();
  });

  it("rejects a worker profile on a different access preset", async () => {
    await expect(createInvitation({ email: "admin@example.com", role: "COLLABORATOR", workerId: "worker-1" })).rejects.toMatchObject({ status: 409 });
    expect(mocks.db.worker.findFirst).not.toHaveBeenCalled();
  });

  it("rejects a worker outside the current tenant or already linked", async () => {
    mocks.db.worker.findFirst.mockResolvedValueOnce(null);
    await expect(createInvitation({ email: "worker@example.com", role: "COLLABORATOR", preset: "LIMITED_UPLOAD", workerId: "other-worker" })).rejects.toMatchObject({ status: 404 });
    mocks.db.worker.findFirst.mockResolvedValueOnce({ id: "worker-1", email: "worker@example.com", userLinks: [{ id: "link-1" }] });
    await expect(createInvitation({ email: "worker@example.com", role: "COLLABORATOR", preset: "LIMITED_UPLOAD", workerId: "worker-1" })).rejects.toMatchObject({ status: 409 });
  });

  it("rotates the token hash and emails a fresh link when the owner resends", async () => {
    mocks.db.organizationInvitation.findFirst.mockResolvedValueOnce({
      id: "invite-1",
      email: "worker@example.com",
      role: "COLLABORATOR",
      organization: { name: "Azienda Demo" },
    });
    await expect(resendInvitation("invite-1")).resolves.toMatchObject({ reissued: true });
    expect(mocks.tx.organizationInvitation.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({ tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/), activeKey: "org-1:worker@example.com", accessVersion: { increment: 1 } }),
    }));
    const email = mocks.sendTransactionalEmail.mock.calls.at(-1)?.[0] as { template: { acceptUrl: string } };
    expect(new URL(email.template.acceptUrl).searchParams.get("token")).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
});
