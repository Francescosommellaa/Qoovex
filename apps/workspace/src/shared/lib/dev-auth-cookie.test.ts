import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isDevAuthRole,
  readDevAuthCookieValue,
  signDevAuthCookieValue,
  verifyDevAuthCookieValue,
} from "./dev-auth-cookie";

beforeEach(() => {
  vi.stubEnv("DEV_AUTH_SECRET", "dev-auth-secret-with-at-least-32-characters");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("dev auth cookie role", () => {
  it("signs and reads the selected organization role", async () => {
    const cookie = await signDevAuthCookieValue("SITE_MANAGER");

    await expect(readDevAuthCookieValue(cookie.value)).resolves.toMatchObject({ role: "SITE_MANAGER" });
    await expect(verifyDevAuthCookieValue(cookie.value)).resolves.toBe(true);
  });

  it("rejects a role changed after signing", async () => {
    const cookie = await signDevAuthCookieValue("OWNER");
    const tampered = cookie.value.replace(".OWNER.", ".WORKER.");

    await expect(readDevAuthCookieValue(tampered)).resolves.toBeNull();
  });

  it("accepts only canonical roles", () => {
    expect(isDevAuthRole("WORKER")).toBe(true);
    expect(isDevAuthRole("SUPER_ADMIN")).toBe(false);
    expect(isDevAuthRole("UNKNOWN")).toBe(false);
  });
});
