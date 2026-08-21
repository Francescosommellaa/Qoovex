import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  clientJobSiteSectionTargets,
  getClientJobSiteNavigationSections,
  getOrganizationJobSiteNavigationSections,
  resolveActiveJobSiteNavigationSection,
  resolveJobSiteDeepLink,
} from "@shared/lib/job-site-section-navigation";

describe("JobSiteSectionNavigation", () => {
  it("groups the navigation by user task while preserving the established anchors", async () => {
    const sectionNavigation = await import("./JobSiteSectionNavigation").catch(() => null);
    const Component = sectionNavigation?.JobSiteSectionNavigation;
    expect(Component).toBeTypeOf("function");
    if (!Component) return;

    const html = renderToStaticMarkup(<Component sections={["overview", "activities", "decisions", "files"]} targets={clientJobSiteSectionTargets} />);

    expect(html).toContain('aria-label="Sezioni cantiere"');
    expect(html).toContain("Sezione corrente");
    expect(html).toContain('aria-label="Sezione corrente del cantiere"');
    expect(html).toContain("md:hidden");
    expect(html).toContain("md:flex");
    expect(html).toContain("sticky");
    expect(html).not.toContain("overflow-x-auto");
    expect(html).toContain('href="#riepilogo"');
    expect(html).toContain('href="#timeline"');
    expect(html).toContain('href="#decisioni"');
    expect(html).toContain('href="#documenti"');
    expect(html).toContain("Panoramica");
    expect(html).toContain("Attività");
    expect(html).toContain("Decisioni");
    expect(html).toContain("File");
    expect(html).toContain('aria-current="location"');
    expect(html).not.toContain(">Timeline<");
  });

  it("mostra la chiusura e l'archivio solo negli stati pertinenti per l'Azienda", () => {
    expect(getOrganizationJobSiteNavigationSections({ status: "DRAFT", hasClosure: false })).not.toContain("closure");
    expect(getOrganizationJobSiteNavigationSections({ status: "ACTIVE", hasClosure: false })).toContain("closure");
    expect(getOrganizationJobSiteNavigationSections({ status: "CLOSED", hasClosure: false })).toEqual(["overview", "activities", "decisions", "payments", "files", "details", "archive"]);
  });

  it("mantiene per il Cliente solo la panoramica prima dell'attivazione", () => {
    expect(getClientJobSiteNavigationSections({ status: "PENDING_INITIAL_CONFIRMATION", hasClosure: false })).toEqual(["overview"]);
    expect(getClientJobSiteNavigationSections({ status: "ACTIVE", hasClosure: true })).toContain("closure");
    expect(getClientJobSiteNavigationSections({ status: "ARCHIVED", hasClosure: false })).toEqual(["overview", "activities", "decisions", "payments", "files", "details", "archive"]);
  });

  it("riconosce la sezione visibile usando l'ordine reale della pagina", () => {
    expect(resolveActiveJobSiteNavigationSection({
      activationLine: 120,
      atEnd: false,
      fallback: "overview",
      positions: [
        { section: "files", top: 300 },
        { section: "details", top: 100 },
        { section: "payments", top: -200 },
      ],
    })).toBe("details");
    expect(resolveActiveJobSiteNavigationSection({
      activationLine: 120,
      atEnd: true,
      fallback: "overview",
      positions: [
        { section: "files", top: 300 },
        { section: "details", top: 100 },
      ],
    })).toBe("files");
  });

  it("porta un deep link preciso all'elemento e ripiega sulla sezione se non esiste più", async () => {
    const { jobSiteNotificationTargetId } = await import("@shared/lib/job-site-notification-destination");
    const sections = ["overview", "activities", "decisions", "payments", "files"] as const;
    const paymentTarget = jobSiteNotificationTargetId("payment", "payment-1");

    expect(resolveJobSiteDeepLink({ hash: `#${paymentTarget}`, hasTarget: (id) => id === paymentTarget, sections, targets: clientJobSiteSectionTargets })).toEqual({ missing: false, section: "payments", targetId: paymentTarget });
    expect(resolveJobSiteDeepLink({ hash: "#attachment-missing", hasTarget: () => false, sections, targets: clientJobSiteSectionTargets })).toEqual({ missing: true, section: "files", targetId: "documenti" });
    expect(resolveJobSiteDeepLink({ hash: "#archivio", hasTarget: () => false, sections, targets: clientJobSiteSectionTargets })).toEqual({ missing: true, section: "overview", targetId: "riepilogo" });
  });
});
