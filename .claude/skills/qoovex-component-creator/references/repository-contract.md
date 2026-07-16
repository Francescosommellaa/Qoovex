# Repository contract

- `packages/ui` is the only shared foundation and public UI authority.
- `apps/sirio` is the catalog and integrated proof consumer.
- `apps/web` is marketing production.
- `apps/workspace` is the authenticated runtime product.
- Apps never import from other apps.
- Shared UI imports no auth, Prisma, APIs, roles or domain services.
- Consumers use explicit `@qoovex/ui/components/*`, `hooks/*` and `lib/*` subpaths.
- CSS app-local is limited to layout and domain compositions.

Approved dependencies are Base UI, Tabler Icons, CVA, clsx, tailwind-merge, tw-animate-css, next-themes and Recharts where charts are required. Additional dependencies require explicit approval.

The source baseline is Kiranism commit `0edc5cf631ac7a8280112fd2bcb80312597bafdf`. Retain the MIT notice and shadcn attribution in `packages/ui/THIRD_PARTY_NOTICES.md`.

Every shared change receives a Sirio specimen and must preserve route, auth, MFA, authorization, data and copy contracts in production consumers.
