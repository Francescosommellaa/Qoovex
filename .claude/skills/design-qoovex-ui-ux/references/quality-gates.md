# Qoovex UI quality gates

## Source and boundary gate

- Provenance URL, immutable commit or version and license are recorded.
- Required notices remain in `packages/ui/THIRD_PARTY_NOTICES.md`.
- Only approved dependencies are present.
- No app duplicates shared primitives, provider, hooks or utilities.
- No root `@qoovex/ui` imports.
- Every app imports shared base CSS once and includes its own Tailwind sources.
- `packages/ui` imports no app, auth, Prisma or domain code.

## Visual and responsive gate

- Check 320, 390, 768, 1024 and 1440 px, 200% zoom and long content.
- Check light, dark and system preference.
- Check no horizontal page overflow and deliberate table overflow.
- Check loading, empty, error, disabled and destructive states.

## Interaction and accessibility gate

- Full keyboard route through navigation, menus, sidebar, tabs, forms and overlays.
- Visible unclipped focus, useful touch targets and usable mobile Sheet.
- Semantic labels, headings, landmarks, names, states and error association.
- Acceptable contrast, no color-only meaning and reduced-motion fallback.

## Runtime gate

- No hydration mismatch, theme flash or browser console errors.
- Theme preference persists; circular reveal has an immediate fallback.
- Sidebar desktop collapse and mobile Sheet work.
- Charts provide accessibility context.

## Required commands

```bash
pnpm --filter @qoovex/ui type-check
pnpm --filter @qoovex/ui test
pnpm --filter @qoovex/sirio build
pnpm --filter @qoovex/web build
pnpm --filter @qoovex/workspace build
pnpm check:audit
pnpm check
git diff --check
```
