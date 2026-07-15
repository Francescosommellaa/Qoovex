import { describe, expect, it } from "vitest";
import { buildWorkspaceNavigation, canReadWorkspaceNotifications } from "./workspace-navigation-policy";
import type { WorkspaceRole } from "./workspace-records";

const roles: WorkspaceRole[] = ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"];

describe("workspace navigation policy", () => {
  it.each(["OWNER", "ADMIN", "SAFETY_CONSULTANT"] as const)("keeps four everyday destinations for %s", (role) => {
    expect(buildWorkspaceNavigation(role, "USER").primary.map((item) => item.label)).toEqual([
      "Da fare",
      "Cantieri",
      "Lavoratori",
      "Documenti",
    ]);
  });

  it.each(["SITE_MANAGER", "WORKER"] as const)("keeps a narrower everyday workspace for %s", (role) => {
    expect(buildWorkspaceNavigation(role, "USER").primary.map((item) => item.label)).toEqual([
      "Da fare",
      "Cantieri",
      "Documenti",
    ]);
  });

  it("derives the add menu deliberately for every role", () => {
    expect(buildWorkspaceNavigation("OWNER", "USER").add.map((item) => item.label)).toEqual(["Documento", "Cantiere", "Lavoratore", "Prova"]);
    expect(buildWorkspaceNavigation("ADMIN", "USER").add.map((item) => item.label)).toEqual(["Documento", "Cantiere", "Lavoratore", "Prova"]);
    expect(buildWorkspaceNavigation("SAFETY_CONSULTANT", "USER").add.map((item) => item.label)).toEqual(["File a un documento", "Checklist", "Prova", "Condivisione"]);
    expect(buildWorkspaceNavigation("SITE_MANAGER", "USER").add.map((item) => item.label)).toEqual(["Prova"]);
    expect(buildWorkspaceNavigation("WORKER", "USER").add.map((item) => item.label)).toEqual(["File a un documento", "Prova"]);
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
      add: [],
      account: [{ label: "Sicurezza", href: "/account/security" }],
    });
    expect(buildWorkspaceNavigation(null, "SUPER_ADMIN")).toEqual({
      primary: [],
      add: [],
      account: [
        { label: "Console Qoovex", href: "/qoovex-admin" },
        { label: "Sicurezza", href: "/account/security" },
      ],
    });
  });
});
