# Skill Governance System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a repository-owned, offline-verifiable skill governance system that coordinates Qoovex skills, prevents responsibility collisions, tests routing, and supports guarded automatic upstream updates through pull requests.

**Architecture:** A canonical JSON registry describes every governed skill and its authority, responsibilities, dependencies, routing triggers, integrity and update policy. Pure Node.js modules validate the registry, route task classifications, record non-sensitive runtime evidence, and expose an offline `skills:doctor`; GitHub Actions runs this as an independent required-check candidate while a separate networked updater only proposes verified changes by PR.

**Tech Stack:** Node.js 24 ESM, built-in `node:test`, pnpm 11, GitHub Actions, existing Impeccable scripts, repository-local Markdown/JSON.

## Global Constraints

- Qoovex canonical sources always outrank skills.
- Normal skill-governance checks are offline and deterministic.
- Only the update workflow may use network access.
- No direct writes to `master` from an updater.
- No database, Blob, auth, provider, migration or deployment operation is part of this task.
- Impeccable remains the general UI detector/critique/review owner.
- `qoovex-ux-motion` remains the interaction/motion decision owner.
- `ui-skills-root` remains an advisory external specialist router, never an online release gate.
- The UI Skills copy of Impeccable is forbidden.
- New manually-created repository directories receive a local `README.md`.

---

### Task 1: Canonical registry and repository-owned skill sources

**Files:**
- Create: `config/skills/README.md`
- Create: `config/skills/registry.json`
- Create: `.agents/skills/qoovex-component-creator/SKILL.md`
- Create: `.agents/skills/qoovex-component-creator/references/repository-contract.md`
- Create: `.agents/skills/qoovex-component-creator/references/component-execution.md`
- Create: `.agents/skills/qoovex-component-creator/README.md`

**Interfaces:**
- Consumes: current `AGENTS.md`, `project_brain.json`, Impeccable pin, `qoovex-ux-motion`, `ui-skills-root`, File Library source for `qoovex-component-creator`.
- Produces: schemaVersion 1 registry consumed by all governance scripts.

- [ ] **Step 1: Write registry fixture assertions first in Task 2 tests** for unique IDs, unique primary responsibility owners, valid local paths and canonical ordering.
- [ ] **Step 2: Verify those tests would fail before the registry exists** through CI once the first implementation commit is pushed.
- [ ] **Step 3: Add the registry and repository-owned component skill** using current Qoovex source truth (General Sans + ARRAY, Tabler, current docs sequence) rather than stale remembered UI contracts.
- [ ] **Step 4: Keep external providers declarative**: Impeccable is `pinned-external`; UI Skills is `external-router`; no external specialist payload is vendored.

### Task 2: Registry validator and routing engine

**Files:**
- Create: `scripts/skills/README.md`
- Create: `scripts/skills/registry.mjs`
- Create: `scripts/skills/router.mjs`
- Create: `scripts/skills/registry.test.mjs`
- Create: `scripts/skills/router.test.mjs`

**Interfaces:**
- Produces: `loadRegistry()`, `validateRegistry(registry)`, `routeTask(registry, task)` and deterministic validation diagnostics.

- [ ] **Step 1: Write failing `node:test` cases** for malformed registry, cycles, ownership collisions, forbidden duplicate Impeccable, backend no-UI routing, ordinary UI routing, component routing and motion routing.
- [ ] **Step 2: Implement `registry.mjs` minimally** with schema validation, graph-cycle detection, ownership checks, path/integrity metadata checks and forbidden duplicate checks.
- [ ] **Step 3: Implement `router.mjs` minimally** using explicit classification flags rather than free-form AI inference; calculate required, optional, forbidden and ordered skills.
- [ ] **Step 4: Ensure the router never requires UI skills for backend/docs and never requires motion for non-motion UI.**

### Task 3: Routing scenario suite

**Files:**
- Create: `scripts/skills/scenarios/README.md`
- Create: `scripts/skills/scenarios/core.json`
- Create: `scripts/skills/scenarios.test.mjs`

**Interfaces:**
- Consumes: `routeTask()`.
- Produces: regression coverage for false positives and false negatives.

- [ ] **Step 1: Encode scenarios** for backend, docs, auth server-side, simple UI, component, motion, responsive, accessibility, design-system, screen/flow, marketing, Sirio, mixed UI/backend, broad redesign and specialist escalation.
- [ ] **Step 2: Assert exact required/forbidden skill sets and order** for every scenario.
- [ ] **Step 3: Assert final gates** including Impeccable review where UI applies and Qoovex gates always.

