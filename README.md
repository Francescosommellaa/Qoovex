# Qoovex

Monorepo di Qoovex: il sistema piu semplice per piccole imprese e subappaltatori che devono tenere pronti documenti, scadenze e prove di cantiere.

## Stato

- `apps/workspace`: runtime Next.js per dashboard prodotto, auth, MFA, inviti, supporto auditato e API prodotto.
- `apps/web`: base Next.js del sito marketing pubblico, con copy provvisorio e senza ricerca inventata.
- `apps/mobile`: placeholder vuoto per la futura app mobile.
- `apps/sirio`: sandbox indipendente del nuovo design canonico shadcn `base-nova`, disponibile su catalogo, marketing e dashboard per approvazione.
- `packages/db`: schema Prisma e migrazioni auth, Azienda, supporto e base dominio MVP.
- `packages/types`: ruoli, permessi e DTO platform-neutral per auth, Azienda e dominio MVP.
- `packages/ui`: implementazione UI condivisa legacy mantenuta temporaneamente per continuità di web e workspace fino all'approvazione Sirio.
- `packages/brand-resources`: package runtime legacy per risorse brand dei consumer produttivi attuali.

La direzione UI definitiva è documentata in `docs/05_UI_BRAND_AND_SURFACES.md`: Geist, tema Vercel light/dark, Base UI, Tabler Icons e componenti shadcn app-local in Sirio. `apps/web`, `apps/workspace` e `packages/ui` non vengono migrati prima dell'approvazione esplicita della sandbox.

Il modello MVP per documenti, scadenze, cantieri e prove operative e definito come base tecnica generica. Sono presenti API server-side minime per documenti, scadenze, versioni documento, lavoratori, cantieri, checklist, prove operative, pacchetti documentali, share link e assegnazioni risorsa. La prima dashboard operativa mobile-first vive in `apps/workspace` su `/dashboard`.

## Regole

- Auth e sicurezza restano confinate in `apps/workspace`.
- Azienda, ruoli, support session e autorizzazioni derivano sempre dal server.
- Nessun ruolo o permesso proveniente dal client e fonte autorevole.
- Il codice azienda identifica una Organization, ma non autentica.
- Le app non importano codice da altre app.
- Il codice condiviso vive in `packages/*`; il codice specifico di app resta nella rispettiva app.
- Auth.js/NextAuth resta confinato in `apps/workspace`; `packages/ui` non conosce sessioni, ruoli o permessi.
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
