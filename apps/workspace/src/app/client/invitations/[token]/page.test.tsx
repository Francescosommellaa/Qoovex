import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getClientInvitationPageState: vi.fn(),
}));

vi.mock("@shared/server/job-site-lifecycle-service", () => ({
  getClientInvitationPageState: mocks.getClientInvitationPageState,
}));
vi.mock("@/views/workspace/WorkspacePrimitives", () => ({
  WorkspacePage: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
  WorkspacePageHeader: ({ title, description }: { title: string; description: string }) => <header><h1>{title}</h1><p>{description}</p></header>,
  WorkspacePanel: ({ title, children }: { title?: string; children: React.ReactNode }) => <section><h2>{title}</h2>{children}</section>,
}));
vi.mock("@/views/job-site/ClientInvitationAcceptAction", () => ({
  ClientInvitationAcceptAction: () => <button>Accetta e apri il lavoro</button>,
  ClientInvitationAccountRecoveryAction: () => <button>Cambia account</button>,
}));

import ClientInvitationPage from "./page";

async function renderInvitation(state: object) {
  mocks.getClientInvitationPageState.mockResolvedValue(state);
  return renderToStaticMarkup(await ClientInvitationPage({ params: Promise.resolve({ token: "token-riservato" }) }));
}

describe("pagina invito cliente", () => {
  beforeEach(() => {
    mocks.getClientInvitationPageState.mockReset();
  });

  it("mostra il contesto reale di un invito valido prima dell'unica azione primaria", async () => {
    const html = await renderInvitation({
      kind: "READY",
      organizationName: "Edilizia Aurora",
      jobSiteName: "Ristrutturazione via Roma",
      jobSiteAddress: "Via Roma 12, Milano",
    });

    expect(html).toContain("Azienda invitante");
    expect(html).toContain("Edilizia Aurora");
    expect(html).toContain("Ristrutturazione via Roma");
    expect(html).toContain("Via Roma 12, Milano");
    expect(html).toContain("come cliente principale");
    expect(html).toContain("Accetta e apri il lavoro");
    expect(html).not.toContain("token-riservato");
  });

  it.each([
    ["EXPIRED", "Invito scaduto", "Chiedi all&#x27;Azienda di inviartene uno nuovo."],
    ["REVOKED", "Invito revocato", "L&#x27;Azienda ha annullato questo invito."],
    ["ALREADY_ACCEPTED", "Invito già utilizzato", "non può essere usato di nuovo"],
    ["EMAIL_VERIFICATION_REQUIRED", "Verifica l&#x27;email prima di continuare", "riapri questo link"],
    ["ACCOUNT_ALREADY_PARTICIPATES", "Questo account è già collegato al lavoro", "un altro account Cliente"],
    ["SESSION_UNAVAILABLE", "Sessione non disponibile", "contatta Qoovex"],
    ["UNAVAILABLE", "Invito non disponibile", "non è valido oppure non può più essere usato"],
  ])("spiega lo stato %s senza esporre dettagli tecnici", async (kind, title, description) => {
    const html = await renderInvitation({ kind });

    expect(html).toContain(title);
    expect(html).toContain(description);
    expect(html).toContain('role="status"');
    expect(html).not.toContain("token-riservato");
  });

  it.each(["WRONG_ACCOUNT_EMAIL", "ACCOUNT_ROLE_MISMATCH"])("offre il cambio account quando lo stato %s lo consente", async (kind) => {
    const html = await renderInvitation({ kind });

    expect(html).toContain("Cambia account");
    expect(html).not.toContain("Accetta e apri il lavoro");
  });

  it("porta al lavoro soltanto l'account che ha già accettato e può ancora accedere", async () => {
    const html = await renderInvitation({ kind: "ALREADY_ACCEPTED_WITH_ACCESS", jobSiteId: "job-site-1" });

    expect(html).toContain("Invito già accettato");
    expect(html).toContain("Apri il lavoro");
    expect(html).toContain('href="/client/job-sites/job-site-1"');
  });
});
