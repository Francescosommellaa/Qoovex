import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { JobSiteOperationalOverview } from "@/views/job-site/JobSiteOperationalOverview";
import {
  buildClientJobSiteOverview,
  buildOrganizationJobSiteOverview,
  type ClientJobSiteOverviewInput,
  type OrganizationJobSiteOverviewInput,
} from "./job-site-overview";

const common = {
  closureStatus: null,
  details: [{ label: "Descrizione del lavoro", value: "Rifacimento cucina" }],
  disagreements: [],
  payments: [],
  people: [{ detail: "Responsabile del cantiere", name: "Ada Rossi" }],
  postClosureRequests: [],
  proposals: [],
  reopening: null,
  requests: [],
  status: "ACTIVE",
  steps: [],
} as const satisfies OrganizationJobSiteOverviewInput;

function organization(overrides: Partial<OrganizationJobSiteOverviewInput> = {}) {
  return buildOrganizationJobSiteOverview({ ...common, ...overrides });
}

function client(overrides: Partial<ClientJobSiteOverviewInput> = {}) {
  return buildClientJobSiteOverview({ ...common, initialAgreementCorrectionsRequested: false, initialAgreementStatus: "CONFIRMED", ...overrides });
}

describe("presentazione operativa della Panoramica cantiere", () => {
  it("lascia alla guida esistente il prossimo passo durante il setup Azienda", () => {
    const overview = organization({ status: "DRAFT" });

    expect(overview.status.label).toBe("Bozza di cantiere");
    expect(overview.nextStep).toBeNull();
  });

  it("privilegia un blocco reale e mantiene deep link contestuali nel cantiere attivo Azienda", () => {
    const overview = organization({
      payments: [{ id: "payment-1", reason: "Secondo acconto", status: "TRANSFER_DECLARED" }],
      requests: [{ availableActions: [{ value: "RESPOND" }], blocking: true, id: "request-1", status: "OPEN", title: "Dettaglio impianto" }],
      steps: [{ id: "step-1", status: "IN_PROGRESS", title: "Posa pavimento" }],
    });

    expect(overview.nextStep).toMatchObject({ href: "#richieste", priority: "blocking", title: "Dettaglio impianto" });
    expect(overview.attention.map((item) => item.href)).toEqual(["#pagamenti", "#step"]);
    expect(overview.progress).toEqual({ complete: 0, current: "Posa pavimento · In corso", total: 1 });
  });

  it("mostra al Cliente soltanto azioni che può svolgere davvero", () => {
    const overview = client({
      payments: [{ id: "payment-1", reason: "Saldo lavori", status: "REQUESTED" }],
      proposals: [{ id: "proposal-1", representedSide: "ORGANIZATION_MEMBER", status: "PROPOSED" }],
    });

    expect(overview.nextStep).toMatchObject({ actor: "Tu", href: "#pagamenti", title: "Dichiara il pagamento effettuato" });
    expect(overview.attention[0]).toMatchObject({ href: "#modifiche", title: "Valuta la proposta dell'Azienda" });
  });

  it("porta il Cliente alla precisa review iniziale senza duplicarne il contenuto", () => {
    const overview = client({ initialAgreementStatus: "PENDING_CLIENT_CONFIRMATION", status: "PENDING_INITIAL_CONFIRMATION" });

    expect(overview.nextStep).toMatchObject({ href: "#initial-agreement-review", title: "Valuta il riepilogo iniziale" });
    expect(overview.nextStep?.actor).toBe("Tu");
  });

  it("adatta un cantiere chiuso allo storico e rende azionabile solo una riapertura reale", () => {
    const archived = organization({ status: "CLOSED" });
    const reopening = client({
      reopening: { canCurrentUserConfirm: true, reason: "Serve completare una lavorazione", status: "PROPOSED" },
      status: "ARCHIVED",
    });

    expect(archived.nextStep).toMatchObject({ actor: "Nessuno", href: "#archivio", state: { label: "Storico disponibile" } });
    expect(reopening.nextStep).toMatchObject({ actor: "Tu", href: "#archivio", title: "Decidi sulla proposta di riapertura" });
  });

  it("rende stato, attore, avanzamento e CTA senza codici tecnici", () => {
    const html = renderToStaticMarkup(<JobSiteOperationalOverview overview={organization({
      steps: [{ id: "step-1", status: "CHANGES_REQUESTED", title: "Impianto elettrico" }],
    })} />);

    expect(html).toContain("Panoramica operativa");
    expect(html).toContain("Deve intervenire:");
    expect(html).toContain('href="#step"');
    expect(html).toContain("Avanzamento degli step");
    expect(html).not.toContain("CHANGES_REQUESTED");
  });
});
