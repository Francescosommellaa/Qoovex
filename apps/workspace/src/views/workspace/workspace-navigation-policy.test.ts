import { describe, expect, it } from "vitest";
import { getPermissionsForPreset, getPermissionsForRole } from "@shared/server/authorization-policy";
import { buildWorkspaceNavigation, canReadWorkspaceNotifications } from "./workspace-navigation-policy";

describe("workspace navigation policy", () => {
  it("keeps search outside primary navigation and exposes it as a modal capability", () => {
    const navigation = buildWorkspaceNavigation(getPermissionsForRole("OWNER"), "USER");
    expect(navigation.primary.map((item) => item.label)).toEqual([
      "Centro operativo", "Documenti", "Lavoratori", "Cantieri", "Condivisioni", "Impostazioni",
    ]);
    expect(navigation.primary.some((item) => item.href === "/search")).toBe(false);
    expect(navigation.searchEnabled).toBe(true);
  });

  it("derives mandatory manual quick actions from effective permissions", () => {
    expect(buildWorkspaceNavigation(getPermissionsForRole("OWNER"), "USER").actions.map((item) => item.label)).toEqual(["Documento", "Cantiere", "Lavoratore", "Prova"]);
    expect(buildWorkspaceNavigation(getPermissionsForPreset("LIMITED_UPLOAD"), "USER").actions.map((item) => item.label)).toEqual(["Documento", "Prova"]);
  });

  it("keeps account security and the platform console in the account menu", () => {
    expect(buildWorkspaceNavigation(getPermissionsForRole("OWNER"), "USER").account).toEqual([{ label: "Sicurezza", href: "/account/security" }]);
    expect(buildWorkspaceNavigation(getPermissionsForRole("OWNER"), "PLATFORM_ADMIN").account).toEqual([
      { label: "Console Qoovex", href: "/qoovex-admin" },
      { label: "Sicurezza", href: "/account/security" },
    ]);
    expect(buildWorkspaceNavigation([], null)).toEqual({ primary: [], actions: [], account: [], searchEnabled: false });
  });

  it("keeps notifications in the topbar when organization metadata is readable", () => {
    expect(canReadWorkspaceNotifications(getPermissionsForRole("OWNER"))).toBe(true);
    expect(canReadWorkspaceNotifications([])).toBe(false);
  });
});
