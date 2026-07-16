# Quality and release

Il gate standard e: `pnpm type-check`, `pnpm test:unit`, `pnpm build`, `pnpm check:audit`, `pnpm --filter @qoovex/db verify:prisma` e `git diff --check`. `pnpm lint` non e un comando root valido.

`pnpm check` esegue l'intero gate standard. `pnpm check:ci` aggiunge `pnpm test:e2e`. GitHub Actions esegue `quality-gate` e `workspace-e2e` su pull request e push a `master`; entrambi devono essere required status check prima di consentire il merge.

`@qoovex/ui#test` e un guardrail statico cross-repository: verifica che `packages/ui` resti l'unica foundation, che Sirio non duplichi primitive, che le app usino subpath espliciti e la stessa configurazione `base-nova`/Base UI/Tabler, che ogni consumer importi il CSS canonico e dichiari le proprie sorgenti Tailwind, e che non rientrino API visuali o provider rimossi. Il task non usa la cache Turbo perche legge file esterni a `packages/ui` e deve osservare ogni modifica dei consumer.

`verify:prisma` non e una semplice query di connessione: fallisce per migration mancanti, riordinate, modificate, fallite o pendenti e per qualunque diff tra database e `schema.prisma`. La CI applica la cronologia completa su PostgreSQL effimero prima del gate. Il test `pnpm --filter @qoovex/db test:upgrade` accetta esclusivamente `qoovex_upgrade_ci` su loopback, applica la cronologia precedente, inserisce dati e una chiave PII legacy, applica la migration privacy e verifica conservazione, purge e diff nullo.

Ogni modifica a schema, API, autorizzazioni, storage, UI condivisa o operazioni deve verificare i confini interessati e aggiornare questa documentazione, Qoovex-Brain e il session log nello stesso task. La memoria Codex si aggiorna solo su richiesta esplicita.

Un deploy non e verificato solo da build locale: le configurazioni Vercel e i flussi sensibili richiedono smoke check nel rispettivo ambiente.
