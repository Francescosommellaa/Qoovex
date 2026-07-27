import { describe, expect, it } from "vitest";
import { buildWorkspaceNavigation, canReadWorkspaceNotifications } from "./workspace-navigation-policy";

describe("workspace navigation policy", () => {
  it("uses the reduced exception-driven primary navigation", () => {
    expect(buildWorkspaceNavigation("OWNER", "USER").primary.map((item) => item.label)).toEqual([
      "Centro operativo", "Documenti", "Lavoratori", "Cantieri", "Pacchetti", "Impostazioni",
    ]);
    expect(buildWorkspaceNavigation("SAFETY_CONSULTANT", "USER").primary.map((item) => item.label)).toEqual([
      "Centro operativo", "Documenti", "Lavoratori", "Cantieri", "Pacchetti", "Impostazioni",
    ]);
    expect(buildWorkspaceNavigation("SITE_MANAGER", "USER").primary.map((item) => item.label)).toEqual([
      "Centro operativo", "Documenti", "Lavoratori", "I miei cantieri",
    ]);
    expect(buildWorkspaceNavigation("WORKER", "USER").primary.map((item) => item.label)).toEqual([
      "Centro operativo", "Documenti", "Il mio profilo", "I miei cantieri",
    ]);
  });

  it("keeps account security and the platform console in the account menu", () => {
    expect(buildWorkspaceNavigation("OWNER", "USER").account).toEqual([{ label: "Sicurezza", href: "/account/security" }]);
    expect(buildWorkspaceNavigation("OWNER", "SUPER_ADMIN").account).toEqual([
      { label: "Console Qoovex", href: "/qoovex-admin" },
      { label: "Sicurezza", href: "/account/security" },
    ]);
    expect(buildWorkspaceNavigation(null, null)).toEqual({ primary: [], account: [] });
  });

  it("keeps notifications in the topbar for the existing authorized roles", () => {
    expect(canReadWorkspaceNotifications("OWNER")).toBe(true);
    expect(canReadWorkspaceNotifications("ADMIN")).toBe(true);
    expect(canReadWorkspaceNotifications("SAFETY_CONSULTANT")).toBe(true);
    expect(canReadWorkspaceNotifications("SITE_MANAGER")).toBe(false);
    expect(canReadWorkspaceNotifications("WORKER")).toBe(false);
  });
});
