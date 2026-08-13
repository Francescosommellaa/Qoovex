import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getJobSiteActivationGuide, JobSiteActivationGuide } from "./JobSiteActivationGuide";

describe("guida di attivazione del cantiere", () => {
  it("mostra l'invito al cliente come prossima azione per una bozza", () => {
    const guide = getJobSiteActivationGuide("DRAFT", null);

    expect(guide?.action).toEqual({ href: "#client-invitation-form", label: "Invita il cliente" });
    expect(guide?.steps.map((step) => step.state)).toEqual(["complete", "current", "upcoming"]);
    expect(guide?.steps[1]?.description).toContain("email del cliente principale");
  });

  it("indica quando l'azione successiva spetta al cliente", () => {
    const invited = getJobSiteActivationGuide("WAITING_FOR_CLIENT", null);
    const published = getJobSiteActivationGuide("PENDING_INITIAL_CONFIRMATION", "PENDING_CLIENT_CONFIRMATION");

    expect(invited?.action).toBeUndefined();
    expect(invited?.steps[1]).toMatchObject({ state: "waiting", title: "Coinvolgi il cliente" });
    expect(published?.action).toBeUndefined();
    expect(published?.steps[2]).toMatchObject({ state: "waiting", title: "Conferma il riepilogo iniziale" });
  });

  it("rende disponibile il riepilogo soltanto dopo l'accettazione dell'invito", () => {
    const guide = getJobSiteActivationGuide("PENDING_INITIAL_CONFIRMATION", "DRAFT");

    expect(guide?.action).toEqual({ href: "#initial-agreement-form", label: "Pubblica il riepilogo iniziale" });
    expect(guide?.steps[1]).toMatchObject({ state: "complete" });
    expect(guide?.steps[2]).toMatchObject({ state: "current" });
  });

  it("usa testo, icone e semantica di elenco senza lasciare la guida nel cantiere attivo", () => {
    const html = renderToStaticMarkup(<JobSiteActivationGuide agreementStatus={null} status="DRAFT" />);

    expect(html).toContain("Attivazione del cantiere");
    expect(html).toContain('aria-current="step"');
    expect(html).toContain("Completato:");
    expect(html).toContain("Da fare:");
    expect(html).toContain('href="#client-invitation-form"');
    expect(renderToStaticMarkup(<JobSiteActivationGuide agreementStatus="CONFIRMED" status="ACTIVE" />)).toBe("");
  });
});
