# Apps

- `workspace`: runtime API-only del prodotto SaaS.
- `web`: placeholder per il futuro sito pubblico e marketing.
- `mobile`: placeholder per la futura app mobile nativa.
- `sirio`: placeholder per brandbook, showcase e design system preview.

Regole:

- le app non importano codice da altre app;
- il codice condiviso appartiene a `packages/*`;
- Prisma e schema DB restano in `packages/db`;
- tipi e DTO condivisi restano in `packages/types`;
- UI, brand, config e utility condivise verranno estratte in package dedicati solo quando esistera consumo reale.
