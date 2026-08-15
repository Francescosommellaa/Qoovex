import { describe, expect, it } from "vitest";
import { isWorkspaceNavigationItemCurrent } from "./workspace-navigation-policy";

describe("isWorkspaceNavigationItemCurrent", () => {
  const searchParams = new URLSearchParams();

  it("matches Panoramica Azienda exactly on / and not on organization sub-routes", () => {
    const organizationHref = "/";
    expect(isWorkspaceNavigationItemCurrent("/", searchParams, organizationHref)).toBe(true);
    expect(isWorkspaceNavigationItemCurrent("/job-sites", searchParams, organizationHref)).toBe(false);
    expect(isWorkspaceNavigationItemCurrent("/people", searchParams, organizationHref)).toBe(false);
    expect(isWorkspaceNavigationItemCurrent("/payment-profile", searchParams, organizationHref)).toBe(false);
  });

  it("matches Cantieri on /job-sites and nested detail pages", () => {
    const cantieriHref = "/job-sites";
    expect(isWorkspaceNavigationItemCurrent("/", searchParams, cantieriHref)).toBe(false);
    expect(isWorkspaceNavigationItemCurrent("/job-sites", searchParams, cantieriHref)).toBe(true);
    expect(isWorkspaceNavigationItemCurrent("/job-sites/site_456", searchParams, cantieriHref)).toBe(true);
    expect(isWorkspaceNavigationItemCurrent("/people", searchParams, cantieriHref)).toBe(false);
  });

  it("matches admin panoramica exactly on /qoovex-admin and not on sub-routes", () => {
    const adminHref = "/qoovex-admin";
    expect(isWorkspaceNavigationItemCurrent("/qoovex-admin", searchParams, adminHref)).toBe(true);
    expect(isWorkspaceNavigationItemCurrent("/qoovex-admin/users", searchParams, adminHref)).toBe(false);
  });
});
