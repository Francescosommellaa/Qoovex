import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireAccountRole: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@shared/server/account-role-service", () => ({ requireAccountRole: mocks.requireAccountRole }));

import AccountInvitationsPage from "./page";

describe("AccountInvitationsPage", () => {
  beforeEach(() => {
    mocks.requireAccountRole.mockReset();
    mocks.requireAccountRole.mockResolvedValue({
      id: "professional-1",
      email: "professionista@example.com",
      emailVerified: new Date("2026-08-16T08:00:00.000Z"),
      accountRole: "PROFESSIONAL",
    });
  });

  it("spiega il percorso reale di accesso e la recovery senza inventare capability", async () => {
    const html = renderToStaticMarkup(await AccountInvitationsPage());

    expect(mocks.requireAccountRole).toHaveBeenCalledWith("PROFESSIONAL");
    expect(html).toContain("Il tuo accesso parte da un invito");
    expect(html).toContain("professionista@example.com");
    expect(html).toContain("L’Azienda ti invita");
    expect(html).toContain("Apri il link ricevuto");
    expect(html).toContain("Entra nei lavori assegnati");
    expect(html).toContain("chiedi all’Azienda");
    expect(html).toContain("inviare nuovamente l’invito");
    expect(html).toContain('href="/account/security"');
    expect(html).not.toMatch(/marketplace|candidatura|crea(?:re)? (?:un )?(?:lavoro|cantiere)/i);
  });
});
