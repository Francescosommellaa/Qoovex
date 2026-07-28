import { describe, expect, it } from "vitest";
import { canInviteRole, canRevokeRole, getPermissionsForPreset, getPermissionsForRole, getSupportSessionPermissions, normalizeCollaboratorPermissions } from "./authorization-policy";

describe("organization authorization policy", () => {
  it("gives the owner complete organization permissions", () => {
    expect(getPermissionsForRole("OWNER")).toEqual(expect.arrayContaining(["organization:update", "members:manage", "auditLog:read", "settings:update"]));
  });

  it("does not infer collaborator permissions from the role", () => {
    expect(getPermissionsForRole("COLLABORATOR")).toEqual([]);
    expect(getPermissionsForPreset("READ_ONLY")).toContain("documents:file:read");
    expect(getPermissionsForPreset("READ_ONLY")).toContain("evidence:file:read");
    expect(getPermissionsForPreset("DOCUMENT_REVIEWER")).toContain("documents:verify");
    expect(getPermissionsForPreset("DOCUMENT_REVIEWER")).not.toContain("evidence:sensitive:read");
    expect(getPermissionsForPreset("LIMITED_UPLOAD")).not.toContain("documents:verify");
  });

  it("keeps invitations and revocations owner-only", () => {
    expect(canInviteRole("OWNER", "COLLABORATOR")).toBe(true);
    expect(canInviteRole("OWNER", "OWNER")).toBe(false);
    expect(canInviteRole("COLLABORATOR", "COLLABORATOR")).toBe(false);
    expect(canRevokeRole("OWNER", "COLLABORATOR")).toBe(true);
    expect(canRevokeRole("COLLABORATOR", "COLLABORATOR")).toBe(false);
  });

  it("normalizes collaborator permissions with dependencies and strips owner capabilities", () => {
    expect(normalizeCollaboratorPermissions(["documents:file:read", "documentPackages:share", "members:manage", "organization:update"])).toEqual(expect.arrayContaining([
      "organization:read",
      "documents:read",
      "documents:file:read",
      "documentPackages:read",
      "documentPackages:review",
      "documentPackages:approve",
      "documentPackages:share",
    ]));
    expect(normalizeCollaboratorPermissions(["members:manage", "organization:update"])).toEqual([]);
  });

  it("keeps temporary support sessions metadata-only and non-mutating", () => {
    expect(getSupportSessionPermissions()).toEqual(expect.arrayContaining(["organization:read", "members:read", "processes:read"]));
    expect(getSupportSessionPermissions()).not.toEqual(expect.arrayContaining(["documents:file:read", "evidence:file:read", "evidence:sensitive:read", "documents:upload", "members:manage", "documentPackages:share"]));
  });
});
