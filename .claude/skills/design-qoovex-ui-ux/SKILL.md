---
name: design-qoovex-ui-ux
description: Design, audit, refactor, or implement Qoovex pages, flows, marketing surfaces, dashboards, and design-system foundations with the canonical shared shadcn Base UI system.
---

# Design Qoovex UI/UX

## Before editing

Complete the router preflight. Confirm the surface, consumers, product contract and shared-versus-domain placement.

## Canonical foundation

- `packages/ui` is the only source for shadcn `base-nova` components, Base UI behaviors, Tabler Icons, semantic Tailwind CSS v4 tokens, theme, shared hooks and utilities.
- Apps load Geist and Geist Mono through `next/font` and import shared `base.css` exactly once.
- Sirio consumes the package and is the integrated proof surface.
- Provenance is pinned to Kiranism commit `0edc5cf631ac7a8280112fd2bcb80312597bafdf`; MIT notices remain in `packages/ui/THIRD_PARTY_NOTICES.md`.

## Workflow

1. Inventory route contracts, consumers, responsive behavior, accessibility and the dirty worktree.
2. Define hierarchy, states, responsive collapse, keyboard/touch behavior, copy constraints and dependencies.
3. Verify license, provenance, pinned version and notices for external source.
4. Implement reusable foundation in `packages/ui`; keep domain compositions app-local.
5. Add or update a focused Sirio proof using the same package exports.
6. Prove loading, empty, error, disabled, focus, overflow, long content and reduced motion.
7. Run `references/quality-gates.md` and browser checks at required widths.
8. Update docs and Brain only after code truth is verified.

## Product rules

- Say present, missing, expiring or to verify. Say ready for review.
- Never claim compliance, certification or legal validity.
- Do not invent regulations, deadlines, customer proof, integrations or production metrics.
- Keep auth, MFA, roles, permissions, routes, API, Prisma, Blob and server behavior unchanged unless separately authorized.

## Implementation rules

- Import shared API through explicit `@qoovex/ui/components/*`, `hooks/*` or `lib/*` subpaths; never the root.
- Use Base UI `render`, not Radix-era `asChild`.
- `Button` is action-only; navigation uses a real link with `buttonVariants` when needed.
- Group Select and Dropdown items semantically; Sheet and dialog surfaces require accessible title and description.
- Use live components for previews, not fake screenshots.
- Avoid decorative motion and honor reduced motion.
