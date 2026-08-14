import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ listClientHome: vi.fn() }));

vi.mock("@shared/server/job-site-lifecycle-service", () => ({ listClientHome: mocks.listClientHome }));
vi.mock("@/views/job-site/JobSiteForms", () => ({ LinkPropertyForm: () => null, PropertyForm: () => <p>Nuovo immobile</p> }));

import ClientHomePage from "./page";

function homeWith({ workQueueItems = [] }: { workQueueItems?: unknown[] } = {}) {
  return {
    properties: [{
      addressLine: "Via Roma 1",
      displayName: "Casa principale",
      id: "property-1",
      jobSites: [{ id: "property-link", jobSite: { id: "active-site", name: "Ristrutturazione cucina", organization: { name: "Edil Rossi" }, status: "ACTIVE" } }],
    }, {
      addressLine: "Via Verdi 2",
      displayName: "Secondo immobile",
      id: "property-2",
      jobSites: [],
    }],
    unlinkedJobSites: [{ id: "participant-1", jobSite: { id: "pending-site", name: "Bagno principale", organization: { name: "Edil Bianchi" }, status: "PENDING_INITIAL_CONFIRMATION" } }],
    workQueueItems,
  };
}

describe("ClientHomePage", () => {
  beforeEach(() => mocks.listClientHome.mockReset());

  it("mette le azioni da fare prima dei lavori attivi e degli immobili", async () => {
    mocks.listClientHome.mockResolvedValue(homeWith({ workQueueItems: [{
      detail: "L'Azienda ha pubblicato il riepilogo iniziale da controllare.",
      href: "/client/job-sites/pending-site#riepilogo",
      id: "pending-site:initial-agreement",
      jobSiteName: "Bagno principale",
      kind: "INITIAL_AGREEMENT_CONFIRMATION",
    }] }));

    const html = renderToStaticMarkup(await ClientHomePage());

    expect(html.indexOf("Da fare")).toBeLessThan(html.indexOf("Lavori attivi"));
    expect(html.indexOf("Lavori attivi")).toBeLessThan(html.indexOf("I tuoi immobili"));
    expect(html.match(/href="\/client\/job-sites\/active-site"/g)).toHaveLength(1);
    expect(html).toContain("Casa principale");
    expect(html).toContain("Secondo immobile");
    expect(html).toContain("Altri lavori");
    expect(html).not.toContain("Cantieri non collegati a un immobile");
    expect(html).not.toContain("Esporta i miei dati");
    expect(html).not.toContain("/api/client/data-export");
  });

  it("mantiene l'empty state delle azioni compatto e porta ai lavori attivi", async () => {
    mocks.listClientHome.mockResolvedValue(homeWith());

    const html = renderToStaticMarkup(await ClientHomePage());

    expect(html).toContain("Al momento non è richiesto nessun tuo intervento.");
    expect(html.indexOf("Al momento non è richiesto nessun tuo intervento.")).toBeLessThan(html.indexOf("Lavori attivi"));
    expect(html).toContain("Ristrutturazione cucina");
  });

  it("resta semplice con un solo immobile e un solo lavoro", async () => {
    mocks.listClientHome.mockResolvedValue({ properties: [{ addressLine: "Via Roma 1", displayName: "Casa principale", id: "property-1", jobSites: [{ id: "property-link", jobSite: { id: "active-site", name: "Ristrutturazione cucina", organization: { name: "Edil Rossi" }, status: "ACTIVE" } }] }], unlinkedJobSites: [], workQueueItems: [] });

    const html = renderToStaticMarkup(await ClientHomePage());

    expect(html).toContain("I tuoi immobili");
    expect(html).toContain("Casa principale");
    expect(html.match(/href="\/client\/job-sites\/active-site"/g)).toHaveLength(1);
    expect(html).not.toContain("Altri lavori");
  });

  it("mostra un lavoro senza immobile una sola volta anche in assenza di immobili", async () => {
    mocks.listClientHome.mockResolvedValue({ properties: [], unlinkedJobSites: [{ id: "participant-1", jobSite: { id: "other-work", name: "Verifica infissi", organization: { name: "Edil Bianchi" }, status: "PENDING_INITIAL_CONFIRMATION" } }], workQueueItems: [] });

    const html = renderToStaticMarkup(await ClientHomePage());

    expect(html).toContain("Altri lavori");
    expect(html.match(/href="\/client\/job-sites\/other-work"/g)).toHaveLength(1);
    expect(html).not.toContain("Cantieri non collegati a un immobile");
  });
});
