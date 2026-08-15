# Qoovex Skill Governance System v1 — recommended+ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Qoovex skill availability, authority, routing, runtime evidence, drift, updates, quarantine, and rollback deterministic repository-owned software.

**Architecture:** `config/skills/registry.json` and its explicit schema own the machine-readable skill contract. Focused Node.js modules validate the graph, route explicit task traits, record non-sensitive local evidence, detect drift, and stage provider updates; GitHub Actions composes those deterministic modules into one required-check candidate and one networked PR-only updater.

**Tech Stack:** Node.js 24 ESM, built-in `node:test`, pnpm 11.21.0, JSON Schema vocabulary expressed repository-locally, GitHub Actions.

## Global Constraints

- No new npm dependency; use Node built-ins and existing repository scripts.
- Ordinary governance tests, doctor, canary, and CI are deterministic and perform no network request after frozen install.
- Only `.github/workflows/skill-auto-update.yml` may discover upstream skill/provider versions.
- No updater step may commit, merge, force-push, or otherwise mutate `master` directly.
- Qoovex canonical sources outrank every skill and registry entry.
- Impeccable owns general UI quality; `qoovex-ux-motion` owns interaction/motion decisions; UI Skills remains optional external discovery with maximum three specialists.
- Do not modify Prisma schema/migrations, database, Blob, auth, roles, permissions, billing, privacy, product package boundaries, or deploy workflows.
- Preserve unrelated work; never write generated `.next`, `.turbo`, `.vercel`, or `node_modules` content.
- Every production behavior follows RED → observed failure → minimal GREEN → full focused test.

---

## Task 1 — Establish the canonical governed-skill set

**Files:**

- Modify: `config/skills/registry.json`
- Create: `config/skills/registry.schema.json`
- Create: `config/skills/provider-state.json`
- Modify: `config/skills/README.md`
- Create: `.agents/skills/qoovex-ui-ux/SKILL.md`
- Create: `.agents/skills/design-qoovex-ui-ux/SKILL.md`
- Modify: `.agents/skills/qoovex-component-creator/SKILL.md`
- Create: `.agents/skills/qoovex-ui-ux/README.md`
- Create: `.agents/skills/design-qoovex-ui-ux/README.md`

**Interfaces:**

- Produces: registry entries with `id`, `kind`, `source`, `version`, `provenance`, `integrity`, `authority`, `role`, `triggers`, `nonTriggers`, `responsibilities`, `forbiddenResponsibilities`, `requires`, `runsBefore`, `runsAfter`, `conflictsWith`, `mayDelegateTo`, `maxInstances`, `updatePolicy`, `verification`, and `runtimeRequired`.
- Produces: provider state `{ schemaVersion, providers: { <provider>: { current, previousKnownGood } } }`.

- [ ] **Step 1: Record source comparison** in the implementer report: active global SHA-256, repository SHA-256, routing/authority differences, and the decision for each Qoovex-owned skill.
- [ ] **Step 2: Add one repository skill at a time**, preserving the current global procedure unless the approved Qoovex contract requires a named correction.
- [ ] **Step 3: Validate each skill immediately** with `python C:\Users\FRA\.codex\skills\.system\skill-creator\scripts\quick_validate.py <skill-dir>` and record the exact output.
- [ ] **Step 4: Write the complete registry/schema/provider-state artifacts** with deterministic ordering and exact Impeccable/UI Skills provenance already verified from upstream metadata.
- [ ] **Step 5: Run structural JSON checks** with `node -e "for (const f of process.argv.slice(1)) JSON.parse(require('fs').readFileSync(f,'utf8'))" config/skills/registry.json config/skills/registry.schema.json config/skills/provider-state.json`.
- [ ] **Step 6: Commit** with `git add .agents/skills config/skills && git commit -m "feat(skills): establish canonical governed skill set"`.

## Task 2 — Test and implement schema and graph validation

**Files:**

- Replace: `scripts/skills/registry.mjs`
- Create: `scripts/skills/registry.test.mjs`
- Modify: `scripts/skills/governance.test.mjs`

**Interfaces:**

- Produces: `loadRegistry(filePath?)`, `validateRegistry(registry) -> { errors: Diagnostic[], warnings: Diagnostic[] }`, `buildOrderingGraph(registry)`, `orderSkillIds(registry, ids)`.
- `Diagnostic`: `{ skill: string, rule: string, related: string | null, action: string, message: string }`.

- [ ] **Step 1: Write focused failing tests** for malformed fields, duplicate identity/ownership, unknown references, dependency/order cycles, contradictory order, requires/conflicts, self/cyclic delegation, duplicate Impeccable, authority escalation, external source-of-truth, specialist limits, and forbidden overlap.
- [ ] **Step 2: Run RED** with `node --test scripts/skills/registry.test.mjs`; every new assertion must fail because the rule or structured diagnostic is absent.
- [ ] **Step 3: Implement schema and graph validation** using stable sorted arrays and one directed graph from `requires`, `runsBefore`, and `runsAfter`.
- [ ] **Step 4: Run GREEN** with `node --test scripts/skills/registry.test.mjs` and then `pnpm skills:test`.
- [ ] **Step 5: Commit** with `git add scripts/skills && git commit -m "feat(skills): validate registry and dependency graph"`.

