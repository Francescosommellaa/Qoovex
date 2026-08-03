import { describe, expect, it } from "vitest";
import { buildOrganizationInvitationPath } from "./workspace-link-routes";
describe("foundation workspace links", () => { it("encodes organization invitation tokens", () => { expect(buildOrganizationInvitationPath("a/b?c")).toBe("/invite?token=a%2Fb%3Fc"); }); });
