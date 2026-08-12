import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
describe("JobSiteSectionNavigation", () => {
  it("renders human section links handled by the focus-aware navigation", async () => {
    const sectionNavigation = await import("./JobSiteSectionNavigation").catch(() => null);
    const Component = sectionNavigation?.JobSiteSectionNavigation;
    expect(Component).toBeTypeOf("function");
    if (!Component) return;

    const html = renderToStaticMarkup(<Component sections={["riepilogo", "richieste"]} />);

    expect(html).toContain('aria-label="Sezioni cantiere"');
    expect(html).toContain('href="#riepilogo"');
    expect(html).toContain('href="#richieste"');
    expect(html).toContain("Riepilogo");
    expect(html).toContain("Richieste");
  });
});