## Task 3 — Test and implement deterministic routing

**Files:**

- Replace: `scripts/skills/router.mjs`
- Create: `scripts/skills/router.test.mjs`
- Expand: `scripts/skills/scenarios/core.json`
- Replace: `scripts/skills/scenarios.test.mjs`

**Interfaces:**

- Consumes: `orderSkillIds()` from Task 2.
- Produces: `routeTask(registry, input)` with exact arrays `requiredSkills`, `optionalSkills`, `forbiddenSkills`, `executionOrder`, `requiredCompletionReviews`.
- Input uses `traits`, `changedSurfaces`, `specialistNeed`, `externalSpecialistCount`, and `requestedExternalSkills` only.

- [ ] **Step 1: Encode at least sixteen literal routing fixtures** covering Prisma, docs, CI, auth, generic UI, component, screen, responsive, accessibility, interaction, motion, multi-surface, design system, Sirio, marketing, mixed work, and specialist escalation.
- [ ] **Step 2: Write focused failing tests** for false positives, false negatives, canonical motion ordering, maximum three specialists, unknown traits, and forbidden external Impeccable.
- [ ] **Step 3: Run RED** with `node --test scripts/skills/router.test.mjs scripts/skills/scenarios.test.mjs`.
- [ ] **Step 4: Implement minimal deterministic routing** from registry triggers/non-triggers and the Task 2 ordering graph; no free-form text classification or network.
- [ ] **Step 5: Run GREEN** with the focused command and `pnpm skills:test`.
- [ ] **Step 6: Commit** with `git add scripts/skills && git commit -m "feat(skills): route deterministic task traits"`.

## Task 4 — Test and integrate runtime governance

**Files:**

- Replace: `scripts/skills/runtime-state.mjs`
- Replace: `scripts/skills/orchestrator.mjs`
- Create: `scripts/skills/hook-dispatcher.mjs`
- Create: `scripts/skills/hook-dispatcher.test.mjs`
- Replace: `scripts/skills/runtime.test.mjs`
- Modify: `.codex/hooks.json`
- Modify: `scripts/impeccable/verify.mjs`

**Interfaces:**

- Consumes: Task 3 routing plan.
- Produces: `startSession`, `observeSurface`, `acknowledgeSkill`, `markSkillUnavailable`, `completeReview`, `verifyCompletion`, and central `dispatchHook`.
- Runtime state contains identifiers/traits/surfaces/checkpoints only; task text and tool payloads are not persisted.

- [ ] **Step 1: Write failing runtime and dispatcher tests** for sanitization, ordering, unavailable skill, missing review/gate, forbidden acknowledgement, surface observation, successful completion, and Stop rejection.
- [ ] **Step 2: Run RED** with `node --test scripts/skills/runtime.test.mjs scripts/skills/hook-dispatcher.test.mjs`.
- [ ] **Step 3: Implement state/orchestrator behavior**, enforcing the exact Task 3 execution order and completion reviews.
- [ ] **Step 4: Implement one central hook dispatcher** that delegates Impeccable behavior, records only observed surfaces/evidence, and verifies an existing routed session at Stop.
- [ ] **Step 5: Add `--repository-only` Impeccable verification** for CI without weakening full local `pnpm verify:impeccable`.
- [ ] **Step 6: Run GREEN** with focused tests, `pnpm skills:canary`, and `pnpm verify:impeccable`.
- [ ] **Step 7: Commit** with `git add .codex scripts && git commit -m "feat(skills): enforce runtime governance evidence"`.

## Task 5 — Test and implement doctor and drift detection

**Files:**

- Replace: `scripts/skills/doctor.mjs`
- Create: `scripts/skills/doctor.test.mjs`
- Modify: `scripts/skills/README.md`
- Modify: `package.json`

**Interfaces:**

- Produces: `runDoctor(options) -> { passes, warnings, failures }` and CLI exit code.
- Produces root scripts `skills:doctor`, `skills:test`, `skills:verify`, `skills:route`, `skills:canary`, `skills:sync`, `skills:update:check`.

- [ ] **Step 1: Write failing doctor tests** against temporary fixtures for integrity, unregistered/missing skill, provider-state drift, package pin drift, contract-marker drift, hook ownership, quarantine validity, and zero network commands.
- [ ] **Step 2: Run RED** with `node --test scripts/skills/doctor.test.mjs`.
- [ ] **Step 3: Implement read-only doctor checks** and stable `PASS/WARN/FAIL` output; no shell interpolation and no filesystem-order dependence.
- [ ] **Step 4: Compose `skills:verify`** from offline doctor/tests/canary/repository-only Impeccable/diff checks without duplicating provider logic.
- [ ] **Step 5: Run GREEN** with the focused test, `pnpm skills:doctor -- --ci`, and `pnpm skills:verify`.
- [ ] **Step 6: Commit** with `git add package.json scripts/skills && git commit -m "feat(skills): diagnose governance drift offline"`.

