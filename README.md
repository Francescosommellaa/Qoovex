# Qoovex

Monorepo di Qoovex: il sistema piu semplice per piccole imprese e subappaltatori che devono tenere pronti documenti, scadenze e prove di cantiere.

## Stato

- `apps/workspace`: runtime Next.js per dashboard prodotto, auth, MFA, inviti, supporto auditato e API prodotto.
- `apps/web`: base Next.js del sito marketing pubblico, con copy provvisorio e senza ricerca inventata.
- `apps/mobile`: placeholder vuoto per la futura app mobile.
- `apps/sirio`: showcase Next.js del design system Sirio, importato da `packages/ui`.
- `packages/db`: schema Prisma e migrazioni auth, Azienda, supporto e base dominio MVP.
- `packages/types`: ruoli, permessi e DTO platform-neutral per auth, Azienda e dominio MVP.
- `packages/ui`: primitive UI condivise e token CSS per `apps/web` e `apps/sirio`.

Il modello MVP per documenti, scadenze, cantieri e prove operative e definito come base tecnica generica. Sono presenti API server-side minime per documenti, scadenze, versioni documento, lavoratori, cantieri, checklist, prove operative, pacchetti documentali, share link e assegnazioni risorsa. La prima dashboard operativa mobile-first vive in `apps/workspace` su `/dashboard`.

## Regole

- Auth e sicurezza restano confinate in `apps/workspace`.
- Azienda, ruoli, support session e autorizzazioni derivano sempre dal server.
- Nessun ruolo o permesso proveniente dal client e fonte autorevole.
- Il codice azienda identifica una Organization, ma non autentica.
- Le app non importano codice da altre app.
- Il codice condiviso vive in `packages/*`; il codice specifico di app resta nella rispettiva app.
- `packages/db`, `packages/types` e `packages/ui` sono i package condivisi attivi oggi.
- Qoovex organizza documenti e stati operativi; non promette conformita o validita legale.
- `SITE_MANAGER` e `WORKER` usano filtri risorsa server-side, non accessi larghi all'azienda.
- Le decisioni di placement sono documentate in `docs/02_ARCHITECTURE_AND_BOUNDARIES.md`.

## Comandi

```bash
pnpm install
pnpm --filter @qoovex/db db:generate
pnpm --filter @qoovex/types type-check
pnpm --filter @qoovex/ui type-check
pnpm --filter @qoovex/web type-check
pnpm --filter @qoovex/sirio type-check
pnpm --filter @qoovex/workspace type-check
pnpm --filter @qoovex/workspace test
```
