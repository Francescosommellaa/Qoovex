---
name: qoovex-component-creator
description: Design, implement, verify, and document exactly one named Qoovex component in the canonical shared shadcn Base UI foundation with a Sirio proof.
---

# Qoovex component creator

Work on exactly one named component per invocation.

## Preflight

Run Qoovex-Brain `get_task_context` and `check_ui_task`, read canonical UI docs, inspect every consumer and preserve unrelated work.

## Placement

- Generic reusable primitives and behavior belong in `packages/ui`.
- Add a focused specimen in Sirio using package subpath imports.
- Domain composition stays in its owning app.
- Never create a parallel primitive under an app-local `components/ui` directory.

## Source path

Use official shadcn CLI generation when the component exists in the approved `base-nova` registry. Follow `references/component-execution.md`. External sources require provenance, pinned version, compatible license and retained notices.

## Deliverable

Specify anatomy, API, variants, states, content behavior, responsive behavior, accessibility, tokens, source provenance, compatibility and tests. Verify the shared component in Sirio and any affected production consumer without changing domain behavior.
