import { describe, expect, it } from "vitest";
import { canInviteRole, canRevokeRole, getPermissionsForRole } from "./authorization-policy";

describe("structure authorization policy", () => {
  it("gives the director complete structure permissions", () => {
    expect(getPermissionsForRole("ADMIN")).toEqual(expect.arrayContaining(["structure:manage", "members:invite-head", "members:invite-crew", "hall:read", "kitchen:plan"]));
  });

  it("isolates hall, chef and crew views", () => {
    expect(getPermissionsForRole("HEAD_OF_HALL")).toEqual(["structure:read", "hall:read"]);
    expect(getPermissionsForRole("HEAD_CHEF")).not.toContain("hall:read");
    expect(getPermissionsForRole("KITCHEN_CREW")).toEqual(["structure:read", "crew:tasks:read", "crew:tasks:update"]);
  });

  it("allows the chef to manage only crew", () => {
    expect(canInviteRole("HEAD_CHEF", "KITCHEN_CREW")).toBe(true);
    expect(canInviteRole("HEAD_CHEF", "HEAD_OF_HALL")).toBe(false);
    expect(canRevokeRole("HEAD_CHEF", "KITCHEN_CREW")).toBe(true);
    expect(canRevokeRole("HEAD_CHEF", "HEAD_CHEF")).toBe(false);
  });

  it("never creates another admin through invitations or revocation", () => {
    expect(canInviteRole("ADMIN", "ADMIN")).toBe(false);
    expect(canRevokeRole("ADMIN", "ADMIN")).toBe(false);
  });
});
