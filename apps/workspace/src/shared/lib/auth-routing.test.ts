import { describe, expect, it } from "vitest";
import { buildRequestCallbackUrl, sanitizeCallbackUrl } from "./auth-routing";

describe("auth routing", () => {
  it("keeps relative protected callbacks including their query", () => {
    expect(buildRequestCallbackUrl("/documents", "?status=ARCHIVED")).toBe(
      "/documents?status=ARCHIVED",
    );
  });

  it.each([
    undefined,
    "",
    "https://evil.example/path",
    "//evil.example/path",
    "/api/workers",
    "/sign-in?callbackUrl=%2Fdocuments",
    "/sign-up",
    "/reset-password",
  ])("falls back for unsafe callback %s", (value) => {
    expect(sanitizeCallbackUrl(value)).toBe("/dashboard");
  });
});
