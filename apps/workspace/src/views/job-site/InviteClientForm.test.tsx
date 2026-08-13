import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { InviteClientForm, resolveMutationFailure } from "./JobSiteForms";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("invito del cliente", () => {
  const common = { endpoint: "/api/job-sites/job-1/client-invitations", id: "client-invitation-form", jobSiteName: "Ristrutturazione via Roma", revision: 3 };

  it("contestualizza l'invito in bozza e spiega il passaggio successivo", () => {
    const html = renderToStaticMarkup(<InviteClientForm {...common} status="DRAFT" />);

    expect(html).toContain("Invita un cliente a Ristrutturazione via Roma");
    expect(html).toContain("Email del cliente");
    expect(html).toContain("accedere a Qoovex con la stessa email");
    expect(html).toContain("Dopo l&#x27;invio, il cliente dovrà accettare l&#x27;invito.");
    expect(html).toContain("Invia invito");
  });

  it("sostituisce il form con lo stato inviato e la revoca quando il cliente deve agire", () => {
    const html = renderToStaticMarkup(<InviteClientForm {...common} pendingInvitation={{ emailNormalized: "cliente@example.com", expiresAt: "2026-08-27T12:00:00.000Z", id: "invite-1" }} status="WAITING_FOR_CLIENT" />);

    expect(html).toContain("Invito inviato");
    expect(html).toContain("Ristrutturazione via Roma");
    expect(html).toContain("cliente@example.com");
    expect(html).toContain("Ora il cliente deve accedere a Qoovex");
    expect(html).toContain("Revoca invito");
    expect(html).not.toContain("Invia invito");
    expect(html).not.toContain("<form");
  });

  it("mantiene l'errore dell'email locale e comprensibile", () => {
    const focus = vi.fn();
    const form = { elements: [{ focus, name: "email" }] } as unknown as HTMLFormElement;

    expect(resolveMutationFailure(form, { message: "Controlla i campi indicati.", fieldErrors: { email: ["Invalid email"] } })).toEqual({
      error: null,
      fieldErrors: { email: ["Inserisci un indirizzo email valido."] },
      firstFieldName: "email",
    });
  });
});
