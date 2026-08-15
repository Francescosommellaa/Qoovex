import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ChangeProposalActions } from "./JobSiteForms";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("azioni sulle proposte", () => {
  it("rende azioni esplicite sulla proposta mostrata senza esporre identificativi o versioni tecniche", () => {
    const html = renderToStaticMarkup(<ChangeProposalActions
      actionsEndpoint="/api/job-sites/job-site-1/actions"
      counterEndpoint="/api/job-sites/job-site-1/proposals/proposal-1"
      proposalId="proposal-1"
      revision={4}
      versionId="proposal-version-2"
      versionNumber={2}
    />);

    expect(html).toContain("Accetta la proposta mostrata");
    expect(html).toContain("Rifiuta questa proposta");
    expect(html).toContain("Prepara controproposta");
    expect(html).toContain("Le azioni riguardano soltanto la proposta mostrata sopra.");
    expect(html).not.toContain("proposal-1");
    expect(html).not.toContain("proposal-version-2");
    expect(html).not.toContain("Versione 2");
  });
});
