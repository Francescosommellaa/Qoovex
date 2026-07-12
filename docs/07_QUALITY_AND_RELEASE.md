# Quality and release

Il gate standard e: `pnpm type-check`, `pnpm test:unit`, `pnpm build`, `pnpm check:audit`, `pnpm --filter @qoovex/db verify:prisma` e `git diff --check`. `pnpm lint` non e un comando root valido.

`pnpm check` esegue l'intero gate standard. `pnpm check:ci` aggiunge `pnpm test:e2e`. GitHub Actions esegue `quality-gate` e `workspace-e2e` su pull request e push a `master`; entrambi devono essere required status check prima di consentire il merge.

`verify:prisma` non e una semplice query di connessione: fallisce per migration mancanti, riordinate, modificate, fallite o pendenti e per qualunque diff tra database e `schema.prisma`. La CI applica la cronologia completa su PostgreSQL effimero prima del gate.

Ogni modifica a schema, API, autorizzazioni, storage, UI condivisa o operazioni deve verificare i confini interessati e aggiornare questa documentazione, Qoovex-Brain, Qoovex-Memory e il session log nello stesso task.

Un deploy non e verificato solo da build locale: le configurazioni Vercel e i flussi sensibili richiedono smoke check nel rispettivo ambiente.
