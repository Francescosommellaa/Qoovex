import { describe, expect, it } from "vitest";
import { buildWorkspaceNavigation, canReadWorkspaceNotifications } from "./workspace-navigation-policy";
import type { WorkspaceRole } from "./workspace-records";

const roles: WorkspaceRole[] = ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"];

describe("workspace navigation policy", () => {
  it.each(roles)("keeps the common workspace destinations for %s", (role) => {
    const navigation = buildWorkspaceNavigation(role, "USER");
    expect(navigation.primary.map((item) => item.label)).toEqual(["Da fare", "Calendario"]);
    const expectedDocuments = role === "SITE_MANAGER" ? ["Panoramica", "Cantieri"] : role === "WORKER" ? ["Panoramica", "Lavoratori"] : ["Panoramica", "Azienda", "Lavoratori", "Cantieri"];
    expect(navigation.documents.slice(0, 4).map((item) => item.label)).toEqual(expectedDocuments);
    expect(navigation.documents[0]).toEqual({ label: "Panoramica", href: "/documents" });
    expect(navigation.primary).toContainEqual({ label: "Calendario", href: "/calendar" });
    expect(navigation.jobSites[0]).toEqual({ label: "Panoramica", href: "/job-sites" });
    expect(navigation.favorites.candidates).toContainEqual({ label: "Scadenze", href: "/deadlines" });
  });

  it("keeps the Cantieri group role-aware and hides the archive from contextual roles", () => {
    expect(buildWorkspaceNavigation("OWNER", "USER").jobSites.map((item) => item.label)).toEqual(["Panoramica", "Tutti i cantieri", "Archivio"]);
    expect(buildWorkspaceNavigation("SAFETY_CONSULTANT", "USER").jobSites.map((item) => item.label)).toEqual(["Panoramica", "Tutti i cantieri"]);
    for (const role of ["SITE_MANAGER", "WORKER"] as const) {
      const navigation = buildWorkspaceNavigation(role, "USER");
      expect(navigation.jobSitesLabel).toBe("I miei cantieri");
      expect(navigation.jobSites.some((item) => item.href === "/job-sites/archive")).toBe(false);
    }
  });

  it("keeps people and role management scoped to permitted roles", () => {
    expect(buildWorkspaceNavigation("OWNER", "USER").people.map((item) => item.label)).toEqual([
      "Panoramica",
      "Lavoratori",
      "Accessi",
      "Assegnazioni",
    ]);
    expect(buildWorkspaceNavigation("ADMIN", "USER").people.map((item) => item.label)).toEqual(["Panoramica", "Lavoratori", "Accessi", "Assegnazioni"]);
    expect(buildWorkspaceNavigation("SAFETY_CONSULTANT", "USER").people.map((item) => item.label)).toEqual(["Panoramica", "Lavoratori", "Assegnazioni"]);
    expect(buildWorkspaceNavigation("SITE_MANAGER", "USER").people).toEqual([
      { label: "Lavoratori", href: "/workers" },
    ]);
    expect(buildWorkspaceNavigation("WORKER", "USER").people).toEqual([{ label: "Il mio profilo", href: "/workers" }]);
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

  it("declares role-aware Favorite candidates and two explicit defaults", () => {
    const expectations: Record<WorkspaceRole, { candidates: string[]; defaults: string[] }> = {
      OWNER: {
        candidates: ["Documenti da controllare", "Scadenze", "Checklist aperte", "Prove recenti", "Pacchetti pronti", "Documenti Azienda", "Documenti lavoratori", "Documenti cantieri"],
        defaults: ["/documents?view=attention", "/deadlines"],
      },
      ADMIN: {
        candidates: ["Documenti da controllare", "Scadenze", "Checklist aperte", "Prove recenti", "Pacchetti pronti", "Documenti Azienda", "Documenti lavoratori", "Documenti cantieri"],
        defaults: ["/documents?view=attention", "/deadlines"],
      },
      SAFETY_CONSULTANT: {
        candidates: ["Checklist aperte", "Documenti da controllare", "Scadenze", "Prove recenti", "Pacchetti pronti", "Documenti lavoratori", "Documenti cantieri"],
        defaults: ["/checklists?view=open", "/documents?view=attention"],
      },
      SITE_MANAGER: {
        candidates: ["Prove recenti", "Checklist aperte", "Scadenze", "Documenti da controllare", "Documenti cantieri"],
        defaults: ["/evidence?sort=recent", "/checklists?view=open"],
      },
      WORKER: {
        candidates: ["Prove recenti", "Scadenze", "I miei documenti da controllare"],
        defaults: ["/evidence?sort=recent", "/deadlines"],
      },
    };

    for (const role of roles) {
      const favorites = buildWorkspaceNavigation(role, "USER").favorites;
      expect(favorites.role).toBe(role);
      expect(favorites.candidates.map((item) => item.label)).toEqual(expectations[role].candidates);
      expect(favorites.defaultHrefs).toEqual(expectations[role].defaults);
      expect(favorites.defaultHrefs).toHaveLength(2);
      expect(favorites.defaultHrefs.every((href) => favorites.candidates.some((item) => item.href === href))).toBe(true);
    }
  });

  it("keeps Favorites distinct from primary navigation and notifications", () => {
    for (const role of roles) {
      const navigation = buildWorkspaceNavigation(role, "USER");
      const primaryHrefs = new Set([
        ...navigation.primary,
        ...navigation.documents,
        ...navigation.people,
        ...navigation.jobSites,
      ].map((item) => item.href));
      expect(navigation.favorites.candidates.some((item) => primaryHrefs.has(item.href))).toBe(false);
      expect(navigation.favorites.candidates.some((item) => item.href.startsWith("/notifications") || item.label === "Notifiche")).toBe(false);
      expect(navigation.add.some((item) => navigation.favorites.candidates.some((favorite) => favorite.href === item.href))).toBe(false);
    }
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
      documents: [],
      people: [],
      jobSites: [],
      jobSitesLabel: "Cantieri",
      favorites: { role: null, candidates: [], defaultHrefs: [] },
      add: [],
      account: [{ label: "Sicurezza", href: "/account/security" }],
      showAnalytics: false,
    });
    expect(buildWorkspaceNavigation(null, "SUPER_ADMIN")).toEqual({
      primary: [],
      documents: [],
      people: [],
      jobSites: [],
      jobSitesLabel: "Cantieri",
      favorites: { role: null, candidates: [], defaultHrefs: [] },
      add: [],
      account: [
        { label: "Console Qoovex", href: "/qoovex-admin" },
        { label: "Sicurezza", href: "/account/security" },
      ],
      showAnalytics: false,
    });
  });
});
