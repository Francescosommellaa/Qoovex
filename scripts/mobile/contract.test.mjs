import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  discoverAppPageRoutes,
  loadMobileContract,
  validateMobileContract,
  validateRouteCoverage,
} from "./contract.mjs";

const validContract = {
  version: 1,
  viewports: [
    { id: "compact", width: 320, height: 720 },
    { id: "phone", width: 390, height: 844 },
    { id: "tablet", width: 768, height: 1024 },
    { id: "laptop", width: 1024, height: 768 },
    { id: "desktop", width: 1440, height: 900 },
  ],
  scenarios: {
    pointer: ["coarse-touch", "fine-hover"],
    orientation: ["portrait", "landscape"],
    accessibility: ["zoom-200", "reduced-motion"],
    viewport: ["safe-area", "software-keyboard"],
  },
  surfaces: [
    {
      id: "web-public",
      app: "web",
      owner: "apps/web",
      routePatterns: ["/", "/contattaci"],
      runtimeRoutes: ["/", "/contattaci"],
      requiredScenarios: ["coarse-touch", "zoom-200", "safe-area"],
    },
  ],
  exclusions: [],
  impact: {
    fullSuitePaths: ["packages/ui/**", "config/mobile-experience.json"],
    groups: { web: ["apps/web/**"] },
  },
};

test("loads the checked-in contract as JSON", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "qoovex-mobile-contract-"));
  const contractPath = path.join(directory, "contract.json");
  await writeFile(contractPath, JSON.stringify(validContract), "utf8");

  assert.deepEqual(await loadMobileContract(contractPath), validContract);
});

test("rejects a contract that drops a canonical viewport", () => {
  const contract = structuredClone(validContract);
  contract.viewports = contract.viewports.filter(({ width }) => width !== 320);

  const result = validateMobileContract(contract);

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /canonical viewport 320/i);
});

test("rejects a contract without touch, orientation, zoom, motion, safe-area, and keyboard coverage", () => {
  const contract = structuredClone(validContract);
  contract.scenarios = { pointer: ["fine-hover"] };

  const result = validateMobileContract(contract);

  assert.equal(result.ok, false);
  for (const scenario of [
    "coarse-touch",
    "portrait",
    "landscape",
    "zoom-200",
    "reduced-motion",
    "safe-area",
    "software-keyboard",
  ]) {
    assert.match(result.errors.join("\n"), new RegExp(scenario, "i"));
  }
});

test("rejects exclusions that have no accountable owner and reason", () => {
  const contract = structuredClone(validContract);
  contract.exclusions = [{ app: "web", pattern: "/legacy/**", reason: "" }];

  const result = validateMobileContract(contract);

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /exclusion.*owner/i);
  assert.match(result.errors.join("\n"), /exclusion.*reason/i);
});

test("discovers Next page routes while ignoring route groups and API handlers", async () => {
  const root = path.join(
    tmpdir(),
    `qoovex-mobile-routes-${process.pid}-${Date.now()}`,
  );
  await Promise.all([
    writePage(root, "apps/web/src/app/page.tsx"),
    writePage(root, "apps/web/src/app/(marketing)/faq/page.tsx"),
    writePage(root, "apps/web/src/app/blog/[slug]/page.tsx"),
    writePage(root, "apps/web/src/app/api/health/route.ts"),
  ]);

  assert.deepEqual(await discoverAppPageRoutes(root, "web"), [
    "/",
    "/blog/[slug]",
    "/faq",
  ]);
});

test("reports a newly added route that has no surface or explicit exclusion", () => {
  const result = validateRouteCoverage(validContract, {
    web: ["/", "/contattaci", "/new-unowned-page"],
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.uncovered, ["web:/new-unowned-page"]);
});

async function writePage(root, relativePath) {
  const absolutePath = path.join(root, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, "export default function Page() {}\n", "utf8");
}
