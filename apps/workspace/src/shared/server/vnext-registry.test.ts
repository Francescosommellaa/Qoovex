import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { assertVNextRegistry, PRODUCT_CAPABILITY_MANIFEST, VNEXT_ACTION_DEFINITIONS, VNEXT_PROCESS_DEFINITIONS } from "./vnext-registry";

describe("vNext product capability registry", () => {
  it("contains only reachable, tested active capabilities", () => {
    expect(assertVNextRegistry()).toBe(true);
    expect(Object.keys(VNEXT_PROCESS_DEFINITIONS)).toHaveLength(8);
    expect(VNEXT_ACTION_DEFINITIONS).not.toContain("GENERIC_UPDATE");
    for (const capability of PRODUCT_CAPABILITY_MANIFEST) {
      expect(capability.testIds.length).toBeGreaterThan(0);
      expect(existsSync(resolve(process.cwd(), `src/app${capability.api}/route.ts`))).toBe(true);
      if (capability.status === "ACTIVE") expect(existsSync(resolve(process.cwd(), `src/app${capability.route}/page.tsx`))).toBe(true);
    }
  });

  it("keeps implicit legacy product routes physically absent", () => {
    for (const route of ["dashboard", "job-sites", "documents", "evidence"]) expect(existsSync(resolve(process.cwd(), `src/app/${route}/page.tsx`))).toBe(false);
    for (const route of ["job-sites", "documents", "evidence"]) expect(existsSync(resolve(process.cwd(), `src/app/api/${route}/route.ts`))).toBe(false);
  });

  it("accounts for every vNext product API route", () => {
    const apiRoot = resolve(process.cwd(), "src/app/api");
    const routeFiles = ["org", "client", "contexts", "exports", "internal/vnext"].flatMap((root) => readdirSync(resolve(apiRoot, root), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name === "route.ts")
      .map((entry) => `/${["api", root, entry.parentPath.slice(resolve(apiRoot, root).length).replace(/\\/g, "/").replace(/^\//, "")].filter(Boolean).join("/")}`));
    const declared = new Set(PRODUCT_CAPABILITY_MANIFEST.map((capability) => capability.api));
    for (const route of routeFiles) expect(declared.has(route), `Missing capability for ${route}`).toBe(true);
  });

  it("preserves organization roles and multi-context membership invariants", () => {
    const schema = readFileSync(resolve(process.cwd(), "../../packages/db/prisma/schema.prisma"), "utf8");
    expect(schema.match(/enum OrganizationRole \{([\s\S]*?)\}/)?.[1]?.trim().split(/\s+/)).toEqual(["OWNER", "COLLABORATOR"]);
    expect(schema).toContain("@@unique([organizationId, userId])");
    expect(schema).toContain("userSideKey");
    expect(schema).toContain("primaryClientKey");
    expect(schema).toContain("participantAccessVersion");
    expect(schema).toContain("@@unique([organizationId, userId])");
    expect(schema).toMatch(
      /model JobSitePaymentTransferDeclaration[\s\S]*?@@unique\(\[paymentRequestId\]\)/,
    );
    expect(schema).toContain("receiptAttachmentId");
    expect(schema).not.toContain("JobSiteOperationalPhase");
    expect(schema).not.toMatch(/\bclientName\b/);
  });

  it("registers receipts for critical economic authority mutations", () => {
    expect(VNEXT_ACTION_DEFINITIONS).toContain("AUTHORITY_GRANT@1");
    expect(VNEXT_ACTION_DEFINITIONS).toContain("AUTHORITY_REVOKE@1");
    const route = readFileSync(resolve(process.cwd(), "src/app/api/org/[organizationId]/job-sites/[jobSiteId]/authority/route.ts"), "utf8");
    expect(route).toContain("requireIdempotencyKey");
    expect(route).toContain("resolveOrganizationJobSiteActor");
  });
});
