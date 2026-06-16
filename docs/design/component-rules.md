# Component Rules

No runtime component is approved in the current foundation phase.

`packages/ui` is temporarily styles-only. It owns `tokens.css`, `base.css` and
the public style entrypoint. Sirio may use app-local markup to show the
direction, but that markup is not a reusable component API.

## Before Adding A Component

Answer yes to every question:

1. Does this solve a recurring interface problem?
2. Is it generic enough to belong in `packages/ui`?
3. Does it have every required state?
4. Does it work in default, kitchen and review modes?
5. Is it accessible by default?
6. Does it use semantic tokens only?
7. Is the content model clear?
8. Is the responsive behavior documented?
9. Is there a focused test plan?
10. Would removing it make Qoovex worse?

## Required States

Every future component must define:

- default;
- hover;
- focus;
- active;
- selected;
- loading;
- disabled;
- empty;
- error;
- warning;
- success;
- changed;
- unsaved;
- syncing;
- offline;
- conflict;
- read-only;
- permission denied.

## Product-Specific States

Qoovex components must eventually support culinary states such as:

- missing ingredient;
- critical allergen;
- scaled quantity;
- edited recipe;
- published menu;
- active QR;
- generated shopping list;
- service task;
- completed preparation;
- previous version;
- collaborator conflict.

## Prohibitions

- Do not create app-local alternatives to future canonical primitives.
- Do not encode meaning through color alone.
- Do not use decorative motion.
- Do not introduce visual effects before a semantic purpose is clear.
- Do not recreate the logo or use non-Phosphor icons when an icon is needed.

