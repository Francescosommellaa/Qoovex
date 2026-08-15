# Visual Geometry & Polish CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deterministic required-quality gate that protects Qoovex visual snapshots and measurable geometry across Sirio, Web, and DB-free Workspace surfaces.

**Architecture:** A machine-readable surface manifest drives Playwright screenshots and semantic geometry assertions. Pure Node modules validate route coverage, tolerances, diagnostics, baseline policy, static drift, and PR blast radius; a separate workflow runs the suite in pinned Playwright Noble while platform-specific baselines keep Windows and Linux raster evidence distinct.

**Tech Stack:** Node.js 24, pnpm 11.21.0, Playwright Test 1.62.0, Chromium, Next.js 16.2.11, React 19.2.8, Node `node:test`, GitHub Actions.

## Global Constraints

- Use `origin/master` as base and preserve the original dirty checkout.
- Do not add runtime dependencies, visual SaaS, external reviewers, database, Blob, auth fixtures, Production data, secrets, or deployment behavior.
- The required check name is exactly `visual-geometry`.
- CI uses `mcr.microsoft.com/playwright:v1.62.0-noble`; package and image versions must match.
- Canonical desktop viewport is `1440 × 1000`, DPR `1`, locale `it-IT`, timezone `Europe/Rome`.
- Responsive/mobile governance and 320/390/768 matrices remain out of scope.
- Font loading, font identity, Fontshare assets, `document.fonts.ready`, and font-family assertions are intentionally absent.
- External browser requests are aborted; only loopback app origins may load.
- Snapshot paths include `{platform}` and `{projectName}`; Windows and Linux baselines are reviewed independently.
- Geometry tolerances are `0px` by default and at most `1px` for documented optical relationships.
- Baselines are versioned; CI never runs update mode and never writes repository files.
- TDD is required for pure deterministic modules and CI policy.
- Every new manual folder has a focused README.
- Database operation impact remains zero.

---

### Task 1: Geometry contracts and readable diagnostics

**Files:**
- Create: `tests/visual-geometry/README.md`
- Create: `tests/visual-geometry/geometry-contracts.mjs`
- Create: `tests/visual-geometry/geometry-contracts.test.mjs`
- Create: `tests/visual-geometry/tolerance-policy.mjs`

**Interfaces:**
- Consumes: no task-local interfaces.
- Produces: `GEOMETRY_TOLERANCES`, `compareScalar`, `comparePair`, `compareRectOverflow`, `compareRepeatedRhythm`, `formatGeometryFailure`, and `GeometryContractError`.

- [ ] **Step 1: Write failing scalar and diagnostic tests**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { compareScalar, GeometryContractError } from "./geometry-contracts.mjs";

