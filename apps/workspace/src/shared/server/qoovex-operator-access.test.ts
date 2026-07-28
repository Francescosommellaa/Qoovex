import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  isCurrentDevAuthIdentity: vi.fn(),
  getDevAuthSession: vi.fn(),
  isMfaSatisfiedForUser: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@shared/server/access-errors", () => ({
  AccessError: class AccessError extends Error {
    constructor(message: string, public readonly status: number) { super(message); }
  },
}));
vi.mock("@qoovex/db", () => ({ db: { user: { findUnique: mocks.findUnique } } }));
vi.mock("@shared/server/dev-auth", () => ({ isCurrentDevAuthIdentity: mocks.isCurrentDevAuthIdentity, getDevAuthSession: mocks.getDevAuthSession }));
vi.mock("@shared/server/mfa-service", () => ({ isMfaSatisfiedForUser: mocks.isMfaSatisfiedForUser }));

import { requireQoovexOperatorById } from "./qoovex-operator-access";

beforeEach(() => {
  mocks.findUnique.mockReset();
  mocks.isCurrentDevAuthIdentity.mockReset().mockResolvedValue(false);
  mocks.getDevAuthSession.mockReset().mockResolvedValue(null);
  mocks.isMfaSatisfiedForUser.mockReset().mockResolvedValue(false);
});

describe("requireQoovexOperatorById", () => {
  it("hides the console from ordinary users", async () => {
    mocks.findUnique.mockResolvedValue({ id: "user-1", email: "u@example.com", platformRole: "USER", mfaEnabled: true, suspendedAt: null });
    await expect(requireQoovexOperatorById("user-1")).rejects.toMatchObject({ status: 404 });
  });

  it("requires configured and satisfied MFA from real operators", async () => {
    mocks.findUnique.mockResolvedValue({ id: "admin-1", email: "admin@example.com", platformRole: "PLATFORM_ADMIN", mfaEnabled: true, suspendedAt: null });
    await expect(requireQoovexOperatorById("admin-1")).rejects.toMatchObject({ status: 403 });
    mocks.isMfaSatisfiedForUser.mockResolvedValue(true);
    await expect(requireQoovexOperatorById("admin-1")).resolves.toMatchObject({ id: "admin-1", isDev: false });
  });

  it("allows only the signed local dev identity to bypass role and MFA", async () => {
    mocks.findUnique.mockResolvedValue({ id: "dev_qoovex_local_user", email: "dev@qoovex.local", platformRole: "USER", mfaEnabled: false, suspendedAt: null });
    mocks.isCurrentDevAuthIdentity.mockResolvedValue(true);
    mocks.getDevAuthSession.mockResolvedValue({ view: "PLATFORM_ADMIN", expiresAt: 9_999_999_999 });
    await expect(requireQoovexOperatorById("dev_qoovex_local_user")).resolves.toMatchObject({ platformRole: "PLATFORM_ADMIN", isDev: true });
    expect(mocks.isMfaSatisfiedForUser).not.toHaveBeenCalled();
  });
});
