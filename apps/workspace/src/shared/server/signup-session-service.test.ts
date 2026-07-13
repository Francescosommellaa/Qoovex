import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieState = vi.hoisted(() => ({
  values: new Map<string, string>(),
  set: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieState.values.get(name);
      return value === undefined ? undefined : { value };
    },
    set: (name: string, value: string, options: Record<string, unknown>) => {
      cookieState.values.set(name, value);
      cookieState.set(name, value, options);
    },
  }),
}));

beforeEach(() => {
  process.env.AUTH_SECRET = "signup-session-test-secret-at-least-32-characters";
  cookieState.values.clear();
  cookieState.set.mockClear();
});

describe("verified signup email session", () => {
  it("round-trips only through an HttpOnly signed cookie", async () => {
    const { getVerifiedSignupEmailFromCookie, setVerifiedSignupEmailCookie } = await import("./signup-session-service");

    await setVerifiedSignupEmailCookie(" Owner@Example.com ");

    await expect(getVerifiedSignupEmailFromCookie()).resolves.toBe("owner@example.com");
    expect(cookieState.set).toHaveBeenCalledWith(
      "qv-signup-email",
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/", maxAge: 1800 }),
    );
  });

  it("rejects a tampered verified-email cookie", async () => {
    const { getVerifiedSignupEmailFromCookie, setVerifiedSignupEmailCookie } = await import("./signup-session-service");
    await setVerifiedSignupEmailCookie("owner@example.com");
    const signed = cookieState.values.get("qv-signup-email") ?? "";
    cookieState.values.set("qv-signup-email", `${signed.slice(0, -1)}${signed.endsWith("a") ? "b" : "a"}`);

    await expect(getVerifiedSignupEmailFromCookie()).resolves.toBeNull();
  });

  it("clears the proof after account creation or legacy verification", async () => {
    const { clearVerifiedSignupEmailCookie, getVerifiedSignupEmailFromCookie } = await import("./signup-session-service");

    await clearVerifiedSignupEmailCookie();

    await expect(getVerifiedSignupEmailFromCookie()).resolves.toBeNull();
    expect(cookieState.set).toHaveBeenCalledWith(
      "qv-signup-email",
      "",
      expect.objectContaining({ httpOnly: true, maxAge: 0 }),
    );
  });
});
