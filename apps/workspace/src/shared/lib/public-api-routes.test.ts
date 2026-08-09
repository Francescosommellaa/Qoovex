import { describe, expect, it } from "vitest";
import { isPublicApiPath } from "./public-api-routes";

describe("public API route allowlist", () => {
  it("allows only explicit public API paths", () => {
    const publicPaths = [
      "/api/auth/session",
      "/api/dev-auth",
      "/api/data/jobs/run",
    ];

    for (const pathname of publicPaths) {
      expect(isPublicApiPath(pathname), pathname).toBe(true);
    }
  });

  it("keeps workspace and non-token shared APIs protected", () => {
    const protectedPaths = [
      "/api/account/notification-preferences",
      "/api/org/org-1/job-sites",
      "/api/client/job-sites",
      "/api/exports/download/grant",
      "/api/shared/removed",
    ];

    for (const pathname of protectedPaths) {
      expect(isPublicApiPath(pathname), pathname).toBe(false);
    }
  });
});