test("exact geometry passes and a 1px drift reports context", () => {
  assert.doesNotThrow(() => compareScalar({ surface: "sirio-button", state: "default", element: "button", metric: "height", expected: 32, actual: 32, tolerance: 0 }));
  assert.throws(
    () => compareScalar({ surface: "sirio-button", state: "default", element: "button", metric: "height", expected: 32, actual: 33, tolerance: 0 }),
    (error) => error instanceof GeometryContractError && /sirio-button[\s\S]*expected: 32px[\s\S]*actual: 33px[\s\S]*difference: 1px/.test(error.message),
  );
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/visual-geometry/geometry-contracts.test.mjs`

Expected: FAIL because `geometry-contracts.mjs` does not exist.

- [ ] **Step 3: Implement exact and optical tolerance policy**

```js
export const GEOMETRY_TOLERANCES = Object.freeze({ exact: 0, optical: 1 });

export class GeometryContractError extends Error {
  constructor(message, finding) {
    super(message);
    this.name = "GeometryContractError";
    this.finding = finding;
  }
}

export function compareScalar(input) {
  const difference = Math.abs(input.actual - input.expected);
  if (difference <= input.tolerance) return { ...input, difference };
  const finding = { ...input, difference };
  throw new GeometryContractError(formatGeometryFailure(finding), finding);
}
```

Implement pair alignment, overflow, same-size, spacing, center delta, and repeated-rhythm comparisons by reducing them to `compareScalar`; keep the formatted report limited to surface, state, element/relation, metric, expected, actual, difference, and tolerance.

- [ ] **Step 4: Add boundary, overflow, and rhythm tests**

```js
test("optical tolerance accepts 1px and rejects 1.01px", () => {
  assert.doesNotThrow(() => compareScalar({ surface: "brand", state: "default", element: "icon", metric: "center delta", expected: 0, actual: 1, tolerance: 1 }));
  assert.throws(() => compareScalar({ surface: "brand", state: "default", element: "icon", metric: "center delta", expected: 0, actual: 1.01, tolerance: 1 }));
});

test("overflow reports scroll and client dimensions", () => {
  assert.throws(() => compareRectOverflow({ surface: "dialog", state: "open", element: "dialog", clientWidth: 400, scrollWidth: 404, clientHeight: 300, scrollHeight: 300, tolerance: 0 }), /scrollWidth: 404px/);
});
```

- [ ] **Step 5: Run Task 1 tests and commit GREEN**

Run: `node --test tests/visual-geometry/geometry-contracts.test.mjs`

Expected: PASS with no warnings.

Commit:

```text
git add tests/visual-geometry
git commit -m "test(visual): add geometry contracts"
```

### Task 2: Manifest schema, route inventory, and coverage classification

**Files:**
- Create: `tests/visual-geometry/surface-manifest.mjs`
- Create: `tests/visual-geometry/manifest-policy.mjs`
- Create: `tests/visual-geometry/manifest-policy.test.mjs`
- Create: `tests/visual-geometry/route-inventory.mjs`

**Interfaces:**
- Consumes: tolerance categories from Task 1.
- Produces: `VISUAL_SURFACES`, `ROUTE_CLASSIFICATIONS`, `validateManifest`, `discoverPageRoutes`, `validateRouteCoverage`, and `summarizeCoverage`.

- [ ] **Step 1: Write failing manifest validation tests**

```js
test("duplicate IDs, unknown setup IDs, and unexplained exclusions fail", () => {
  const duplicate = [{ id: "sirio-button", app: "sirio", route: "/components/button" }, { id: "sirio-button", app: "sirio", route: "/components/card" }];
  assert.throws(() => validateManifest(duplicate, []), /duplicate surface id: sirio-button/);
  assert.throws(() => validateRouteCoverage(["/new-page"], []), /unclassified route: \/new-page/);
  assert.throws(() => validateRouteCoverage(["/private"], [{ route: "/private", status: "excluded", reason: "" }]), /exclusion reason/);
});
```

- [ ] **Step 2: Run manifest tests and verify RED**

Run: `node --test tests/visual-geometry/manifest-policy.test.mjs`

Expected: FAIL because the policy modules do not exist.

- [ ] **Step 3: Implement route discovery and strict classification**

`discoverPageRoutes(root, app)` must convert App Router paths to URL patterns, discard route groups, preserve `[param]`, and return stable sorted arrays. `validateRouteCoverage` accepts only `covered`, `represented`, or `excluded`; every exclusion has a reason code and explanation, and every `represented` route references a valid surface ID.

```js
export function validateRouteCoverage(discovered, classifications) {
  const byRoute = new Map(classifications.map((entry) => [entry.route, entry]));
  for (const route of discovered) {
    const entry = byRoute.get(route);
    if (!entry) throw new Error(`unclassified route: ${route}`);
    if (entry.status === "excluded" && (!entry.reasonCode || !entry.reason?.trim())) throw new Error(`exclusion reason missing: ${route}`);
  }
}
```

- [ ] **Step 4: Add the initial real surface matrix**

The critical manifest must include at least:

```text
sirio-foundation-spacing-light/dark
sirio-button-default/disabled/focus
sirio-controls-checked/error
sirio-field-default/error
sirio-select-open
sirio-tabs-selected
sirio-dialog-open
sirio-dropdown-open
sirio-tooltip-open
sirio-card-default
sirio-alert-error
sirio-empty
web-home-light/dark
workspace-sign-in-light/dark
```

Classify all discovered Sirio, Web, and Workspace page routes. Workspace authenticated/data-dependent pages are excluded with `requires-authenticated-data`; dynamic token pages use `requires-runtime-fixture`; Server/API routes are never part of page discovery.

- [ ] **Step 5: Test discovery against the live repository and commit**

Run: `node --test tests/visual-geometry/manifest-policy.test.mjs`

Expected: PASS and summary counts equal the discovered live route counts.

Commit:

```text
git add tests/visual-geometry
git commit -m "test(visual): define surface coverage manifest"
```

### Task 3: Blast radius, baseline governance, and static drift policy

**Files:**
- Create: `scripts/visual-geometry/README.md`
- Create: `scripts/visual-geometry/blast-radius.mjs`
- Create: `scripts/visual-geometry/snapshot-policy.mjs`
- Create: `scripts/visual-geometry/design-drift.mjs`
- Create: `scripts/visual-geometry/policy.test.mjs`

**Interfaces:**
- Consumes: surface tags and tiers from Task 2.
- Produces: `selectVisualScope`, `assertSnapshotUpdateAllowed`, `findDesignDrift`, and `VISUAL_UPDATE_ATTESTATION`.

- [ ] **Step 1: Write failing blast-radius and update-policy tests**

```js
test("shared UI and global token changes expand fail-safe", () => {
  assert.deepEqual(selectVisualScope(["packages/ui/src/components/button.tsx"]), { tier: "representative", apps: ["sirio", "web", "workspace"] });
  assert.deepEqual(selectVisualScope(["packages/ui/styles/tokens.css"]), { tier: "broad", apps: ["sirio", "web", "workspace"] });
  assert.deepEqual(selectVisualScope(["apps/web/src/app/page.tsx"]), { tier: "representative", apps: ["sirio", "web", "workspace"] });
});

test("CI can never update baselines", () => {
  assert.throws(() => assertSnapshotUpdateAllowed({ ci: true, attestation: "I_ACKNOWLEDGE_INTENTIONAL_VISUAL_CHANGE" }), /forbidden in CI/);
  assert.throws(() => assertSnapshotUpdateAllowed({ ci: false, attestation: "" }), /attestation/);
});
```

- [ ] **Step 2: Run policy tests and verify RED**

Run: `node --test scripts/visual-geometry/policy.test.mjs`

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Implement conservative selection and snapshot guard**

Unknown frontend extensions (`.tsx`, `.css`, `.svg`) select broad. Backend/docs-only paths keep critical. Visual infrastructure files select broad plus self-test. The update guard must inspect both `CI` and Playwright update-related CLI arguments before spawning Playwright.

- [ ] **Step 4: Add precise new-line drift detection**

Detect only added diff lines in shared UI/CSS for:

```text
arbitrary Tailwind spacing/radius/color values
geometry-related React inline styles
new repeated literal geometry values lacking an allowlist record
```

An exemption object must contain `{ file, property, value, reason }`. Add tests proving `w-[13px]` is reported, an allowlisted optical `translate-y-[1px]` passes, and unchanged historical values are ignored.

- [ ] **Step 5: Run policy tests and commit**

Run: `node --test scripts/visual-geometry/policy.test.mjs`

Expected: PASS.

Commit:

```text
git add scripts/visual-geometry
git commit -m "test(visual): enforce baseline and blast policies"
```

### Task 4: Sirio stable targets and state proof

**Files:**
- Modify: `apps/sirio/src/components/specimen.tsx`
- Modify: `apps/sirio/src/app/(catalog)/components/controls/page.tsx`
- Modify: existing Sirio component pages only where a required state is absent.
- Create: `apps/sirio/src/components/specimen.test.mjs`

**Interfaces:**
- Consumes: manifest IDs from Task 2.
- Produces: stable `[data-visual-surface]` and `[data-visual-specimen]` targets without creating alternative shared components.

- [ ] **Step 1: Write a failing static contract test for stable targets**

```js
test("Specimen exposes an intentional visual identifier", () => {
  const source = readFileSync(new URL("./specimen.tsx", import.meta.url), "utf8");
  assert.match(source, /visualId\?: string/);
  assert.match(source, /data-visual-specimen=\{visualId\}/);
});
```

- [ ] **Step 2: Run the Sirio contract test and verify RED**

Run: `node --test apps/sirio/src/components/specimen.test.mjs`

Expected: FAIL because `Specimen` has no `visualId` contract.

- [ ] **Step 3: Extend the existing Specimen composition**

Add an optional `visualId` prop and render `data-visual-specimen={visualId}` on the specimen frame. Add `data-visual-surface="sirio-catalog"` to the existing catalog content container; do not create a second catalog, primitive, provider, or local control implementation.

- [ ] **Step 4: Expose only missing real states**

Use existing shared imports to ensure the controls page contains stable examples for checked Checkbox/Switch/Radio, invalid Input, disabled control, and focus target. Existing dialog, dropdown, select, tabs, tooltip, field, alert, and empty pages receive `visualId` only on the specimens selected by the manifest.

- [ ] **Step 5: Run Sirio checks and commit**

Run:

```text
node --test apps/sirio/src/components/specimen.test.mjs
pnpm --filter @qoovex/sirio type-check
pnpm --filter @qoovex/sirio build
```

Expected: all PASS.

Commit:

```text
git add apps/sirio
git commit -m "test(sirio): expose visual geometry states"
```

### Task 5: Browser geometry adapter, stability fixture, and manifest-driven spec

**Files:**
- Create: `tests/visual-geometry/geometry-assertions.ts`
- Create: `tests/visual-geometry/interaction-setups.ts`
- Create: `tests/visual-geometry/stability.ts`
- Create: `tests/visual-geometry/visual-geometry.spec.ts`
- Create: `tests/visual-geometry/snapshot-style.css`
- Create: `playwright.visual-geometry.config.ts`

**Interfaces:**
- Consumes: geometry contracts, manifest, named setups, scope env from Tasks 1–3.
- Produces: the executable Playwright visual/geometry suite and platform-specific snapshot path contract.

- [ ] **Step 1: Write failing compile-time usage through the spec**

The spec imports `VISUAL_SURFACES`, filters by `QOOVEX_VISUAL_TIER` and `QOOVEX_VISUAL_APPS`, applies a named setup, executes geometry contracts, then calls `toHaveScreenshot` with the manifest snapshot name.

```ts
for (const surface of selectedSurfaces()) {
  test(`${surface.id} ${surface.state}`, async ({ page }) => {
    await prepareStablePage(page, surface);
    await INTERACTION_SETUPS[surface.setup](page, surface);
    await assertGeometry(page, surface);
    await expect(captureLocator(page, surface)).toHaveScreenshot(surface.snapshot.name, surface.snapshot.options);
  });
}
```

- [ ] **Step 2: Run TypeScript and verify RED**

Run: `pnpm exec playwright test --config playwright.visual-geometry.config.ts --list`

Expected: FAIL because adapter/config modules are missing.

- [ ] **Step 3: Implement stable browser preparation**

`prepareStablePage` must:

1. abort every request whose hostname is not loopback;
2. set theme class and stored theme before navigation;
3. install a fixed clock for dated surfaces;
4. navigate to the manifest app origin and route;
5. wait for `domcontentloaded` and the capture target;
6. wait for busy/skeleton markers to settle when declared;
7. avoid any font readiness check;
8. attach page errors and unexpected console errors to the failure.

- [ ] **Step 4: Implement named Base UI state setups**

Use exact role-qualified locators and final state assertions for `none`, `focus-visible`, `dialog-open`, `dropdown-open`, `select-open`, `tooltip-open`, `collapsible-expanded`, `tabs-selected`, and checked controls. Do not use arbitrary timeouts as state synchronization.

- [ ] **Step 5: Implement DOMRect/computed-style adapter**

Collect serializable measurements with `locator.evaluate`; dispatch by manifest rule kind to Task 1 comparators. Measure pre/post focus or pressed boxes before asserting no layout shift.

- [ ] **Step 6: Configure projects and snapshots**

Define `sirio-light`, `sirio-dark`, `web-light`, `web-dark`, `workspace-light`, and `workspace-dark` projects with app-specific `baseURL`. Use:

```ts
snapshotPathTemplate: "{testDir}/__snapshots__/{platform}/{projectName}/{arg}{ext}"
```

Set workers `1`, retries `0`, Chromium only, HTML + line/GitHub reporters, trace on first retry disabled because retries are zero but trace retained on failure, and `outputDir: "output/visual-geometry/test-results"`.

- [ ] **Step 7: Verify list/compile and commit**

Run:

```text
pnpm exec playwright test --config playwright.visual-geometry.config.ts --list
pnpm check:fast
```

Expected: the manifest tests are listed once in the correct theme/app projects and type-check passes.

Commit:

```text
git add playwright.visual-geometry.config.ts tests/visual-geometry
git commit -m "test(visual): run manifest geometry in Playwright"
```

### Task 6: Runner, platform baselines, self-test, and developer commands

**Files:**
- Create: `scripts/visual-geometry/run.mjs`
- Create: `scripts/visual-geometry/report.mjs`
- Create: `scripts/visual-geometry/self-test.mjs`
- Create: `scripts/visual-geometry/runner.test.mjs`
- Create: `tests/visual-geometry/__snapshots__/README.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: Tasks 2–5 and Git diff inputs.
- Produces: `visual:geometry`, `visual:geometry:update`, `visual:geometry:report`, and `visual:geometry:self-test`.

- [ ] **Step 1: Write failing runner tests**

```js
test("run mode never forwards update flags", () => {
  assert.deepEqual(buildPlaywrightArgs({ mode: "run" }), ["playwright", "test", "--config", "playwright.visual-geometry.config.ts"]);
});

test("update mode is platform-local and forbidden in CI", () => {
  assert.throws(() => buildRunPlan({ mode: "update", ci: true, attestation: VISUAL_UPDATE_ATTESTATION }), /forbidden in CI/);
  assert.match(buildRunPlan({ mode: "update", ci: false, attestation: VISUAL_UPDATE_ATTESTATION }).platform, /^(win32|linux|darwin)$/);
});
```

- [ ] **Step 2: Run runner tests and verify RED**

Run: `node --test scripts/visual-geometry/runner.test.mjs`

Expected: FAIL because `run.mjs` does not exist.

- [ ] **Step 3: Implement cross-platform process orchestration**

The runner uses `spawnSync` with argument arrays and `shell: false`. It derives changed files from `QOOVEX_VISUAL_CHANGED_FILES` or `git diff --name-only <base> HEAD`, runs pure validation/self-test first, builds selected apps, and invokes Playwright with the selected tier/apps env. It never uses DB startup commands.

- [ ] **Step 4: Implement the infrastructure meta-canary**

Use a temporary directory and tiny local HTTP server. The self-test must launch Playwright against deterministic HTML, prove exact screenshot pass, mutate a 32px square to 33px, and assert the nested Playwright process exits non-zero. Missing baseline must also exit non-zero. Temporary snapshots stay under the OS temp directory.

- [ ] **Step 5: Add root scripts**

```json
{
  "visual:geometry": "node scripts/visual-geometry/run.mjs run",
  "visual:geometry:update": "node scripts/visual-geometry/run.mjs update",
  "visual:geometry:report": "node scripts/visual-geometry/report.mjs",
  "visual:geometry:self-test": "node scripts/visual-geometry/run.mjs self-test"
}
```

- [ ] **Step 6: Run self-tests and create reviewed win32 baselines**

Run:

```text
pnpm visual:geometry:self-test
$env:QOOVEX_VISUAL_BASELINE_UPDATE="I_ACKNOWLEDGE_INTENTIONAL_VISUAL_CHANGE"; pnpm visual:geometry:update
pnpm visual:geometry
```

Expected: self-test PASS, explicit update creates only `__snapshots__/win32/**`, normal run PASS.

- [ ] **Step 7: Commit runner and Windows evidence**

```text
git add package.json scripts/visual-geometry tests/visual-geometry/__snapshots__
git commit -m "test(visual): add governed visual runner"
```

### Task 7: Dedicated secure GitHub required check

**Files:**
- Create: `.github/workflows/visual-geometry.yml`
- Create: `scripts/visual-geometry/workflow-contract.test.mjs`

**Interfaces:**
- Consumes: root commands from Task 6.
- Produces: GitHub check `visual-geometry`, Linux actual/diff artifacts, and no write-capable permissions.

- [ ] **Step 1: Write failing workflow contract tests**

```js
test("visual workflow is read-only and cannot update snapshots", () => {
  const workflow = readFileSync(".github/workflows/visual-geometry.yml", "utf8");
  assert.match(workflow, /name:\s*visual-geometry/);
  assert.match(workflow, /permissions:\s*\n\s*contents:\s*read/);
  assert.doesNotMatch(workflow, /update-snapshots|visual:geometry:update|contents:\s*write/);
  assert.match(workflow, /retention-days:\s*7/);
});
```

- [ ] **Step 2: Run contract test and verify RED**

Run: `node --test scripts/visual-geometry/workflow-contract.test.mjs`

Expected: FAIL because the workflow is missing.

- [ ] **Step 3: Implement the workflow**

Use `pull_request`, `push` to `master`, and `workflow_dispatch`; `contents: read`; pinned checkout/pnpm/setup-node/upload-artifact SHAs matching repository policy; job container `mcr.microsoft.com/playwright:v1.62.0-noble`; frozen install; `pnpm visual:geometry:self-test`; `pnpm visual:geometry`; and `git diff --check`. Upload `output/visual-geometry/playwright-report` and `output/visual-geometry/test-results` only on failure for 7 days.

- [ ] **Step 4: Run contract and YAML-sensitive checks**

Run:

```text
node --test scripts/visual-geometry/workflow-contract.test.mjs
pnpm check:fast
git diff --check
```

Expected: PASS.

- [ ] **Step 5: Commit CI integration**

```text
git add .github/workflows/visual-geometry.yml scripts/visual-geometry/workflow-contract.test.mjs
git commit -m "ci: add visual geometry quality gate"
```

### Task 8: Canonical documentation, Impeccable review, Linux baselines, and PR closure

**Files:**
- Modify: `docs/07_QUALITY_AND_RELEASE.md`
- Modify: `project_brain.json`
- Modify: `AGENTS.md` only if agent workflow needs a new mandatory command.
- Modify: `tests/visual-geometry/__snapshots__/linux/**` after manual artifact review.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: canonical implemented-decision documentation, complete platform baselines, verification evidence, and PR to `master`.

- [ ] **Step 1: Document only implemented behavior**

Add `Visual Geometry quality gate` to `docs/07_QUALITY_AND_RELEASE.md` with manifest, two-layer enforcement, platform baselines, explicit update policy, font exclusion, theme/tier/blast behavior, artifacts, and responsive boundary. Update `project_brain.json` with an `implemented_decision` only after local gates pass. Keep Database operation impact at zero.

- [ ] **Step 2: Run the manual Impeccable detector once**

Run:

```text
node A:\Qoovex\.agents\skills\impeccable\scripts\detect.mjs --json apps/sirio/src/components/specimen.tsx apps/sirio/src/app/(catalog)/components/controls/page.tsx
pnpm verify:impeccable
```

Resolve applicable findings or record evidence-backed exceptions. Confirm no production motion was added; reduced motion is used only as test emulation.

- [ ] **Step 3: Execute complete local verification**

Run:

```text
pnpm visual:geometry:self-test
pnpm visual:geometry
pnpm check:fast
pnpm check
git diff --check
```

If Skill Governance is present after rebasing onto current `origin/master`, also run `pnpm skills:doctor` without importing unmerged branch work.

- [ ] **Step 4: Push and open the PR**

```text
git push -u origin codex/visual-geometry-polish-ci
gh pr create --base master --head codex/visual-geometry-polish-ci --title "ci: add visual geometry quality gate" --body "Adds the manifest-driven Playwright visual-geometry required check, semantic DOM geometry assertions, governed platform baselines, fail-safe blast selection, and failure artifacts. Font verification and responsive/mobile governance are intentionally excluded. Database and Blob impact: zero."
```

The PR body reports architecture, measurable coverage counts, geometry rules, baseline policy, hidden states, cross-consumer protection, blast radius, CI trigger, commands, actual verification evidence, font limitation, physical-mm limitation, and zero database impact.

- [ ] **Step 5: Promote reviewed Linux actual artifacts manually**

The first Linux run is expected to fail for missing `linux` baselines. Download its failure artifact, inspect each `actual.png`, copy only approved images to `tests/visual-geometry/__snapshots__/linux/<project>/<snapshot>.png`, and commit:

```text
git add tests/visual-geometry/__snapshots__/linux
git commit -m "test(visual): approve Linux geometry baselines"
git push
```

Do not run update mode in CI and do not script the copy from artifact to baseline.

- [ ] **Step 6: Verify remote checks on the same SHA**

Use `gh pr checks --watch` and record run IDs for `visual-geometry`, `push-gate`, `quality-gate`, and `workspace-e2e`. Fix failures through focused tests and new commits; do not merge.

- [ ] **Step 7: Append the Qoovex Brain session log**

After all gates are green, append via `qoovex_brain.append_file` to `00_System/session-log.md` with date, task, PR, exact SHA, run IDs, commands, modified file groups, font exception, and zero DB/Blob impact.

- [ ] **Step 8: Final self-review**

Confirm:

```text
no critical shared surface is unclassified
no automatic baseline update exists
no tolerance hides a diff
hidden states and light/dark critical coverage exist
external browser network is blocked
font checks are absent by explicit instruction
shared/global blast radius is fail-safe
no LLM or visual SaaS is a release gate
no mobile governance was added
optical exceptions are intentional
database/auth/business logic are untouched
```

Report the remaining manual branch-protection action: add `visual-geometry` as a required check after it exists and is green.
