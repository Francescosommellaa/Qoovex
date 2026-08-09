import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    user: { findUnique: vi.fn(), updateMany: vi.fn() },
    securityAuditEvent: { create: vi.fn() },
  },
  requireIdentity: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: mocks.db }));
vi.mock("@shared/server/access-context-service", () => ({ requireIdentity: mocks.requireIdentity }));
vi.mock("@shared/server/access-errors", () => ({
  AccessError: class AccessError extends Error {
    constructor(message: string, public readonly status: number, public readonly code?: string) {
      super(message);
    }
  },
}));

import { requireAccountRole, selectAccountRole } from "./account-role-service";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireIdentity.mockResolvedValue({ id: "user-1", email: "user@example.com" });
  mocks.db.user.findUnique.mockResolvedValue({ id: "user-1", accountRole: null });
  mocks.db.user.updateMany.mockResolvedValue({ count: 1 });
  mocks.db.securityAuditEvent.create.mockResolvedValue({ id: "audit-1" });
});

describe("account role selection", () => {
  it("persists an allowed role once and records a security audit event", async () => {
    await expect(selectAccountRole("BUSINESS")).resolves.toEqual({ accountRole: "BUSINESS", selected: true });

    expect(mocks.db.user.updateMany).toHaveBeenCalledWith({
      where: { id: "user-1", accountRole: null },
      data: { accountRole: "BUSINESS" },
    });
    expect(mocks.db.securityAuditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: "user-1", email: "user@example.com", type: "ACCOUNT_ROLE_SELECTED" }),
    });
  });

  it("is idempotent for the same role without emitting another audit event", async () => {
    mocks.db.user.findUnique.mockResolvedValue({ id: "user-1", accountRole: "CLIENT" });

    await expect(selectAccountRole("CLIENT")).resolves.toEqual({ accountRole: "CLIENT", selected: false });
    expect(mocks.db.user.updateMany).not.toHaveBeenCalled();
    expect(mocks.db.securityAuditEvent.create).not.toHaveBeenCalled();
  });

  it("rejects a different role after the immutable selection", async () => {
    mocks.db.user.findUnique.mockResolvedValue({ id: "user-1", accountRole: "PROFESSIONAL" });

    await expect(selectAccountRole("CLIENT")).rejects.toMatchObject({ status: 409 });
    expect(mocks.db.user.updateMany).not.toHaveBeenCalled();
  });

  it("blocks an account with no role before it reaches a protected capability", async () => {
    await expect(requireAccountRole("BUSINESS")).rejects.toMatchObject({ status: 403, code: "ACCOUNT_ROLE_REQUIRED" });
  });

  it("blocks an invitation incompatible with the selected role", async () => {
    mocks.db.user.findUnique.mockResolvedValue({ id: "user-1", accountRole: "CLIENT" });
    await expect(requireAccountRole("PROFESSIONAL")).rejects.toMatchObject({ status: 403 });
  });
});
