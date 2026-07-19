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

  it("keeps the current page and at most the last three distinct destinations", () => {
    const pages = [
      { href: "/dashboard", label: "Da fare" },
      { href: "/documents", label: "Documenti" },
      { href: "/job-sites", label: "Cantieri" },
    ];
    const next = pushRecentWorkspacePage(pages, { href: "/documents", label: "Documenti" });

    expect(MAX_RECENT_WORKSPACE_PAGES).toBe(3);
    expect(next).toEqual([
      { href: "/dashboard", label: "Da fare" },
      { href: "/job-sites", label: "Cantieri" },
      { href: "/documents", label: "Documenti" },
    ]);
  });

  it("ignores malformed session storage entries", () => {
    expect(parseRecentWorkspacePages('[{"href":"https://example.com","label":"Esterno"},{"href":"//example.com","label":"Esterno relativo"},{"href":"/dashboard","label":"Da fare"}]')).toEqual([
      { href: "/dashboard", label: "Da fare" },
    ]);
    expect(parseRecentWorkspacePages("not-json")).toEqual([]);
  });
});
