# Quality and release

Il gate standard e: `pnpm type-check`, `pnpm test:unit`, `pnpm build`, `pnpm check:audit`, `pnpm --filter @qoovex/db verify:prisma` e `git diff --check`. `pnpm lint` non e un comando root valido.

Ogni modifica a schema, API, autorizzazioni, storage, UI condivisa o operazioni deve verificare i confini interessati e aggiornare questa documentazione, Qoovex-Brain, Qoovex-Memory e il session log nello stesso task.

Un deploy non e verificato solo da build locale: le configurazioni Vercel e i flussi sensibili richiedono smoke check nel rispettivo ambiente.
