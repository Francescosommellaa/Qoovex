---
name: qoovex-component-creator
description: Use when a Qoovex task explicitly targets exactly one named UI component for design, redesign, implementation, verification, or documentation.
---

# Qoovex Component Creator

Work on exactly one independently reviewable component. This skill is subordinate to the current request, Qoovex business/legal rules, real repository state, canonical docs, Brain context, `AGENTS.md`, Impeccable and package boundaries.

## Preflight

Before editing:

1. resolve exactly one target component; stop on zero, multiple or ambiguous targets;
2. run the mandatory Qoovex protocol from `AGENTS.md`, including Brain UI routing when available;
3. use Impeccable first as the general UI detector/critique layer;
4. read the target implementation, exports, consumers, tests, tokens, nearest README, the Perceptual Completeness Contract in `docs/05_UI_BRAND_AND_SURFACES.md` and Sirio P009 in `apps/sirio/README.md`;
5. use `qoovex-ux-motion` additionally when interaction or motion is materially involved;
6. use `ui-skills-root` only for a narrow specialist question that remains unresolved.

## Ownership

This skill owns component anatomy, typed public API, variants, component-level states, compatibility, component accessibility/responsive behavior and isolated Sirio proof. It does not own screen/flow architecture, general UI critique, product authority, motion technology decisions, auth, DB, permissions, privacy, storage or business logic.

## Current visual foundation

Always verify the live repository. The current canonical baseline recorded in `project_brain.json` is General Sans primary, ARRAY accent and Tabler icons. Never restore older Satoshi/Chillax, Cabinet Grotesk, Phosphor or other retired conventions from historical skill copies.

Use semantic tokens and current `@qoovex/ui` patterns. Base UI remains the behavioral foundation where already adopted. Do not add a dependency, provider, design system, font, icon library, token family or package boundary without explicit authorization.

## Execution

- inventory the canonical component and real consumers;
- define the approval unit and allowed files;
- specify anatomy, API, states, touch/keyboard behavior, accessibility, responsive behavior and compatibility before code;
- implement only the component and direct support files;
- for an interactive component, apply the canonical Component Done gate: every declared state must be causable through real input and lifecycle; static rows, fake state previews, prop coverage or screenshots are not sufficient proof;
- prove applicable variants/states in Sirio through P009 when the repository protocol requires it;
- inspect long text, narrow width, overflow, loading/error/disabled states, focus, keyboard, touch, reduced motion and console/runtime behavior according to risk;
- run focused checks and then the Qoovex gate required by `docs/07_QUALITY_AND_RELEASE.md`;
- finish with the mandatory Impeccable review.

A pertinent failed Perceptual Completeness check leaves the component not Done. Keep the final report concise: interaction proof verified, remaining findings and gates executed; do not reproduce the checklist.

## Hard stops

Stop when the target is not independently reviewable or requires an unapproved dependency, architecture/package move, product capability, auth/permission/privacy/database change, legal assertion or normative requirement. Do not expand into sibling-component cleanup or page redesign.

Never claim visual, responsive, accessibility or runtime verification that was not actually performed.
