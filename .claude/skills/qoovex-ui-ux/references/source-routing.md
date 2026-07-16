# External source routing

## Allowed adoption

Public source may be copied, generated, adapted or composed when all conditions hold:

1. Its license permits the intended use.
2. The task or a recorded decision approves the source or direction.
3. Repository URL and immutable version or commit are recorded.
4. Copyright and license notices are retained.
5. Dependencies stay within the approved set.
6. Security, accessibility, product copy and application boundaries are revalidated locally.

For shadcn components run `info`, `docs`, `view`, `add <component> --dry-run` and `add <component> --diff` before applying. Do not use `--overwrite` over approved Qoovex variants.

## Placement

- Generic reusable primitives, shared behavior, hooks and utilities belong in `packages/ui`.
- Every shared change needs a focused Sirio specimen before or alongside consumer rollout.
- Domain and route compositions stay in their owning app.
- Apps never import from other apps.

## Forbidden routes

- Paid or private source without permission.
- Removed license text or missing source version.
- Bulk import of demo data, auth, billing, observability, state management or business logic from a starter.
- Unreviewed transitive dependencies.
- Foundation duplication inside an app.
