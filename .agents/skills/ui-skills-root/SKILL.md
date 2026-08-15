---
name: ui-skills-root
description: Use when a Qoovex task needs external UI specialist guidance and you must route by topic, stack, and intent to the smallest useful UI Skills context without overriding Qoovex, Impeccable, or qoovex-ux-motion.
---

# UI Skills Root — Qoovex integration

This project-local router is based on the official `ui-skills-root` protocol from UI Skills. It exists to make discovery repeatable inside Qoovex while preserving the repository's own authority hierarchy.

## Authority

Before using UI Skills, follow `AGENTS.md` and the mandatory Qoovex protocol. UI Skills is advisory specialist context only.

Authority order for UI work remains:

1. current user request and approved business/legal rules;
2. verified repository code and architecture boundaries;
3. canonical Qoovex documentation, Brain context, local README and DESIGN files;
4. Impeccable for mandatory UI/UX detection, critique and quality review;
5. `qoovex-ux-motion` for Qoovex interaction and motion decisions;
6. selected external UI Skills specialist guidance.

If an external skill conflicts with a higher source, ignore the conflicting guidance and report the conflict when material.

## Protocol

1. Decide whether the task is UI-related.
2. If it is not UI-related, use no UI Skills specialist.
3. Complete the mandatory Qoovex UI protocol first, including Brain/check-ui routing, repository context and relevant Impeccable context.
4. Identify the narrowest likely UI Skills category.
5. Inspect the category through the pinned Qoovex CLI commands.
6. Prefer one specialist skill.
7. Use two only when two distinct specialist angles are materially required.
8. Use three only for a broad review, redesign or multi-surface task.
9. Never use more than three external UI Skills specialists for one task.
10. Apply selected guidance only within the already-authorized Qoovex scope.
11. Complete the normal Impeccable review and Qoovex verification gates afterward.

## Pinned CLI

Use the repository scripts rather than unpinned `npx ui-skills` calls:

```text
pnpm ui-skills:start
pnpm ui-skills:categories
pnpm ui-skills:list -- --category <category>
pnpm ui-skills:get -- <skill>
```

The scripts pin the CLI version so catalog behavior cannot silently change between sessions. `get` is for loading specialist guidance on demand; it does not make that skill a Qoovex source of truth.

## Selection rules

- Route by topic, then stack, then specificity.
- Prefer narrow specialist skills over broad style generators.
- Prefer framework-specific guidance when it matches the real stack.
- Do not install or load the UI Skills copy of `impeccable`; Qoovex owns a pinned Impeccable integration with repository-specific hooks and governance.
- Do not use a third-party skill to introduce a new design system, font, icon set, package boundary, dependency, provider, architecture, product capability, permission model or legal assertion.
- Do not load a generic motion skill before `qoovex-ux-motion`; the Qoovex skill decides whether motion is needed and which implementation level is appropriate.
- When `qoovex-ux-motion` identifies a specialist question, use UI Skills only for that narrow question, for example accessibility, motion performance, AnimatePresence, spring selection, or animation review.

## Motion coordination

For interaction and motion tasks:

```text
Qoovex protocol
-> Impeccable context/detector
-> qoovex-ux-motion decision
-> optional narrow UI Skills specialist
-> implementation using the minimum sufficient technology
-> Impeccable review
-> Qoovex gates
```

CSS, Tailwind, Base UI, native browser APIs and existing primitives remain valid outcomes. The presence of Motion or a Motion-related external skill never makes Motion runtime mandatory.

## Provenance

Upstream routing model: `ibelick/ui-skills`, skill `ui-skills-root`, as documented by `ui-skills.com`.

Qoovex intentionally versions this small integration router instead of vendoring the external registry. External specialist content is discovered on demand through the pinned CLI.