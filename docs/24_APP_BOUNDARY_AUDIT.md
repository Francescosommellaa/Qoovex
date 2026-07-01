# App Boundary Audit

Data: 2026-06-30.

## Sintesi

Audit delle app presenti nel monorepo Qoovex.

Questa sessione non introduce nuove feature e non sposta runtime. L'obiettivo e rendere espliciti i confini prima delle prossime fasi prodotto.

## `apps/web`

### Responsabilita corretta

Sito pubblico, landing page, contenuto marketing, SEO, eventuali form pubblici e link verso il prodotto.

### File/cartelle attuali

- `.gitkeep`.

### Elementi sospetti

Nessuno. L'app e placeholder vuoto.

### Elementi da mantenere

- Stato placeholder finche non parte il sito pubblico.
- Divieto di importare `@qoovex/db` o servizi prodotto.

### Elementi da spostare

Nessuno.

### Elementi da eliminare

Nessuno.

### Priorita

Bassa. Serve solo README di confine.

### Rischio

Quando verra avviata, il rischio principale sara importare logica prodotto o duplicare componenti che dovrebbero vivere in `packages/ui`.

## `apps/workspace`

### Responsabilita corretta

Prodotto SaaS, API route prodotto, auth, MFA, membership, inviti, support session, policy server-side e servizi app-specific.

### File/cartelle attuali

- `src/app`: route Next e API.
- `src/shared`: config, lib, server services e repository app-local.
- `docs`: documentazione locale app.
- `package.json`, `tsconfig.json`, `next.config.ts`.

### Elementi sospetti

Nessun elemento da spostare subito.

Da monitorare:

- servizi server che potrebbero diventare troppo grandi;
- componenti UI futuri che, se riusabili, dovranno uscire verso `packages/ui`;
- route tenant legacy rimosse dal reset definitivo.

### Elementi da mantenere

- Auth, MFA, membership e support session.
- Policy default-deny server-side.
- Servizi `Document*`, `Deadline`, `DocumentVersion`, `Worker`, `JobSite`.
- Adapter Blob server-side, perche collegato al runtime workspace e alle policy autorizzative.
- Query DB nei server services autorizzati.

### Elementi da spostare

Nessuno in questa fase.

### Elementi da eliminare

Nessuno in questa fase.

Le route tenant legacy sono state rimosse dal reset definitivo; eventuali client devono usare le route `organization`.

### Priorita

Alta per mantenere confini e policy mentre crescono i moduli prodotto.

### Rischio

Il rischio principale e trasformare `src/shared/server` in una cartella troppo ampia senza repository o feature boundary piu espliciti. Per ora e accettabile perche il runtime e API-only e i servizi sono testati.

## `apps/sirio`

### Responsabilita corretta

Brandbook, showcase, preview design system e documentazione visiva.

### File/cartelle attuali

- `.gitkeep`.

### Elementi sospetti

Nessuno. L'app e placeholder vuoto.

### Elementi da mantenere

- Stato placeholder finche non esiste `packages/ui` o materiale brand canonico.

### Elementi da spostare

Nessuno.

### Elementi da eliminare

Nessuno.

### Priorita

Bassa oggi. Diventa media quando parte la UI.

### Rischio

Il rischio e far diventare Sirio la fonte dei componenti. Sirio deve importare da `packages/ui` e `packages/brand`, non duplicare o possedere primitive canoniche.

## `apps/mobile`

### Responsabilita corretta

Futura app mobile nativa.

### File/cartelle attuali

- `.gitkeep`.

### Elementi sospetti

Nessuno. L'app e placeholder vuoto.

### Elementi da mantenere

- Stato placeholder.
- Nessuna logica condivisa locale.

### Elementi da spostare

Nessuno.

### Elementi da eliminare

Nessuno.

### Priorita

Bassa.

### Rischio

Quando verra avviata, il rischio sara duplicare contratti API o utility invece di importare `packages/types` e, se esistente, `packages/utils`.

## Import vietati

Ricerca eseguita: import da `packages/*` verso `apps/*`.

Risultato: nessun import vietato rilevato.

## DB access

Ricerca eseguita: `PrismaClient`, `@prisma/client`, `@qoovex/db`, `db.`.

Risultato:

- `packages/db` contiene Prisma client e re-export;
- `apps/workspace` importa `@qoovex/db` nei servizi server-side, repository e test;
- nessuna app placeholder importa DB.

Questo e coerente con le regole attuali.

## File vaghi

Ricerca eseguita: `utils.ts`, `helpers.ts`, `misc.ts`, `temp.ts`.

Risultato: nessun file rilevato.

## Tipi dominio duplicati

Risultato osservato:

- i DTO condivisi vivono in `packages/types`;
- alcune interface input esistono nei servizi workspace come forme interne di validazione;
- questa duplicazione e accettabile finche non diventano contratti pubblici.

Regola: ogni contratto condiviso tra app o package deve passare da `packages/types`.

## Residui legacy

Residui reali trovati:

- documenti legacy marcati in `/docs`;
- audit e piani di migrazione che citano il vecchio dominio per vietarlo o mapparlo;
- migration storiche Prisma;
- test di mapping conservativo.

Non sono stati rilevati nuovi riferimenti food nel dominio attivo.

## Raccomandazione operativa

Procedere con le prossime feature solo mantenendo:

- servizi app-specific in `apps/workspace`;
- tipi pubblici in `packages/types`;
- schema e migrations in `packages/db`;
- niente package nuovi finche non esiste consumo reale.