### Task 4: Runtime evidence and single orchestrator

**Files:**
- Create: `scripts/skills/runtime-state.mjs`
- Create: `scripts/skills/orchestrator.mjs`
- Create: `scripts/skills/runtime-state.test.mjs`
- Create: `scripts/skills/orchestrator.test.mjs`
- Modify: `.codex/hooks.json`

**Interfaces:**
- Produces: local ignored session evidence under `.codex-runtime/skill-governance/`; one repository-owned dispatcher/orchestrator that composes existing Impeccable behavior rather than competing with it.

- [ ] **Step 1: Write failing tests** for sanitized state, required-skill acknowledgement, ordering violations, completion failure and successful completion.
- [ ] **Step 2: Implement state helpers** that store IDs/classification/checkpoints only, never task content or product data.
- [ ] **Step 3: Implement orchestrator CLI modes** `route`, `ack`, `complete`, `canary`; make `complete` fail closed on missing required evidence.
- [ ] **Step 4: Preserve Impeccable dispatcher compatibility** and avoid multiple independent per-skill hooks.

### Task 5: Offline doctor, sync and CLI surface

**Files:**
- Create: `scripts/skills/doctor.mjs`
- Create: `scripts/skills/sync.mjs`
- Create: `scripts/skills/doctor.test.mjs`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Produces commands `skills:doctor`, `skills:test`, `skills:sync`, `skills:route`.

- [ ] **Step 1: Write doctor tests** for registry validation, local skill existence, integrity drift, AGENTS routing drift, package pin drift and no-network behavior.
- [ ] **Step 2: Implement doctor** with PASS/WARN/FAIL output and non-zero exit on contract failures.
- [ ] **Step 3: Compose `verify:impeccable` as a child gate**; do not duplicate its implementation.
- [ ] **Step 4: Implement sync as a safe local bootstrap** that copies repository-owned Qoovex skills to an explicitly supplied local destination; never mutate arbitrary global directories implicitly in CI.
- [ ] **Step 5: Ignore only runtime state** and keep registry/skills/hooks tracked.

### Task 6: CI gate and update candidate tooling

**Files:**
- Modify: `.github/workflows/ci.yml`
- Create: `.github/workflows/skill-auto-update.yml`
- Create: `scripts/skills/update-check.mjs`
- Create: `scripts/skills/update-check.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: independent `skill-governance` job and networked `skills:update:check` used only by update workflow/manual invocation.

- [ ] **Step 1: Add `skill-governance` job** using frozen install and offline `pnpm skills:doctor --ci` plus governance tests.
- [ ] **Step 2: Keep ordinary CI `contents: read`.**
- [ ] **Step 3: Add updater workflow with schedule + workflow_dispatch** and least write permissions needed to create/update a branch/PR; never push directly to `master`.
- [ ] **Step 4: Implement update-check in report/candidate mode** for Impeccable and the pinned UI Skills CLI, with provenance metadata and quarantine file support; no remote payload executes before candidate identity is established.
- [ ] **Step 5: Add deterministic canary execution** using orchestrator fixtures before PR is eligible for automatic merge.

### Task 7: Drift contracts, governance docs and Brain

**Files:**
- Modify: `AGENTS.md`
- Modify: `docs/07_QUALITY_AND_RELEASE.md`
- Modify: `project_brain.json`

**Interfaces:**
- Produces: human-readable contract matching the machine registry.

- [ ] **Step 1: Document registry authority and routing ownership** without making skills higher authority than Qoovex.
- [ ] **Step 2: Document `skills:doctor`, CI job and updater behavior**, including offline/online boundary, quarantine and rollback-by-PR policy.
- [ ] **Step 3: Update Brain visual/tooling governance state** with verified implemented decisions only.

### Task 8: Verification and PR

**Files:** all files changed by Tasks 1-7.

- [ ] **Step 1: Run governance tests in GitHub CI** after opening the implementation PR.
- [ ] **Step 2: Inspect `skill-governance`, `push-gate`, `quality-gate` and `workspace-e2e` results.**
- [ ] **Step 3: Fix any deterministic failures on the branch and re-run.**
- [ ] **Step 4: Review final diff for scope, secrets, DB/Blob/deploy absence, source drift and whitespace.**
- [ ] **Step 5: Leave merge decision explicit; do not bypass required checks.**
