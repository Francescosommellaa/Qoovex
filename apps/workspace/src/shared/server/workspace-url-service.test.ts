import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildAbsoluteWorkspaceUrl } from "./workspace-url-service";

describe("workspace absolute URLs", () => {
  it("normalizes trailing slashes and ignores configured base paths", () => {
    expect(buildAbsoluteWorkspaceUrl("/invite?token=abc", "https://app.qoovex.com/auth/")).toBe(
      "https://app.qoovex.com/invite?token=abc",
    );
  });

  it("rejects invalid or non-http base URLs", () => {
    expect(() => buildAbsoluteWorkspaceUrl("/invite", "//app.qoovex.com")).toThrow("URL assoluto");
    expect(() => buildAbsoluteWorkspaceUrl("/invite", "javascript:alert(1)")).toThrow("http o https");
  });
});
