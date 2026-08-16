import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AccountRoleSelectionView, accountRoleChoices } from "./AccountRoleSelectionView";

describe("AccountRoleSelectionView", () => {
  it("spiega il percorso reale del Professionista prima della scelta", () => {
    const professional = accountRoleChoices.find((choice) => choice.role === "PROFESSIONAL");

    expect(professional).toMatchObject({
      label: "Professionista",
      description: expect.stringContaining("collaboratori e professionisti"),
      access: expect.stringContaining("invitarti come Collaboratore"),
      nextStep: expect.stringContaining("pagina di attesa"),
    });
    expect(professional?.access).toContain("accettare l’invito");
    expect(professional?.access).toContain("permessi ricevuti");
    expect(professional?.nextStep).toContain("tornerai all’invito");
  });

  it("rende visibili irreversibilità, contesto e conferma esplicita", () => {
    const html = renderToStaticMarkup(<AccountRoleSelectionView returnTo="/" />);

    expect(html).toContain("Dopo la conferma non potrai cambiarlo.");
    expect(html).toContain("Come accedi");
    expect(html).toContain("Dopo la scelta");
    expect(html).toContain("Scegli Professionista");
    expect(html).not.toContain("Scegli</button>");
  });
});
