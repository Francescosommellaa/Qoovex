import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
describe("JobSiteSectionNavigation", () => {
  it("groups the navigation by user task while preserving the established anchors", async () => {
    const sectionNavigation = await import("./JobSiteSectionNavigation").catch(() => null);
    const Component = sectionNavigation?.JobSiteSectionNavigation;
    expect(Component).toBeTypeOf("function");
    if (!Component) return;

    const html = renderToStaticMarkup(<Component sections={["overview", "activities", "decisions", "files"]} targets={sectionNavigation!.clientJobSiteSectionTargets} />);

    expect(html).toContain('aria-label="Sezioni cantiere"');
    expect(html).toContain('href="#riepilogo"');
    expect(html).toContain('href="#timeline"');
    expect(html).toContain('href="#decisioni"');
    expect(html).toContain('href="#documenti"');
    expect(html).toContain("Panoramica");
    expect(html).toContain("Attività");
    expect(html).toContain("Decisioni");
    expect(html).toContain("File");
    expect(html).not.toContain(">Timeline<");
  });

  it("mostra la chiusura e l'archivio solo negli stati pertinenti per l'Azienda", async () => {
    const { getOrganizationJobSiteNavigationSections } = await import("./JobSiteSectionNavigation");

    expect(getOrganizationJobSiteNavigationSections({ status: "DRAFT", hasClosure: false })).not.toContain("closure");
    expect(getOrganizationJobSiteNavigationSections({ status: "ACTIVE", hasClosure: false })).toContain("closure");
    expect(getOrganizationJobSiteNavigationSections({ status: "CLOSED", hasClosure: false })).toEqual(["overview", "activities", "decisions", "payments", "files", "details", "archive"]);
  });

  it("mantiene per il Cliente solo la panoramica prima dell'attivazione", async () => {
    const { getClientJobSiteNavigationSections } = await import("./JobSiteSectionNavigation");

    expect(getClientJobSiteNavigationSections({ status: "PENDING_INITIAL_CONFIRMATION", hasClosure: false })).toEqual(["overview"]);
    expect(getClientJobSiteNavigationSections({ status: "ACTIVE", hasClosure: true })).toContain("closure");
    expect(getClientJobSiteNavigationSections({ status: "ARCHIVED", hasClosure: false })).toEqual(["overview", "activities", "decisions", "payments", "files", "details", "archive"]);
  });
});
