import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    user: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
  tx: {
    organizationInvitation: { updateMany: vi.fn(), create: vi.fn() },
  },
  getWorkspaceAccessContext: vi.fn(),
  getContextOrganizationId: vi.fn(),
  canInviteRole: vi.fn(),
  sendTransactionalEmail: vi.fn(),
  recordSupportAccess: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: mocks.db }));
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
vi.mock("@shared/server/authorization-policy", () => ({ canInviteRole: mocks.canInviteRole }));
vi.mock("@shared/server/transactional-email-service", () => ({ sendTransactionalEmail: mocks.sendTransactionalEmail }));
vi.mock("@shared/server/support-access-service", () => ({ recordSupportAccess: mocks.recordSupportAccess }));

import { createInvitation } from "./organization-invitation-service";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("AUTH_URL", "https://app.qoovex.com/auth/");
  mocks.getWorkspaceAccessContext.mockResolvedValue({
    userId: "owner-1",
    company: { role: "OWNER" },
    support: null,
  });
  mocks.getContextOrganizationId.mockReturnValue("org-1");
  mocks.canInviteRole.mockReturnValue(true);
  mocks.db.user.findUnique.mockResolvedValue(null);
  mocks.db.$transaction.mockImplementation(async (callback: (tx: typeof mocks.tx) => unknown) => callback(mocks.tx));
  mocks.tx.organizationInvitation.create.mockResolvedValue({
    id: "invite-1",
    email: "worker@example.com",
    role: "WORKER",
    expiresAt: new Date("2026-07-20T10:00:00.000Z"),
    organization: { name: "Azienda Demo" },
  });
  mocks.sendTransactionalEmail.mockResolvedValue({ providerMessageId: "mail-1" });
});

describe("organization invitation recipient link", () => {
  it("sends a normalized URL backed by the invitation page", async () => {
    await createInvitation({ email: "worker@example.com", role: "WORKER" });

    expect(mocks.sendTransactionalEmail).toHaveBeenCalledOnce();
    const input = mocks.sendTransactionalEmail.mock.calls[0]?.[0] as {
      template: { acceptUrl: string };
    };
    const url = new URL(input.template.acceptUrl);
    expect(url.origin).toBe("https://app.qoovex.com");
    expect(url.pathname).toBe("/invite");
    expect(url.searchParams.get("token")).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
});
