import { describe, expect, it } from "vitest";
import { canInviteRole, canRevokeRole, getPermissionsForRole } from "./authorization-policy";

describe("organization authorization policy", () => {
  it("gives the owner complete organization permissions", () => {
    expect(getPermissionsForRole("OWNER")).toEqual(expect.arrayContaining(["organization:update", "members:manage", "auditLog:read", "settings:update"]));
  });

  it("keeps admin operational but not owner-level", () => {
    expect(getPermissionsForRole("ADMIN")).toEqual(expect.arrayContaining(["organization:read", "members:invite", "documents:upload", "documentPackages:share"]));
    expect(getPermissionsForRole("ADMIN")).not.toContain("organization:update");
    expect(getPermissionsForRole("ADMIN")).not.toContain("auditLog:read");
  });

  it("scopes limited roles to explicit action gates", () => {
    expect(getPermissionsForRole("SAFETY_CONSULTANT")).toEqual(expect.arrayContaining(["documents:read", "documents:update", "checklists:manage"]));
    expect(getPermissionsForRole("SITE_MANAGER")).toEqual(expect.arrayContaining(["jobSites:read", "checklists:complete", "evidence:upload"]));
    expect(getPermissionsForRole("WORKER")).toEqual(expect.arrayContaining(["documents:upload", "deadlines:read", "evidence:upload"]));
    expect(getPermissionsForRole("VIEWER")).toEqual(["documentPackages:read"]);
  });

  it("allows owner and admin invitations without owner escalation", () => {
    expect(canInviteRole("OWNER", "ADMIN")).toBe(true);
    expect(canInviteRole("OWNER", "OWNER")).toBe(false);
    expect(canInviteRole("ADMIN", "WORKER")).toBe(true);
    expect(canInviteRole("ADMIN", "ADMIN")).toBe(false);
    expect(canInviteRole("SAFETY_CONSULTANT", "WORKER")).toBe(false);
  });

  it("keeps member management owner-only", () => {
    expect(canRevokeRole("OWNER", "ADMIN")).toBe(true);
    expect(canRevokeRole("OWNER", "OWNER")).toBe(false);
    expect(canRevokeRole("ADMIN", "WORKER")).toBe(false);
  });
});
