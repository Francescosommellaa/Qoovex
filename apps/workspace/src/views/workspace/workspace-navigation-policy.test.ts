import { describe, expect, it } from "vitest";
import { getPermissionsForPreset, getPermissionsForRole } from "@shared/server/authorization-policy";
import { buildWorkspaceNavigation, canReadWorkspaceNotifications, isJobSiteCollectionPathCurrent, isWorkspaceNavigationItemCurrent } from "./workspace-navigation-policy";

describe("workspace navigation policy", () => {
  it("keeps search outside primary navigation and exposes it as a modal capability", () => {
    const navigation = buildWorkspaceNavigation(getPermissionsForRole("OWNER"), "USER");
    expect(navigation.primary.map((item) => item.label)).toEqual([
      "Panoramica", "Tutti i cantieri",
    ]);
    expect(navigation.primary.find((item) => item.label === "Tutti i cantieri")).toEqual({ label: "Tutti i cantieri", href: "/job-sites/all" });
    expect(navigation.primary.some((item) => item.href === "/workers" || item.href === "/settings/organization-profile")).toBe(false);
    expect(navigation.primary.some((item) => item.href === "/search")).toBe(false);
    expect(navigation.primary.some((item) => item.href === "/documents" || item.href === "/document-packages")).toBe(false);
    expect(navigation.searchEnabled).toBe(true);
  });

  it("derives mandatory manual quick actions from effective permissions", () => {
    expect(buildWorkspaceNavigation(getPermissionsForRole("OWNER"), "USER").actions.map((item) => item.label)).toEqual(["Aggiungi prova", "Crea cantiere", "Carica documento", "Aggiungi collaboratore"]);
    expect(buildWorkspaceNavigation(getPermissionsForPreset("LIMITED_UPLOAD"), "USER").actions.map((item) => item.label)).toEqual(["Aggiungi prova", "Carica documento"]);
  });

  it("keeps real company, account and settings destinations in the account menu", () => {
    expect(buildWorkspaceNavigation(getPermissionsForRole("OWNER"), "USER").account).toEqual([
      { label: "Gestisci azienda", href: "/settings/organization-profile" },
      { label: "Gestisci collaboratori", href: "/people/access" },
      { label: "Gestisci account", href: "/account/security" },
      { label: "Impostazioni", href: "/settings" },
    ]);
    expect(buildWorkspaceNavigation(getPermissionsForRole("OWNER"), "PLATFORM_ADMIN").account).toEqual([
      { label: "Console Qoovex", href: "/qoovex-admin" },
      { label: "Gestisci azienda", href: "/settings/organization-profile" },
      { label: "Gestisci collaboratori", href: "/people/access" },
      { label: "Gestisci account", href: "/account/security" },
      { label: "Impostazioni", href: "/settings" },
    ]);
    expect(buildWorkspaceNavigation([], null)).toEqual({ primary: [], actions: [], account: [], searchEnabled: false });
  });

  it("activates the collection only on list, archive and creation surfaces", () => {
    expect(isJobSiteCollectionPathCurrent("/job-sites")).toBe(true);
    expect(isJobSiteCollectionPathCurrent("/job-sites/all")).toBe(true);
    expect(isJobSiteCollectionPathCurrent("/job-sites/archive")).toBe(true);
    expect(isJobSiteCollectionPathCurrent("/job-sites/new")).toBe(true);
    expect(isJobSiteCollectionPathCurrent("/job-sites/cantiere--site-1")).toBe(false);
  });

  it("matches exact and nested routes without making dashboard match unrelated pages", () => {
    const empty = new URLSearchParams();
    expect(isWorkspaceNavigationItemCurrent("/job-sites/all", empty, "/job-sites/all", "/job-sites")).toBe(true);
    expect(isWorkspaceNavigationItemCurrent("/job-sites/site-1", empty, "/job-sites/all", "/job-sites")).toBe(true);
    expect(isWorkspaceNavigationItemCurrent("/job-sites/archive", empty, "/job-sites/all", "/job-sites")).toBe(true);
    expect(isWorkspaceNavigationItemCurrent("/settings/organization-profile", empty, "/settings/organization-profile")).toBe(true);
    expect(isWorkspaceNavigationItemCurrent("/dashboard", new URLSearchParams("view=TO_VERIFY"), "/dashboard")).toBe(true);
    expect(isWorkspaceNavigationItemCurrent("/operations/process-1", empty, "/dashboard")).toBe(false);
  });

  it("requires declared query parameters while ignoring unrelated query strings", () => {
    expect(isWorkspaceNavigationItemCurrent("/documents", new URLSearchParams("view=attention&source=nav"), "/documents?view=attention")).toBe(true);
    expect(isWorkspaceNavigationItemCurrent("/documents", new URLSearchParams("view=archive"), "/documents?view=attention")).toBe(false);
  });

  it("keeps notifications in the topbar when organization metadata is readable", () => {
    expect(canReadWorkspaceNotifications(getPermissionsForRole("OWNER"))).toBe(true);
    expect(canReadWorkspaceNotifications([])).toBe(false);
  });
});
