import { describe, expect, it } from "vitest";
import { isPublicApiPath } from "./public-api-routes";

describe("public API route allowlist", () => {
  it("allows only explicit public API paths", () => {
    const publicPaths = [
      "/api/auth/session",
      "/api/dev-auth",
      "/api/data/jobs/run",
      "/api/reminders/email-digest/run",
      "/api/shared/document-packages/raw-token",
      "/api/shared/document-packages/raw-token/items/item-1/download",
    ];

    for (const pathname of publicPaths) {
      expect(isPublicApiPath(pathname), pathname).toBe(true);
    }
  });

  it("keeps workspace and non-token shared APIs protected", () => {
    const protectedPaths = [
      "/api/context",
      "/api/documents",
      "/api/document-packages/package-1/share-links",
      "/api/shared",
      "/api/shared/document-packages",
      "/api/shared/other",
    ];

    for (const pathname of protectedPaths) {
      expect(isPublicApiPath(pathname), pathname).toBe(false);
    }
  });
});
