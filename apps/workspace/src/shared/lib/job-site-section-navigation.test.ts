import { describe, expect, it } from "vitest";
import {
  getClientJobSiteNavigationSections,
  getOrganizationJobSiteNavigationSections,
} from "./job-site-section-navigation";

describe("server-safe JobSite section navigation policy", () => {
  it("derives organization sections without importing a client component", () => {
    expect(getOrganizationJobSiteNavigationSections({ status: "DRAFT", hasClosure: false })).not.toContain("closure");
    expect(getOrganizationJobSiteNavigationSections({ status: "ACTIVE", hasClosure: false })).toContain("closure");
    expect(getOrganizationJobSiteNavigationSections({ status: "CLOSED", hasClosure: false })).toContain("archive");
  });

  it("limits a pending client to the initial review", () => {
    expect(getClientJobSiteNavigationSections({ status: "PENDING_INITIAL_CONFIRMATION", hasClosure: false })).toEqual(["overview"]);
  });
});
