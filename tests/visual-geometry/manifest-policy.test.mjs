import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateManifest, validateRouteCoverage } from "./manifest-policy.mjs";
import { discoverPageRoutes } from "./route-inventory.mjs";
import {
  ROUTE_CLASSIFICATIONS,
  VISUAL_INTERACTION_SETUP_IDS,
  VISUAL_SURFACES,
} from "./surface-manifest.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("duplicate surface IDs fail", () => {
  const duplicate = [
    { id: "sirio-button", app: "sirio", route: "/components/button", theme: "light", target: "button", snapshot: { name: "button.png" } },
    { id: "sirio-button", app: "sirio", route: "/components/card", theme: "light", target: "card", snapshot: { name: "card.png" } },
  ];
  assert.throws(() => validateManifest(duplicate, []), /duplicate surface id: sirio-button/);
});

test("unknown setup IDs fail", () => {
  assert.throws(
    () =>
      validateManifest(
        [
          {
            id: "sirio-button",
            app: "sirio",
            route: "/components/button",
            theme: "light",
            target: "button",
            setupId: "invented-state",
            snapshot: { name: "button.png" },
          },
        ],
        ["button-focus"],
      ),
    /unknown setup id: invented-state/,
  );
});

test("unclassified routes and unexplained exclusions fail", () => {
  assert.throws(
    () => validateRouteCoverage([{ app: "web", route: "/new-page" }], []),
    /unclassified route: web:\/new-page/,
  );
  assert.throws(
    () =>
      validateRouteCoverage(
        [{ app: "workspace", route: "/private" }],
        [{ app: "workspace", route: "/private", status: "excluded", reasonCode: "requires-authenticated-data", reason: "" }],
      ),
    /exclusion reason missing: workspace:\/private/,
  );
});

test("route discovery removes groups and preserves dynamic parameters", () => {
  const sirio = discoverPageRoutes(path.join(repositoryRoot, "apps/sirio/src/app"), "sirio");
  const workspace = discoverPageRoutes(path.join(repositoryRoot, "apps/workspace/src/app"), "workspace");

  assert(sirio.some((entry) => entry.route === "/components/button"));
  assert(!sirio.some((entry) => entry.route.includes("(catalog)")));
  assert(workspace.some((entry) => entry.route === "/job-sites/[jobSiteId]"));
});

test("the live manifest is valid and every page route is classified", () => {
  assert.doesNotThrow(() => validateManifest(VISUAL_SURFACES, VISUAL_INTERACTION_SETUP_IDS));

  const discovered = [
    ...discoverPageRoutes(path.join(repositoryRoot, "apps/sirio/src/app"), "sirio"),
    ...discoverPageRoutes(path.join(repositoryRoot, "apps/web/src/app"), "web"),
    ...discoverPageRoutes(path.join(repositoryRoot, "apps/workspace/src/app"), "workspace"),
  ];

  assert.doesNotThrow(() => validateRouteCoverage(discovered, ROUTE_CLASSIFICATIONS, VISUAL_SURFACES));
  assert.equal(new Set(ROUTE_CLASSIFICATIONS.map(({ app, route }) => `${app}:${route}`)).size, ROUTE_CLASSIFICATIONS.length);
});

test("the live manifest exercises semantic geometry beyond overflow", () => {
  const rules = VISUAL_SURFACES.flatMap((surface) => surface.geometry);
  const ruleTypes = new Set(rules.map((rule) => rule.type));
  const computedMetrics = new Set(rules.map((rule) => rule.metric).filter(Boolean));

  assert.deepEqual(ruleTypes, new Set(["overflow", "scalar", "pair", "rhythm"]));
  assert(computedMetrics.has("paddingLeft"));
  assert(computedMetrics.has("borderRadius"));
  assert(computedMetrics.has("gap"));

  for (const id of [
    "sirio-button-default",
    "sirio-controls-checked",
    "sirio-field-default",
    "sirio-dialog-open",
    "sirio-card-default",
  ]) {
    const surface = VISUAL_SURFACES.find((candidate) => candidate.id === id);
    assert(surface, `missing core surface: ${id}`);
    assert(surface.geometry.length > 1, `${id} must have live semantic geometry contracts`);
  }
});
