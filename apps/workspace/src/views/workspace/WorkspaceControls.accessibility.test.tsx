import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  Sidebar,
  SidebarCollapseButton,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
} from "@qoovex/ui/components/sidebar";
import { ThemeToggle } from "@qoovex/ui/components/theme-toggle";

vi.mock("next-themes", () => ({
  useTheme: () => ({ setTheme: vi.fn(), theme: "light" }),
}));

function renderSidebarControls(defaultOpen: boolean) {
  return renderToStaticMarkup(
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar collapsible="icon">
        <SidebarContent>Contenuto della navigazione</SidebarContent>
      </Sidebar>
      <SidebarTrigger />
      <SidebarCollapseButton iconOnly />
    </SidebarProvider>,
  );
}

describe("controlli accessibili della sidebar Workspace", () => {
  it("collega trigger e pannello e annuncia lo stato aperto", () => {
    const html = renderSidebarControls(true);
    const sidebarId = html.match(/id="([^"]+)"[^>]*data-sidebar="sidebar"/)?.[1];

    expect(sidebarId).toBeTruthy();
    expect(html).toContain('aria-label="Chiudi navigazione"');
    expect(html).toContain('aria-label="Riduci menu"');
    expect(html.match(/aria-expanded="true"/g)).toHaveLength(2);
    expect(html.match(new RegExp(`aria-controls="${sidebarId}"`, "g"))).toHaveLength(2);
  });

  it("sincronizza nome e stato quando la sidebar e ridotta", () => {
    const html = renderSidebarControls(false);

    expect(html).toContain('aria-label="Apri navigazione"');
    expect(html).toContain('aria-label="Espandi menu"');
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(2);
  });
});

describe("ThemeToggle durante SSR", () => {
  it("mantiene un'etichetta deterministica fino al mount anche se il client ha già risolto il tema", () => {
    const html = renderToStaticMarkup(<ThemeToggle />);

    expect(html).toContain('aria-label="Cambia tema, attuale: di sistema"');
    expect(html).not.toContain('aria-label="Cambia tema, attuale: chiaro"');
  });
});
