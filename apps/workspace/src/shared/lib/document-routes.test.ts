import { describe, expect, it } from "vitest";
import { documentDetailsHref, documentRouteId, documentRouteSlug } from "./document-routes";

describe("document routes", () => {
  it("builds a readable route while retaining the opaque identifier", () => {
    expect(documentRouteSlug({ id: "cm123", title: "DURC · Edilità Nord" })).toBe("durc-edilita-nord--cm123");
    expect(documentDetailsHref({ id: "cm123", title: "DURC · Edilità Nord" })).toBe("/documents/durc-edilita-nord--cm123");
  });

  it("extracts identifiers from readable and legacy routes", () => {
    expect(documentRouteId("durc-edilita-nord--cm123")).toBe("cm123");
    expect(documentRouteId("cm123")).toBe("cm123");
  });

  it("preserves route context query parameters", () => {
    const query = new URLSearchParams({ from: "dashboard" });
    expect(documentDetailsHref({ id: "cm123", title: "Verbale avvio" }, query)).toBe("/documents/verbale-avvio--cm123?from=dashboard");
  });
});
