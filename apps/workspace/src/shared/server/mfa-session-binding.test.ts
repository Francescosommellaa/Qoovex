import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const values = new Map<string, string>();
  return {
    values,
    cookieStore: {
      get: vi.fn((name: string) => values.has(name) ? { value: values.get(name) } : undefined),
      set: vi.fn((name: string, value: string) => { values.set(name, value); }),
      delete: vi.fn((name: string) => { values.delete(name); }),
    },
    findUser: vi.fn(),
    auth: vi.fn(),
  };
});

vi.mock("server-only", () => ({}));
vi.mock("@shared/server/access-errors", () => ({
  AccessError: class AccessError extends Error {
    constructor(message: string, public readonly status: number, public readonly code?: string) {
      super(message);
    }
  },
}));
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => mocks.cookieStore) }));
vi.mock("@shared/server/auth/config", () => ({ auth: mocks.auth }));
vi.mock("@qoovex/db", () => ({ db: { user: { findUnique: mocks.findUser } } }));
vi.mock("@shared/server/auth-code-service", () => ({
  AuthCodeError: class AuthCodeError extends Error {},
  issueAuthCode: vi.fn(),
  verifyAuthCode: vi.fn(),
}));
vi.mock("@shared/server/rate-limit", () => ({ assertPersistentRateLimit: vi.fn() }));
vi.mock("@shared/server/security-audit-service", () => ({ recordSecurityEvent: vi.fn() }));
vi.mock("@shared/server/transactional-email-service", () => ({ sendTransactionalEmail: vi.fn() }));

import { clearMfaSessionCookie, isMfaSatisfiedForUser, setMfaSessionCookie } from "./mfa-service";

beforeEach(() => {
  process.env.QOOVEX_MFA_COOKIE_SECRET = "test-cookie-secret-with-at-least-32-chars";
  mocks.values.clear();
  mocks.cookieStore.get.mockClear();
  mocks.cookieStore.set.mockClear();
  mocks.cookieStore.delete.mockClear();
  mocks.findUser.mockReset().mockResolvedValue({ mfaEnabled: true, authVersion: 3 });
  mocks.auth.mockReset();
});

describe("MFA assertion binding", () => {
  it("accepts only the authenticated session and auth version that completed MFA", async () => {
    const binding = { userId: "user-1", authVersion: 3, authSessionId: "session-a" };
    await setMfaSessionCookie(binding);

    await expect(isMfaSatisfiedForUser(binding)).resolves.toBe(true);
    await expect(isMfaSatisfiedForUser({ ...binding, authSessionId: "session-b" })).resolves.toBe(false);
    await expect(isMfaSatisfiedForUser({ ...binding, authVersion: 4 })).resolves.toBe(false);
  });

  it("clears the assertion explicitly during logout", async () => {
    await setMfaSessionCookie({ userId: "user-1", authVersion: 3, authSessionId: "session-a" });
    await clearMfaSessionCookie();
    expect(mocks.values.has("qoovex_mfa")).toBe(false);
  });
});
