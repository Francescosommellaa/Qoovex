# Qoovex

Monorepo di Qoovex: il sistema piu semplice per piccole imprese e subappaltatori che devono tenere pronti documenti, scadenze e prove di cantiere.

## Stato

- `apps/workspace`: runtime Next.js per dashboard prodotto, auth, tenant, MFA, inviti, supporto auditato e API prodotto.
- `apps/web`: placeholder vuoto per il futuro sito pubblico.
- `apps/mobile`: placeholder vuoto per la futura app mobile.
- `apps/sirio`: placeholder vuoto; nessun design system o stile canonico e presente.
- `packages/db`: schema Prisma e migrazioni auth, tenant, supporto e base dominio MVP.
- `packages/types`: ruoli, permessi e DTO platform-neutral per auth, tenant e dominio MVP.

Il modello MVP per documenti, scadenze, cantieri e prove operative e definito come base tecnica generica. Sono presenti API server-side minime per documenti, scadenze, versioni documento, lavoratori, cantieri, checklist, prove operative, pacchetti documentali e share link. La prima dashboard operativa mobile-first vive in `apps/workspace` su `/dashboard`.

## Regole

- Auth e sicurezza restano confinate in `apps/workspace`.
- Tenant, ruoli, support session e autorizzazioni derivano sempre dal server.
- Nessun ruolo o permesso proveniente dal client e fonte autorevole.
- Il codice azienda identifica una Organization, ma non autentica.
- Le app non importano codice da altre app.
- Il codice condiviso vive in `packages/*`; il codice specifico di app resta nella rispettiva app.
- `packages/db` e `packages/types` sono gli unici package condivisi attivi oggi.
- Qoovex organizza documenti e stati operativi; non promette conformita o validita legale.
- Le decisioni di placement sono documentate in `docs/22_MONOREPO_BOUNDARIES_AND_PLACEMENT.md`.

## Comandi

```bash
pnpm install
pnpm --filter @qoovex/db db:generate
pnpm --filter @qoovex/types type-check
pnpm --filter @qoovex/workspace type-check
pnpm --filter @qoovex/workspace test
```
