# Single-component execution

1. Name one component and inventory every current consumer.
2. Read official component docs and Base UI API when applicable.
3. Run `pnpm dlx shadcn@latest info`, `docs <component>`, `view <component>`, `add <component> --dry-run` and `add <component> --diff`.
4. Review generated files and dependencies; never use `--overwrite` over approved Qoovex variants.
5. Define anatomy, variants, sizes, states, keyboard behavior, touch targets, focus, errors, long content, loading and reduced motion.
6. Implement in `packages/ui` with package imports `#components`, `#hooks` and `#lib`.
7. Export through an explicit package subpath and add a focused Sirio specimen.
8. Verify light/dark/system, 320-1440 px, 200% zoom, keyboard, touch, console, hydration and overflow.
9. Run package, affected app and repository gates.
10. Record provenance, license, decisions and verification in canonical docs and Brain.

Do not add an unapproved component library, icon family, demo-data package, form/table framework or application service.
