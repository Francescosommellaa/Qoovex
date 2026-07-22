import { describe, expect, it } from "vitest";
import { workerDetailsHref, workerRouteId, workerRouteSlug } from "./worker-routes";

describe("worker routes", () => {
  it("builds a readable route while retaining the opaque identifier", () => {
    expect(workerRouteSlug({ id: "cm123", displayName: "Luca Verdì" })).toBe("luca-verdi--cm123");
    expect(workerDetailsHref({ id: "cm123", displayName: "Luca Verdì" })).toBe("/workers/luca-verdi--cm123");
  });

  it("extracts identifiers from readable and legacy routes", () => {
    expect(workerRouteId("luca-verdi--cm123")).toBe("cm123");
    expect(workerRouteId("cm123")).toBe("cm123");
  });

  it("preserves route context query parameters", () => {
    const query = new URLSearchParams({ from: "dashboard" });
    expect(workerDetailsHref({ id: "cm123", displayName: "Luca Verdi" }, query)).toBe("/workers/luca-verdi--cm123?from=dashboard");
  });
});
