import { describe, expect, it } from "vitest";
import { jobSiteDetailsHref, jobSiteRouteId, jobSiteRouteSlug } from "./job-site-routes";

describe("job site routes", () => {
  it("builds a readable route while keeping the stable id", () => {
    expect(jobSiteRouteSlug({ id: "cm123", name: "Ristrutturazione Via Roma" })).toBe("ristrutturazione-via-roma--cm123");
    expect(jobSiteDetailsHref({ id: "cm123", name: "Ristrutturazione Via Roma" })).toBe("/job-sites/ristrutturazione-via-roma--cm123");
  });

  it("normalizes names and preserves legacy id routes", () => {
    expect(jobSiteRouteSlug({ id: "cm456", name: "  Cantiere Città & Mare  " })).toBe("cantiere-citta-mare--cm456");
    expect(jobSiteRouteId("cantiere-citta-mare--cm456")).toBe("cm456");
    expect(jobSiteRouteId("cm456")).toBe("cm456");
  });
});
