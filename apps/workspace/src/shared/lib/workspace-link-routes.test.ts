import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildOrganizationInvitationPath,
  buildSharedDocumentPackageDownloadPath,
  buildSharedDocumentPackagePath,
} from "./workspace-link-routes";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "app");

describe("workspace token link routes", () => {
  it("encodes tokens into recipient-facing paths", () => {
    expect(buildOrganizationInvitationPath("a/b?c")).toBe("/invite?token=a%2Fb%3Fc");
    expect(buildSharedDocumentPackagePath("a/b?c")).toBe("/shared/document-packages/a%2Fb%3Fc");
    expect(buildSharedDocumentPackageDownloadPath("a/b", "item?1")).toBe(
      "/api/shared/document-packages/a%2Fb/items/item%3F1/download",
    );
  });

  it("keeps every generated recipient path backed by an app route", () => {
    expect(existsSync(join(appRoot, "invite", "page.tsx"))).toBe(true);
    expect(existsSync(join(appRoot, "shared", "document-packages", "[token]", "page.tsx"))).toBe(true);
    expect(existsSync(join(appRoot, "api", "shared", "document-packages", "[token]", "items", "[itemId]", "download", "route.ts"))).toBe(true);
  });
});
