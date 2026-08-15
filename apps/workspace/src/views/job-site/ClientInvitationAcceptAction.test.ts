import { describe, expect, it, vi } from "vitest";
import { clientJobSitePath, navigateToAcceptedClientJobSite, presentClientInvitationAcceptanceError } from "./ClientInvitationAcceptAction";

describe("destinazione dopo l'accettazione dell'invito cliente", () => {
  it("apre direttamente il cantiere restituito dall'accettazione", () => {
    expect(clientJobSitePath({ jobSiteId: "job-site-1" })).toBe("/client/job-sites/job-site-1");
  });

  it("sostituisce la pagina dell'invito senza passare dalla dashboard", () => {
    const replace = vi.fn();

    navigateToAcceptedClientJobSite({ jobSiteId: "job-site-1" }, replace);

    expect(replace).toHaveBeenCalledOnce();
    expect(replace).toHaveBeenCalledWith("/client/job-sites/job-site-1");
  });

  it("non costruisce una destinazione ambigua se manca l'identificativo", () => {
    expect(() => clientJobSitePath({ jobSiteId: " " })).toThrow("non è stato possibile aprire il cantiere");
  });

  it("traduce gli errori di accettazione senza esporre messaggi tecnici", () => {
    expect(presentClientInvitationAcceptanceError("L'invito appartiene a un'altra email.")).toContain("altro indirizzo email");
    expect(presentClientInvitationAcceptanceError("Invito scaduto o non disponibile.")).toContain("nuovo invito");
    expect(presentClientInvitationAcceptanceError("errore interno raw")).toBe("Non è stato possibile accettare l'invito. Riprova oppure chiedi aiuto all'Azienda.");
  });
});
