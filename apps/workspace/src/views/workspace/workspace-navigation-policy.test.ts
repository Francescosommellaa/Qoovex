import { describe, expect, it } from "vitest";
import { isWorkspaceNavigationItemCurrent } from "./workspace-navigation-policy";

describe("isWorkspaceNavigationItemCurrent", () => {
  const searchParams = new URLSearchParams();

  it("matches Panoramica Azienda exactly on /org/[id] and NOT on sub-routes like /org/[id]/job-sites", () => {
    const orgHref = "/org/clx123";
    expect(isWorkspaceNavigationItemCurrent("/org/clx123", searchParams, orgHref)).toBe(true);
    expect(isWorkspaceNavigationItemCurrent("/org/clx123/job-sites", searchParams, orgHref)).toBe(false);
    expect(isWorkspaceNavigationItemCurrent("/org/clx123/people", searchParams, orgHref)).toBe(false);
    expect(isWorkspaceNavigationItemCurrent("/org/clx123/payment-profile", searchParams, orgHref)).toBe(false);
  });

  it("matches Cantieri on /org/[id]/job-sites and on nested detail pages like /org/[id]/job-sites/[siteId]", () => {
    const cantieriHref = "/org/clx123/job-sites";
    expect(isWorkspaceNavigationItemCurrent("/org/clx123", searchParams, cantieriHref)).toBe(false);
    expect(isWorkspaceNavigationItemCurrent("/org/clx123/job-sites", searchParams, cantieriHref)).toBe(true);
    expect(isWorkspaceNavigationItemCurrent("/org/clx123/job-sites/site_456", searchParams, cantieriHref)).toBe(true);
    expect(isWorkspaceNavigationItemCurrent("/org/clx123/people", searchParams, cantieriHref)).toBe(false);
  });

  it("matches admin panoramica exactly on /qoovex-admin and not on sub-routes", () => {
    const adminHref = "/qoovex-admin";
    expect(isWorkspaceNavigationItemCurrent("/qoovex-admin", searchParams, adminHref)).toBe(true);
    expect(isWorkspaceNavigationItemCurrent("/qoovex-admin/users", searchParams, adminHref)).toBe(false);
  });
});
