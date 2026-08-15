# Mobile & Responsive Experience CI — Implementation Plan

> Execute this plan in the isolated `codex/mobile-responsive-ci` worktree. Keep commits small and preserve unrelated work.

**Goal:** Add a blocking, independent Qoovex quality gate that detects mobile and responsive regressions across Web, Workspace, Sirio, and shared UI.

**Architecture:** A JSON contract drives a deterministic Node doctor and change-impact analyzer. A separate Playwright configuration exercises real app behavior at canonical viewports and input capabilities. Narrow shared UI fixes make capability detection, touch targets, safe areas, and constrained overlays conform to the contract.

**Technology:** Node.js ESM scripts and `node:test`, Playwright already present in the monorepo, Next.js applications, existing Base UI and Tailwind/CSS foundation, GitHub Actions.

---

## Task 1: Contract and validation core

**Files:**

- Create: `config/mobile-experience.json`
- Create: `scripts/mobile/contract.mjs`
- Create: `scripts/mobile/contract.test.mjs`
- Create: `scripts/mobile/README.md`
- Modify: `package.json`

1. Write failing tests for invalid viewports, missing modality scenarios, uncovered routes, malformed exclusions, and incomplete surface ownership.
2. Run `node --test scripts/mobile/contract.test.mjs` and confirm failures are caused by the absent implementation.
3. Implement schema validation, route discovery, route-pattern matching, and actionable diagnostics.
4. Add `mobile:contract` and focused test scripts.
5. Re-run the focused tests and the contract command.

## Task 2: Static rules and blast radius

**Files:**

- Create: `scripts/mobile/source-audit.mjs`
- Create: `scripts/mobile/source-audit.test.mjs`
- Create: `scripts/mobile/impact.mjs`
- Create: `scripts/mobile/impact.test.mjs`
- Create: `scripts/mobile/doctor.mjs`
- Modify: `config/mobile-experience.json`
- Modify: `package.json`

1. Write failing fixture-based tests for each high-signal detector and each change-impact class.
2. Confirm the failures exercise command output and exit behavior, not source-text snapshots.
3. Implement line-oriented findings, scoped suppressions with mandatory reasons, and fail-closed impact mapping.
4. Compose the checks in `mobile:doctor` and add a machine-readable JSON output mode.
5. Run the focused unit suite and capture the first real repository findings.

## Task 3: Capability and geometry remediation

**Files:**

- Modify: `packages/ui/src/hooks/use-platform.ts`
- Modify: `packages/ui/src/hooks/use-platform.test.tsx`
- Modify: `packages/ui/src/components/kbd-shortcut.tsx`
- Modify: `packages/ui/src/components/button.tsx`
- Modify: `packages/ui/src/components/input.tsx`
- Modify: `packages/ui/src/components/sidebar.tsx`
- Modify: `packages/ui/src/components/dialog.tsx`
- Modify: `packages/ui/src/components/floating-navigation.tsx`
- Modify: `packages/ui/src/components/cookie-banner.tsx`
- Modify: `packages/ui/src/styles/tokens.css`
- Modify: relevant app layouts only if viewport-fit is required

1. Add or extend focused tests for pointer-capability detection and touch shortcut suppression.
2. Observe the tests and doctor fail against the existing user-agent/width heuristic and undersized touch controls.
3. Replace the heuristic with `matchMedia` capability detection and reactive updates.
4. Add shared safe-area variables, coarse-pointer target sizing, dynamic viewport constraints, and safe fixed offsets through existing components and tokens.
5. Re-run package UI tests and the doctor; resolve only task-scoped findings.

## Task 4: Mobile Playwright harness

**Files:**

- Create: `playwright.mobile.config.ts`
- Create: `tests/mobile/support/context.ts`
- Create: `tests/mobile/support/geometry.ts`
- Create: `tests/mobile/public-surfaces.spec.ts`
- Create: `tests/mobile/shared-components.spec.ts`
- Create: `tests/mobile/workspace-roles.spec.ts`
- Modify: `package.json`

1. Add the guarded loopback-only configuration and initial tests that name each regression they catch.
2. Run the focused suite and confirm it fails on the known pre-remediation geometry/capability behavior.
3. Implement reusable context and geometry assertions without masking real DOM or network behavior.
4. Cover 320/390/768/1024/1440, coarse touch, fine pointer, portrait/landscape, 200 percent reflow, reduced motion, safe-area emulation, long content, fixed collisions, overlay interruption, and the three real Workspace role views.
5. Run the suite repeatedly until deterministic; use traces and screenshots only for failure diagnosis.

## Task 5: Independent CI job and documentation

**Files:**

- Modify: `.github/workflows/ci.yml`
- Modify: `docs/07_QUALITY_AND_RELEASE.md`
- Modify: relevant app/package README files
- Modify: `project_brain.json` only if its quality-command index requires the new canonical command

1. Add a blocking `mobile-responsive` job with pinned action versions, Chromium cache/install strategy, ephemeral PostgreSQL only for Workspace fixtures, and no Blob or remote target.
2. Wire `pnpm mobile:doctor` before `pnpm mobile:test` so deterministic failures stop early.
3. Document ownership, commands, covered surfaces, exclusions, failure interpretation, and local reproduction.
4. Confirm the YAML, JSON, and command contracts from a clean environment.

## Task 6: Closure and remote evidence

1. Run focused unit tests, `pnpm mobile:doctor`, `pnpm mobile:test`, package tests, `pnpm --filter @qoovex/db verify:prisma`, `pnpm check`, and `git diff --check`.
2. Run the one required Impeccable detector command across changed UI targets and resolve or document every relevant finding.
3. Review the task-scoped diff for security boundaries, generated artifacts, secrets, and accidental product changes.
4. Append the dated session summary to `00_System/session-log.md` through `qoovex_brain` MCP.
5. Commit by coherent unit, push `codex/mobile-responsive-ci`, open the PR, and verify the dedicated job and existing required gates on the same SHA.
