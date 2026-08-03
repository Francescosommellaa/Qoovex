import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isDevAuthView, readDevAuthCookieValue, signDevAuthCookieValue, verifyDevAuthCookieValue } from "./dev-auth-cookie";

beforeEach(() => vi.stubEnv("DEV_AUTH_SECRET", "dev-auth-secret-with-at-least-32-characters"));
afterEach(() => vi.unstubAllEnvs());

describe("dev auth cookie view", () => {
  it("signs and reads the selected view", async () => {
    const cookie = await signDevAuthCookieValue("SUPPORT_AGENT");
    await expect(readDevAuthCookieValue(cookie.value)).resolves.toMatchObject({ view: "SUPPORT_AGENT" });
    await expect(verifyDevAuthCookieValue(cookie.value)).resolves.toBe(true);
  });

  it("rejects a view changed after signing", async () => {
    const cookie = await signDevAuthCookieValue("OWNER");
    await expect(readDevAuthCookieValue(cookie.value.replace(".OWNER.", ".PLATFORM_ADMIN."))).resolves.toBeNull();
  });

  it("accepts only canonical views", () => {
    expect(isDevAuthView("OWNER")).toBe(true);
    expect(isDevAuthView("SUPPORT_AGENT")).toBe(true);
    expect(isDevAuthView("PLATFORM_ADMIN")).toBe(true);
    expect(isDevAuthView("WORKER")).toBe(false);
  });
});
