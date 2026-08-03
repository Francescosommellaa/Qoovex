import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireIdentity: vi.fn(),
  requireById: vi.fn(),
  userFindUnique: vi.fn(),
  txUserUpdate: vi.fn(),
  txSessionDeleteMany: vi.fn(),
  txSecurityCreate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@shared/server/access-errors", () => ({
  AccessError: class AccessError extends Error {
    constructor(message: string, public readonly status: number) { super(message); }
  },
}));
vi.mock("@shared/server/access-context-service", () => ({ requireIdentity: mocks.requireIdentity }));
vi.mock("@shared/server/qoovex-operator-access", () => ({ requirePlatformAdminById: mocks.requireById }));
vi.mock("@qoovex/db", () => ({
  db: {
    user: { findUnique: mocks.userFindUnique },
    securityAuditEvent: { create: vi.fn() },
    $transaction: mocks.transaction,
  },
}));

import { revokePlatformUserSessions, suspendPlatformUser } from "./platform-admin-service";

beforeEach(() => {
  mocks.requireIdentity.mockReset().mockResolvedValue({ id: "admin-1" });
  mocks.requireById.mockReset().mockResolvedValue({ id: "admin-1", email: "admin@qoovex.com", isDev: false, platformRole: "PLATFORM_ADMIN" });
  mocks.userFindUnique.mockReset();
  mocks.txUserUpdate.mockReset().mockResolvedValue({});
  mocks.txSessionDeleteMany.mockReset().mockResolvedValue({ count: 2 });
  mocks.txSecurityCreate.mockReset().mockResolvedValue({});
  mocks.transaction.mockReset().mockImplementation(async (callback: (tx: unknown) => unknown) => callback({
    user: { update: mocks.txUserUpdate },
    session: { deleteMany: mocks.txSessionDeleteMany },
    securityAuditEvent: { create: mocks.txSecurityCreate },
  }));
});

describe("platform user management", () => {
  it("suspends a customer, invalidates sessions and records the actor and reason", async () => {
    mocks.userFindUnique.mockResolvedValue({ id: "user-1", email: "user@example.com", platformRole: "USER", suspendedAt: null });
    await expect(suspendPlatformUser("user-1", "Richiesta verificata dal cliente")).resolves.toMatchObject({ suspended: true });
    expect(mocks.txUserUpdate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ authVersion: { increment: 1 }, suspensionReason: "Richiesta verificata dal cliente" }) }));
    expect(mocks.txSessionDeleteMany).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(mocks.txSecurityCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ type: "platform_user_suspended", metadata: expect.objectContaining({ actorUserId: "admin-1" }) }) }));
  });

  it("refuses to modify the actor or another internal operator", async () => {
    mocks.userFindUnique.mockResolvedValue({ id: "admin-1", email: "admin@qoovex.com", platformRole: "PLATFORM_ADMIN", suspendedAt: null });
    await expect(suspendPlatformUser("admin-1", "Motivo operativo valido")).rejects.toMatchObject({ status: 409 });
    mocks.userFindUnique.mockResolvedValue({ id: "admin-2", email: "two@qoovex.com", platformRole: "PLATFORM_ADMIN", suspendedAt: null });
    await expect(revokePlatformUserSessions("admin-2", "Motivo operativo valido")).rejects.toMatchObject({ status: 409 });
  });
});
