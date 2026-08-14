import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AccountSecurityFlow } from "./AccountSecurityFlow";

describe("AccountSecurityFlow", () => {
  const initialStatus = { enabled: false, satisfied: true, backupCodesRemaining: 0, totpVerifiedAt: null };

  it("mostra l'export personale soltanto quando la superficie account lo abilita", () => {
    const html = renderToStaticMarkup(<AccountSecurityFlow initialStatus={initialStatus} mode="management" showDataExport />);

    expect(html).toContain("I tuoi dati");
    expect(html).toContain("informazioni del tuo profilo, i tuoi immobili e le partecipazioni ai lavori");
    expect(html).toContain('href="/api/client/data-export"');
  });

  it("non mostra l'export personale negli altri contesti account", () => {
    const html = renderToStaticMarkup(<AccountSecurityFlow initialStatus={initialStatus} mode="management" />);

    expect(html).not.toContain("/api/client/data-export");
  });
});
