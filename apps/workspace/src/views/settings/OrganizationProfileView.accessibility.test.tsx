import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { OrganizationProfileView } from "./OrganizationProfileView";

const data = {
  organization: { id: "organization-1", name: "Edilizia Rossi", code: "QVX-1" },
  profile: {
    id: "profile-1",
    organizationId: "organization-1",
    legalName: "Edilizia Rossi Srl",
    taxCode: "RSSMRA80A01H501U",
    vatNumber: "IT12345678901",
    registeredOfficeAddress: "Via Roma 1, Milano",
    operatingDescription: "Ristrutturazioni residenziali",
    specializations: ["Impianti", "Restauro"],
    createdAt: "2026-08-12T10:00:00.000Z",
    updatedAt: "2026-08-13T10:00:00.000Z",
  },
  contacts: [],
};

describe("OrganizationProfileView", () => {
  it("renders an editable, labelled and controlled organization profile", () => {
    const html = renderToStaticMarkup(<OrganizationProfileView canUpdate data={data} />);

    expect(html).toContain('name="legalName"');
    expect(html).toContain('value="Edilizia Rossi Srl"');
    expect(html).toContain('autoComplete="organization"');
    expect(html).toContain('required=""');
    expect(html).toContain('for="profile-legal-name"');
    expect(html).toContain('aria-describedby="profile-specializations-description"');
    expect(html).toContain('aria-busy="false"');
  });

  it("disables every profile control for a read-only role", () => {
    const html = renderToStaticMarkup(<OrganizationProfileView canUpdate={false} data={data} />);

    expect(html).toContain("Profilo in sola lettura per il ruolo corrente.");
    expect(html).not.toContain("Salva profilo");
    expect((html.match(/ disabled=""/g) ?? []).length).toBeGreaterThanOrEqual(6);
  });
});
