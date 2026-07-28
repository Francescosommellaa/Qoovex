import { describe, expect, it } from "vitest";
import {
  MAX_RECENT_WORKSPACE_PAGES,
  parseRecentWorkspacePages,
  pushRecentWorkspacePage,
  resolveWorkspacePageLabel,
} from "./workspace-navigation-history";

describe("workspace navigation history", () => {
  it("prefers a specific creation page label over its parent destination", () => {
    expect(
      resolveWorkspacePageLabel(
        "/documents/new",
        [{ label: "Documenti", href: "/documents" }],
        "Area di lavoro",
      ),
    ).toBe("Nuovo documento");
  });

  it("keeps calendar and deadlines as separate destinations", () => {
    const navigation = [{ label: "Calendario", href: "/calendar" }];
    expect(resolveWorkspacePageLabel("/calendar", navigation, "Area di lavoro")).toBe("Calendario");
    expect(resolveWorkspacePageLabel("/deadlines", navigation, "Area di lavoro")).toBe("Scadenze");
    expect(resolveWorkspacePageLabel("/deadlines/new", navigation, "Area di lavoro")).toBe("Nuova scadenza");
  });

  it("keeps the current page and at most the last three distinct destinations", () => {
    const pages = [
      { href: "/dashboard", label: "Centro operativo" },
      { href: "/documents", label: "Documenti" },
      { href: "/job-sites", label: "Cantieri" },
    ];
    const next = pushRecentWorkspacePage(pages, { href: "/documents", label: "Documenti" });

    expect(MAX_RECENT_WORKSPACE_PAGES).toBe(3);
    expect(next).toEqual([
      { href: "/dashboard", label: "Centro operativo" },
      { href: "/job-sites", label: "Cantieri" },
      { href: "/documents", label: "Documenti" },
    ]);
  });

  it("keeps the document archive distinct from document details", () => {
    expect(resolveWorkspacePageLabel("/documents/archive", [{ label: "Documenti", href: "/documents" }], "Area di lavoro")).toBe("Archivio documenti");
  });

  it("treats readable and legacy document paths as the same recent page", () => {
    const next = pushRecentWorkspacePage(
      [{ href: "/documents/documento--doc-1", label: "Documento" }],
      { href: "/documents/doc-1", label: "Documento aggiornato" },
    );

    expect(next).toEqual([{ href: "/documents/doc-1", label: "Documento aggiornato" }]);
  });

  it("treats readable and legacy worker paths as the same recent page", () => {
    const next = pushRecentWorkspacePage(
      [{ href: "/workers/luca-verdi--worker-1", label: "Luca Verdi" }],
      { href: "/workers/worker-1", label: "Luca Verdi aggiornato" },
    );

    expect(next).toEqual([{ href: "/workers/worker-1", label: "Luca Verdi aggiornato" }]);
  });

  it("treats readable and legacy job site paths as the same recent page", () => {
    const next = pushRecentWorkspacePage(
      [{ href: "/job-sites/ristrutturazione-via-roma--site-1", label: "Ristrutturazione Via Roma" }],
      { href: "/job-sites/site-1", label: "Ristrutturazione aggiornata" },
    );

    expect(next).toEqual([{ href: "/job-sites/site-1", label: "Ristrutturazione aggiornata" }]);
  });

  it("ignores malformed session storage entries", () => {
    expect(parseRecentWorkspacePages('[{"href":"https://example.com","label":"Esterno"},{"href":"//example.com","label":"Esterno relativo"},{"href":"/dashboard","label":"Centro operativo"}]')).toEqual([
      { href: "/dashboard", label: "Centro operativo" },
    ]);
    expect(parseRecentWorkspacePages("not-json")).toEqual([]);
  });

  it("keeps malformed encoded paths isolated instead of breaking navigation history", () => {
    expect(() => pushRecentWorkspacePage([{ href: "/documents/%", label: "Documento" }], { href: "/dashboard", label: "Centro operativo" })).not.toThrow();
  });
});
