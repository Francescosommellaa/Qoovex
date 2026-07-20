import { describe, expect, it } from "vitest";
import { buildWorkspaceNavigation, canReadWorkspaceNotifications } from "./workspace-navigation-policy";
import type { WorkspaceRole } from "./workspace-records";

const roles: WorkspaceRole[] = ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"];

describe("workspace navigation policy", () => {
  it.each(roles)("keeps the common workspace destinations for %s", (role) => {
    const navigation = buildWorkspaceNavigation(role, "USER");
    expect(navigation.primary.map((item) => item.label)).toEqual([
      "Da fare",
      "Documenti",
      "Calendario",
      "Cantieri",
    ]);
    expect(navigation.primary).toContainEqual({ label: "Calendario", href: "/calendar" });
    expect(navigation.quickLinks).toContainEqual({ label: "Scadenze", href: "/deadlines" });
  });

  it("keeps people and role management scoped to permitted roles", () => {
    expect(buildWorkspaceNavigation("OWNER", "USER").people.map((item) => item.label)).toEqual([
      "Lavoratori",
      "Persone e ruoli",
      "Accessi operativi",
    ]);
    expect(buildWorkspaceNavigation("SAFETY_CONSULTANT", "USER").people.map((item) => item.label)).toEqual([
      "Lavoratori",
      "Accessi operativi",
    ]);
    expect(buildWorkspaceNavigation("SITE_MANAGER", "USER").people).toEqual([]);
    expect(buildWorkspaceNavigation("WORKER", "USER").people).toEqual([]);
  });

  it("reserves analytics for the higher operational roles", () => {
    expect(buildWorkspaceNavigation("OWNER", "USER").showAnalytics).toBe(true);
    expect(buildWorkspaceNavigation("ADMIN", "USER").showAnalytics).toBe(true);
    expect(buildWorkspaceNavigation("SAFETY_CONSULTANT", "USER").showAnalytics).toBe(false);
    expect(buildWorkspaceNavigation("SITE_MANAGER", "USER").showAnalytics).toBe(false);
  });

  it("derives the add menu deliberately for every role", () => {
    expect(buildWorkspaceNavigation("OWNER", "USER").add.map((item) => item.label)).toEqual(["Documento", "Cantiere", "Lavoratore", "Prova"]);
    expect(buildWorkspaceNavigation("ADMIN", "USER").add.map((item) => item.label)).toEqual(["Documento", "Cantiere", "Lavoratore", "Prova"]);
    expect(buildWorkspaceNavigation("SAFETY_CONSULTANT", "USER").add.map((item) => item.label)).toEqual(["File a un documento", "Checklist", "Prova", "Condivisione"]);
    expect(buildWorkspaceNavigation("SITE_MANAGER", "USER").add.map((item) => item.label)).toEqual(["Prova"]);
    expect(buildWorkspaceNavigation("WORKER", "USER").add.map((item) => item.label)).toEqual(["File a un documento", "Prova"]);
  });

  it("offers only secondary links permitted for each role", () => {
    expect(buildWorkspaceNavigation("OWNER", "USER").quickLinks.map((item) => item.label)).toEqual(["Scadenze", "Prove", "Checklist", "Condivisioni", "Accessi operativi"]);
    expect(buildWorkspaceNavigation("SAFETY_CONSULTANT", "USER").quickLinks.map((item) => item.label)).toEqual(["Scadenze", "Prove", "Checklist", "Condivisioni", "Accessi operativi"]);
    expect(buildWorkspaceNavigation("SITE_MANAGER", "USER").quickLinks.map((item) => item.label)).toEqual(["Scadenze", "Prove", "Checklist"]);
    expect(buildWorkspaceNavigation("WORKER", "USER").quickLinks.map((item) => item.label)).toEqual(["Scadenze", "Prove"]);
  });

  it("keeps notifications limited to the existing permitted roles", () => {
    expect(roles.filter(canReadWorkspaceNotifications)).toEqual(["OWNER", "ADMIN", "SAFETY_CONSULTANT"]);
  });

  it("keeps the Qoovex console outside the everyday navigation", () => {
    const navigation = buildWorkspaceNavigation("OWNER", "SUPER_ADMIN");
    expect(navigation.primary).not.toContainEqual(expect.objectContaining({ href: "/qoovex-admin" }));
    expect(navigation.account[0]).toEqual({ label: "Console Qoovex", href: "/qoovex-admin" });
  });

  it("keeps account destinations available without a company membership", () => {
    expect(buildWorkspaceNavigation(null, "USER")).toEqual({
      primary: [],
      people: [],
      quickLinks: [],
      add: [],
      account: [{ label: "Sicurezza", href: "/account/security" }],
      showAnalytics: false,
    });
    expect(buildWorkspaceNavigation(null, "SUPER_ADMIN")).toEqual({
      primary: [],
      people: [],
      quickLinks: [],
      add: [],
      account: [
        { label: "Console Qoovex", href: "/qoovex-admin" },
        { label: "Sicurezza", href: "/account/security" },
      ],
      showAnalytics: false,
    });
  });
});
