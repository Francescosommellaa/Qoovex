import { describe, expect, it } from "vitest";
import { buildWorkspaceNavigation, isWorkspaceNavigationItemCurrent, organizationPrimaryNavigation } from "./workspace-navigation-policy";

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

describe("organizationPrimaryNavigation", () => {
  it("mantiene nella primaria solo le destinazioni operative frequenti", () => {
    expect(organizationPrimaryNavigation).toEqual([
      { label: "Panoramica", href: "/" },
      { label: "Cantieri", href: "/job-sites" },
    ]);
    expect(organizationPrimaryNavigation.map((item) => item.href)).not.toContain("/payment-profile");
    expect(organizationPrimaryNavigation.map((item) => item.href)).not.toContain("/people");
  });
});

describe("buildWorkspaceNavigation", () => {
  it("aggrega le destinazioni Azienda e account per il Titolare", () => {
    const navigation = buildWorkspaceNavigation("OWNER", "USER");

    expect(navigation.account).toEqual([
      expect.objectContaining({ label: "Azienda e impostazioni", href: "/settings" }),
    ]);
  });

  it("propone lo stesso hub al Collaboratore con accesso Azienda", () => {
    const navigation = buildWorkspaceNavigation(["organization:read", "organizationProfile:read"], "USER");

    expect(navigation.account).toEqual([
      expect.objectContaining({ label: "Azienda e impostazioni", href: "/settings" }),
    ]);
  });

  it("mantiene la sicurezza personale per un account senza Azienda", () => {
    const navigation = buildWorkspaceNavigation([], "USER");

    expect(navigation.account).toEqual([{ label: "Account e sicurezza", href: "/account/security" }]);
  });
});

describe("account navigation active state", () => {
  const searchParams = new URLSearchParams();
  const accountItem = buildWorkspaceNavigation("OWNER", "USER").account[0];

  it.each(["/settings", "/settings/organization-profile", "/people/access", "/payment-profile", "/account/security", "/account/notifications", "/audit-log", "/data-control"])(
    "mantiene attivo l'hub in %s",
    (pathname) => {
      expect(isWorkspaceNavigationItemCurrent(pathname, searchParams, accountItem.href, accountItem.activePaths)).toBe(true);
    },
  );

  it("non marca l'hub durante il lavoro operativo", () => {
    expect(isWorkspaceNavigationItemCurrent("/job-sites", searchParams, accountItem.href, accountItem.activePaths)).toBe(false);
  });
});
