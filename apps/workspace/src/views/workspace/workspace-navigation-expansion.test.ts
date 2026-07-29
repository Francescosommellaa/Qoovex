import { describe, expect, it } from "vitest";
import { ensureExpandedJobSiteId, normalizeExpandedJobSiteIds, toggleExpandedJobSiteIds } from "./workspace-navigation-expansion";

describe("workspace job-site navigation expansion", () => {
  it("keeps multiple job sites open on a wide desktop sidebar", () => {
    expect([...toggleExpandedJobSiteIds(new Set(["site-1"]), "site-2", false)]).toEqual(["site-1", "site-2"]);
  });

  it("opens only the selected job site in compact and mobile modes", () => {
    expect([...toggleExpandedJobSiteIds(new Set(["site-1"]), "site-2", true)]).toEqual(["site-2"]);
    expect([...toggleExpandedJobSiteIds(new Set(["site-2"]), "site-2", true)]).toEqual([]);
  });

  it("keeps the current job site when switching from wide to exclusive mode", () => {
    expect([...normalizeExpandedJobSiteIds(new Set(["site-1", "site-2", "site-3"]), "site-2")]).toEqual(["site-2"]);
    expect([...normalizeExpandedJobSiteIds(new Set(["site-1", "site-3"]), null)]).toEqual(["site-3"]);
  });

  it("auto-opens the current job site according to the active mode", () => {
    expect([...ensureExpandedJobSiteId(new Set(["site-1"]), "site-2", false)]).toEqual(["site-1", "site-2"]);
    expect([...ensureExpandedJobSiteId(new Set(["site-1"]), "site-2", true)]).toEqual(["site-2"]);
  });
});