## Task 6 — Test updater, quarantine, known-good, and rollback selection

**Files:**

- Replace: `scripts/skills/update-check.mjs`
- Replace: `scripts/skills/update-check.test.mjs`
- Replace: `scripts/skills/quarantine-diff.mjs`
- Create: `scripts/skills/provider-state.mjs`
- Create: `scripts/skills/provider-state.test.mjs`
- Modify: `config/skills/quarantine.json`

**Interfaces:**

- Produces: `classifyVersionChange`, `applyProviderCandidate`, `quarantineCandidate`, `isQuarantined`, `advanceKnownGood`, and `selectRollback` as pure functions.
- Network discovery remains inside updater CLI adapters and is dependency-injected out of unit tests.

- [ ] **Step 1: Write failing pure tests** for patch/minor/major candidates, provenance anomaly, already-quarantined candidate, known-good transition, deterministic quarantine, and rollback selection.
- [ ] **Step 2: Run RED** with `node --test scripts/skills/provider-state.test.mjs scripts/skills/update-check.test.mjs`.
- [ ] **Step 3: Implement pure state/update functions**, preserving registry authority/routing fields byte-equivalently across candidate updates.
- [ ] **Step 4: Implement provider adapters**: Impeccable tag → exact commit → payload SHA-256; UI Skills npm version → git head → integrity.
- [ ] **Step 5: Run GREEN** with focused tests and `pnpm skills:test`; do not invoke discovery during ordinary tests.
- [ ] **Step 6: Commit** with `git add config/skills scripts/skills && git commit -m "feat(skills): govern provider candidates and rollback"`.

## Task 7 — Harden dedicated CI and automatic update workflows

**Files:**

- Modify: `.github/workflows/skill-governance.yml`
- Replace: `.github/workflows/skill-auto-update.yml`
- Modify: `.github/workflows/ci.yml` only where required for candidate dispatch compatibility

**Interfaces:**

- `Skill Governance` emits check name `skill-governance`.
- `Skill Auto Update` creates candidate/quarantine/rollback PRs and may call `gh pr merge --auto`; it never calls immediate `gh pr merge` or writes `master`.

- [ ] **Step 1: Add static workflow contract tests** that fail on floating action tags, direct/force push to master, immediate merge fallback, deploy/DB commands, excessive ordinary-CI permissions, or missing required commands.
- [ ] **Step 2: Run RED** with `node --test scripts/skills/workflows.test.mjs`.
- [ ] **Step 3: Harden `skill-governance.yml`** to frozen install plus offline `skills:verify` with `contents: read`.
- [ ] **Step 4: Harden updater flow** to candidate PR → awaited Skill Governance/full CI → repository setting/required-check assertion → GitHub auto-merge request → awaited merge → post-merge verification.
- [ ] **Step 5: Keep policy failure separate from incompatibility**; only compatibility/test failures create quarantine PRs.
- [ ] **Step 6: Run GREEN** with workflow tests and an available YAML/action validator; record any unavailable external validator distinctly.
- [ ] **Step 7: Commit** with `git add .github scripts/skills && git commit -m "ci: enforce guarded skill governance updates"`.

## Task 8 — Reconcile contracts and verify

**Files:**

- Modify: `AGENTS.md`
- Modify: `docs/07_QUALITY_AND_RELEASE.md`
- Modify: `project_brain.json`
- Modify: relevant governance READMEs

**Interfaces:**

- Consumes: final registry/pins/commands/workflow behavior from Tasks 1–7.
- Produces: human contracts and structured `project_brain.json` state that exactly match implemented behavior.

- [ ] **Step 1: Add stable governance markers** to `AGENTS.md` and `docs/07_QUALITY_AND_RELEASE.md`, then update `project_brain.json` with implemented fields only.
- [ ] **Step 2: Update concise governance READMEs** for registry/schema/provider state, runtime evidence, offline doctor, and updater boundary.
- [ ] **Step 3: Run focused drift checks** with `pnpm skills:doctor` and fix every `FAIL` before broader gates.
- [ ] **Step 4: Re-read `docs/skill-governance-system-design.md`** and the user brief; create a requirement-to-code/test matrix in the implementer report and close every uncovered item.
- [ ] **Step 5: Run final gates**: `pnpm skills:test`, `pnpm skills:doctor`, `pnpm skills:verify`, `pnpm verify:impeccable`, `pnpm check:fast`, `pnpm check`, workflow validation, and `git diff --check`.
- [ ] **Step 6: Commit** with `git add AGENTS.md docs project_brain.json config/skills scripts/skills package.json .github .agents .codex && git commit -m "docs(skills): finalize governance contract"`.
- [ ] **Step 7: Update Qoovex Brain only after green gates** and append `00_System/session-log.md` with date, task, files, SHA, checks, and hard stops.
