import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getOrganizationHomeWorkQueueGroup } from "@shared/lib/organization-home-work-queue";
import { OrganizationHomeWorkQueue } from "./OrganizationHomeWorkQueue";

describe("OrganizationHomeWorkQueue", () => {
  it("raggruppa le attività con criteri umani, senza duplicarle", () => {
    const items = [{
      detail: "Invita il cliente principale per avviare il flusso condiviso.",
      href: "/job-sites/cucina#client-invitation-form",
      id: "invite-client",
      jobSiteName: "Ristrutturazione cucina",
      kind: "INVITE_PRIMARY_CLIENT" as const,
      priority: "attention" as const,
    }, {
      detail: "L'invito è stato inviato e il cliente deve accettarlo.",
      href: "/job-sites/bagno#impostazioni",
      id: "client-invitation-pending",
      jobSiteName: "Bagno principale",
      kind: "CLIENT_INVITATION_PENDING" as const,
      priority: "default" as const,
    }, {
      detail: "Consegna materiali: il cliente ha inviato una dichiarazione da rivedere.",
      href: "/job-sites/cucina#pagamenti",
      id: "payment-review",
      jobSiteName: "Ristrutturazione cucina",
      kind: "PAYMENT_DECLARATION_REVIEW" as const,
      priority: "attention" as const,
    }];
    const html = renderToStaticMarkup(<OrganizationHomeWorkQueue items={items} />);

    expect(html).toContain("Cosa richiede attenzione");
    expect(html).toContain("Richiede te");
    expect(html).toContain("Attende cliente");
    expect(html).toContain("Da verificare");
    expect(html).toContain("1 attività");
    expect(html.match(/<h4[^>]*>Invita il cliente principale<\/h4>/g)).toHaveLength(1);
    expect(html.match(/Attendi l&#x27;accettazione del cliente/g)).toHaveLength(1);
    expect(html).toContain("Controlla la dichiarazione di pagamento");
    expect(html).toContain("Ristrutturazione cucina");
    expect(html).toContain("Deve intervenire:");
    expect(html).toContain("Azienda");
    expect(html).toContain('href="/job-sites/cucina#client-invitation-form"');
    expect(html).toContain('href="/job-sites/bagno#impostazioni"');
    expect(html).toContain('href="/job-sites/cucina#pagamenti"');
    expect(html).not.toContain("PAYMENT_DECLARATION_REVIEW");
    expect(html).not.toContain("payment-review");
  });

  it("mantiene espliciti i gruppi vuoti accanto a quelli con attività", () => {
    const html = renderToStaticMarkup(<OrganizationHomeWorkQueue items={[{
      detail: "Il cliente ha confermato la chiusura; l'Azienda deve registrare la conferma finale.",
      href: "/job-sites/cucina#chiusura",
      id: "closure-confirmation",
      jobSiteName: "Ristrutturazione cucina",
      kind: "CLOSURE_CONFIRMATION",
      priority: "attention",
    }]} />);

    expect(html).toContain("Conferma la chiusura");
    expect(html).toContain("Nessuna attività è in attesa del cliente.");
    expect(html).toContain("Nessun elemento da verificare al momento.");
  });

  it("rende un empty state per ciascun gruppo e classifica ogni tipo una sola volta", () => {
    const html = renderToStaticMarkup(<OrganizationHomeWorkQueue items={[]} />);

    expect(html).toContain("Non ci sono azioni immediate dell&#x27;Azienda.");
    expect(html).toContain("Nessuna attività è in attesa del cliente.");
    expect(html).toContain("Nessun elemento da verificare al momento.");
    expect(new Set([
      getOrganizationHomeWorkQueueGroup("INVITE_PRIMARY_CLIENT"),
      getOrganizationHomeWorkQueueGroup("CLIENT_INVITATION_PENDING"),
      getOrganizationHomeWorkQueueGroup("PAYMENT_DECLARATION_REVIEW"),
    ])).toEqual(new Set(["ACTION_REQUIRED", "AWAITING_CLIENT", "REVIEW"]));
  });
});
