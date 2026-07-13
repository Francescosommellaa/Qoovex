import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  bootstrapDevUser: vi.fn(),
  findUser: vi.fn(),
  isMfaSatisfiedForUser: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@shared/server/auth/config", () => ({ auth: mocks.auth }));
vi.mock("@shared/server/dev-auth", () => ({ bootstrapDevUser: mocks.bootstrapDevUser }));
vi.mock("@qoovex/db", () => ({
  db: {
    user: { findUnique: mocks.findUser },
    organizationMembership: { findUnique: vi.fn() },
  },
}));
vi.mock("@shared/server/mfa-service", () => ({
  isMfaSatisfiedForUser: mocks.isMfaSatisfiedForUser,
}));
vi.mock("@shared/server/authorization-policy", () => ({ getPermissionsForRole: vi.fn(() => []) }));
vi.mock("@shared/server/support-access-service", () => ({ getActiveSupportSession: vi.fn() }));
vi.mock("@shared/server/access-errors", () => ({
  AccessError: class AccessError extends Error {
    constructor(
      message: string,
      public readonly status: number,
      public readonly code?: string,
    ) {
      super(message);
    }
  },
}));

import { requireIdentity } from "./access-context-service";

beforeEach(() => {
  mocks.auth.mockReset().mockResolvedValue({
    user: { id: "user-1", authSessionId: "session-1" },
  });
  mocks.bootstrapDevUser.mockReset().mockResolvedValue(null);
  mocks.findUser.mockReset().mockResolvedValue({
    id: "user-1",
    email: "utente@example.com",
    emailVerified: new Date(),
    platformRole: "USER",
    authVersion: 3,
    mfaEnabled: true,
    suspendedAt: null,
  });
  mocks.isMfaSatisfiedForUser.mockReset().mockResolvedValue(false);
});

describe("ordinary workspace MFA enforcement", () => {
  it("rejects a primary-only session when MFA is enabled", async () => {
    await expect(requireIdentity()).rejects.toMatchObject({
      status: 403,
      code: "MFA_REQUIRED",
    });
    expect(mocks.isMfaSatisfiedForUser).toHaveBeenCalledWith({
      userId: "user-1",
      authVersion: 3,
      authSessionId: "session-1",
    });
  });

  it("preserves access for an account that has not enabled MFA", async () => {
    mocks.findUser.mockResolvedValueOnce({
      id: "user-1",
      email: "utente@example.com",
      emailVerified: new Date(),
      platformRole: "USER",
      authVersion: 3,
      mfaEnabled: false,
      suspendedAt: null,
    });

    await expect(requireIdentity()).resolves.toMatchObject({ id: "user-1" });
    expect(mocks.isMfaSatisfiedForUser).not.toHaveBeenCalled();
  });
});
