# Mobile & Responsive Experience CI — Design

**Date:** 2026-08-15  
**Status:** Approved by the current user brief  
**Scope:** Qoovex monorepo quality infrastructure and the minimum UI remediations required to make that infrastructure meaningful

## Outcome

Qoovex gains a third, independent quality gate for mobile and responsive behavior. The gate combines a versioned machine-readable contract, deterministic static validation, change-impact analysis, and Playwright checks against real Web, Workspace, Sirio, and shared-UI behavior. It protects mobile interaction quality without introducing a device farm, visual-diff SaaS, a new runtime dependency, or a second design system.

## Authority and boundaries

The current brief defines the required coverage and completion criteria. Existing product, security, tenancy, and design contracts remain authoritative. The work may change quality scripts, Playwright configuration, CI, docs, and narrowly scoped UI behavior. It may not change schema, migrations, auth rules, business logic, storage semantics, or production data.

Runtime Workspace coverage uses the existing development authentication and an ephemeral local/CI PostgreSQL target. It never points to Preview or Production. Blob storage is outside the mobile gate because the covered flows do not require it.

## Architecture

### 1. Machine-readable contract

`config/mobile-experience.json` is the source of truth for:

- canonical viewport widths: 320, 390, 768, 1024, and 1440 pixels;
- touch, fine-pointer, reduced-motion, orientation, zoom/reflow, safe-area, and software-keyboard scenarios;
- owned surfaces and representative routes for Web, Workspace, and Sirio;
- required interaction assertions and allowed, documented exclusions;
- source areas that trigger each runtime group through blast-radius analysis.

The contract describes coverage; it does not invent product capabilities. Every discovered app route must be represented by an explicit surface, a route pattern, or a reasoned exclusion.

### 2. Doctor and static detectors

`scripts/mobile/doctor.mjs` validates the contract, route coverage, selector conventions, required package scripts, and CI wiring. Focused source checks flag high-signal regressions only:

- user-agent or viewport-width branching used as a proxy for input capability;
- `100vh` in mobile-critical overlays;
- hover-only interactive handlers without click, focus, or keyboard equivalents;
- duplicated desktop/mobile component forks that encode separate product behavior;
- fixed-position surfaces without an explicit safe-area strategy;
- touch-critical shared controls without the shared minimum target treatment.

The detector reports a file, line, rule, and recovery. It supports explicit, local suppressions with a reason, so the gate stays actionable rather than noisy.

### 3. Blast-radius analysis

The impact analyzer maps changed files to test groups. Shared UI, global styles, the mobile contract, the doctor, and the mobile Playwright configuration trigger the full matrix. App-local changes trigger the owning app plus shared invariants. Unknown UI paths fail closed into the full matrix. Documentation-only changes may run the deterministic doctor while skipping browser groups.

The analyzer is unit-tested with literal change lists and literal expected groups. CI may still run the whole suite on protected branches; the impact output provides auditable coverage and a future optimization point without reducing protection today.

### 4. Runtime browser suite

`playwright.mobile.config.ts` is independent of the existing desktop Workspace E2E gate. It starts the real applications and refuses non-loopback targets. The suite runs Chromium contexts with explicit viewports and media capabilities and asserts user-visible behavior:

- no unexpected document overflow;
- primary controls meet the 44 by 44 pixel touch target contract on coarse pointers;
- navigation opens, closes, restores focus, and remains keyboard operable;
- shortcut hints are absent when a touch-primary context is emulated;
- overlays stay within the visual viewport and do not collide with fixed UI;
- portrait and landscape remain usable;
- 200 percent zoom/reflow remains usable at the equivalent narrow viewport;
- reduced-motion contexts complete state changes without depending on animation;
- long labels, generated email addresses, and representative Italian copy wrap rather than clip;
- Workspace BUSINESS, PROFESSIONAL, and CLIENT views preserve their actual permissions and navigation semantics through the existing development fixture path.

Shared UI adaptive components are exercised through Sirio so the same assertions protect all consumers without cloning component implementations into tests.

### 5. Minimal UI remediation strategy

The gate may expose shared defects. Remediation follows the smallest sufficient technology:

- capability detection through media queries, not user-agent or width proxies;
- CSS and existing Base UI interaction behavior before JavaScript animation;
- a shared safe-area variable contract using `env(safe-area-inset-*)`;
- dynamic viewport units for constrained overlays;
- coarse-pointer minimum target sizing on existing shared controls;
- no new Motion dependency, provider, token system, or component fork.

## Failure semantics

Every failure must identify the surface, scenario, rule, and likely recovery. Contract and source failures stop before browser startup. Runtime failures retain Playwright traces and screenshots only on failure. The independent CI job is blocking and has no dependency on deployment.

## Verification

The implementation is complete only when:

1. unit tests prove the contract, route coverage, detectors, and blast-radius mapping;
2. the doctor passes from a clean checkout;
3. the mobile Playwright suite passes against real local applications;
4. the repository's existing `pnpm check` and Prisma verification remain green;
5. Impeccable's manual detector reports no unresolved task-scoped finding;
6. the dedicated CI job passes on the pushed commit and the PR is open.

