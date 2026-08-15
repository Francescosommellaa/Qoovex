import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { assertJobSiteRegistry, PRODUCT_CAPABILITY_MANIFEST, JOB_SITE_ACTION_DEFINITIONS, JOB_SITE_PROCESS_DEFINITIONS } from "./job-site-registry";

describe("current product capability registry", () => {
  it("contains only reachable, tested active capabilities", () => {
    expect(assertJobSiteRegistry()).toBe(true);
    expect(Object.keys(JOB_SITE_PROCESS_DEFINITIONS)).toHaveLength(8);
    expect(JOB_SITE_ACTION_DEFINITIONS).not.toContain("GENERIC_UPDATE");
    for (const capability of PRODUCT_CAPABILITY_MANIFEST) {
      expect(capability.testIds.length).toBeGreaterThan(0);
      expect(existsSync(resolve(process.cwd(), `src/app${capability.api}/route.ts`))).toBe(true);
      if (capability.status === "ACTIVE") expect(existsSync(resolve(process.cwd(), `src/app${capability.route}/page.tsx`))).toBe(true);
    }
  });

  it("accounts for every current product API route", () => {
    const apiRoot = resolve(process.cwd(), "src/app/api");
    const routeFiles = ["job-sites", "people", "payment-profile", "client", "exports", "internal/job-sites"].flatMap((root) => readdirSync(resolve(apiRoot, root), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name === "route.ts")
      .map((entry) => `/${["api", root, entry.parentPath.slice(resolve(apiRoot, root).length).replace(/\\/g, "/").replace(/^\//, "")].filter(Boolean).join("/")}`))
      .concat("/api/account/notification-preferences");
    const declared = new Set(PRODUCT_CAPABILITY_MANIFEST.map((capability) => capability.api));
    for (const route of routeFiles) expect(declared.has(route), `Missing capability for ${route}`).toBe(true);
  });

  it("preserves organization roles and the single active membership invariant", () => {
    const schema = readFileSync(resolve(process.cwd(), "../../packages/db/prisma/schema.prisma"), "utf8");
    const migration = readFileSync(resolve(process.cwd(), "../../packages/db/prisma/migrations/20260809020000_single_active_organization_membership/migration.sql"), "utf8");
    expect(schema.match(/enum OrganizationRole \{([\s\S]*?)\}/)?.[1]?.trim().split(/\s+/)).toEqual(["OWNER", "COLLABORATOR"]);
    expect(schema).toContain("@@unique([organizationId, userId])");
    expect(migration).toContain('CREATE UNIQUE INDEX "OrganizationMembership_one_active_organization_per_user"');
    expect(migration).toContain('WHERE "revokedAt" IS NULL');
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
    expect(JOB_SITE_ACTION_DEFINITIONS).toContain("AUTHORITY_GRANT@1");
    expect(JOB_SITE_ACTION_DEFINITIONS).toContain("AUTHORITY_REVOKE@1");
    const route = readFileSync(resolve(process.cwd(), "src/app/api/job-sites/[jobSiteId]/authority/route.ts"), "utf8");
    expect(route).toContain("requireIdempotencyKey");
    expect(route).toContain("resolveOrganizationJobSiteActor");
  });
});
