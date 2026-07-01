# Monorepo Boundaries And Placement

Data: 2026-06-30.

## Obiettivo

Questo audit definisce dove devono vivere codice, documentazione e responsabilita nel monorepo Qoovex.

Qoovex resta:

> Il sistema piu semplice per piccole imprese e subappaltatori che devono tenere pronti documenti, scadenze e prove di cantiere.

Questa fase non introduce feature prodotto, non sposta runtime in modo massivo, non modifica Prisma e non crea nuovi provider storage.

## Struttura attuale osservata

```txt
apps/
  workspace/    # runtime Next.js API-only del prodotto
  web/          # placeholder con .gitkeep
  sirio/        # placeholder con .gitkeep
  mobile/       # placeholder con .gitkeep

packages/
  db/           # Prisma schema, migrations, client e utility DB server-only
  types/        # ruoli, permessi, enum e DTO condivisi
```

Package non presenti oggi:

- `packages/ui`;
- `packages/brand`;
- `packages/config`;
- `packages/utils`.

La loro assenza e corretta finche non esiste una seconda app o un consumo reale che richieda estrazione condivisa.

## Struttura target

```txt
apps/
  web/          # sito marketing pubblico
  workspace/    # prodotto SaaS
  sirio/        # brandbook, showcase e preview design system
  mobile/       # futura app mobile nativa

packages/
  db/           # Prisma, schema, migrations, db client
  types/        # tipi e contratti condivisi
  ui/           # componenti UI condivisi, token e base styles
  brand/        # loghi, asset e identita
  config/       # config condivise
  utils/        # utility pure e hook riusabili
```

La struttura target e una direzione, non un obbligo di creare cartelle vuote.

## Responsabilita app

### `apps/workspace`

Contiene il prodotto SaaS e il runtime API:

- route API prodotto;
- auth, MFA, membership, inviti e support session;
- policy autorizzazione server-side;
- servizi server-only specifici del workspace;
- adapter runtime specifici, incluso Blob per `DocumentVersion`;
- eventuali viste prodotto future.

Non deve contenere:

- schema Prisma;
- contratti dominio condivisi duplicati;
- componenti UI generici riusabili tra app;
- asset brand canonici;
- logica marketing.

Stato attuale: coerente. I servizi `Document*`, `Deadline`, `Worker`, `JobSite`, auth, support e Blob adapter restano qui perche sono app-specific e server-side.

### `apps/web`

Deve contenere solo sito pubblico e marketing.

Stato attuale: placeholder vuoto, corretto.

Non deve contenere Prisma, route API prodotto, auth workspace, servizi documentali o tipi dominio duplicati.

### `apps/sirio`

Deve diventare brandbook, showcase e preview.

Stato attuale: placeholder vuoto, corretto.

Quando verra avviato, dovra importare componenti veri da `packages/ui` e asset da `packages/brand`; non dovra essere la fonte canonica del design system.

### `apps/mobile`

Deve restare vuota o minimale fino all'avvio dell'app nativa.

Stato attuale: placeholder vuoto, corretto.

Non deve contenere logica condivisa o duplicati del dominio.

## Responsabilita package

### `packages/db`

Contiene:

- Prisma schema;
- migrations;
- Prisma client;
- utility DB server-only;
- README DB.

Non deve importare da `apps/*`, componenti UI o routing Next.

Stato attuale: coerente.

### `packages/types`

Contiene:

- ruoli e permessi condivisi;
- enum serializzabili;
- DTO e contratti platform-neutral;
- tipi dominio condivisi.

Non deve contenere Prisma client, query DB, componenti React o funzioni server-only.

Stato attuale: coerente.

### Package futuri

`packages/ui`, `packages/brand`, `packages/config` e `packages/utils` non esistono oggi. Non vanno creati come placeholder senza consumo reale.

## Regole import

Vietato:

```txt
packages/* -> apps/*
```

Consentito:

```txt
apps/* -> packages/*
packages/ui -> packages/types, se necessario
packages/db -> packages/types, solo se non crea cicli
```

Ogni nuovo `@qoovex/*` usato da una app deve avere:

- `package.json` workspace dependency;
- export o entrypoint chiaro;
- configurazione TS/Next coerente, se richiesta dal pattern esistente.

## Problemi trovati

1. `turbo.json` non dichiarava ancora le variabili Blob nel set env, mentre `@qoovex/workspace` usa Vercel Blob per `DocumentVersion`.
2. `apps/web`, `apps/sirio` e `apps/mobile` non avevano README dedicato; essendo placeholder, bastano README sintetici di confine.
3. Le app placeholder non contengono codice, quindi non ci sono componenti, asset o utility da spostare ora.
4. Le occorrenze legacy rimaste devono essere limitate a divieti espliciti, report storici e test di guardrail.

## Cosa e gia corretto

- Nessun import vietato rilevato da `packages/*` verso `apps/*`.
- Nessun file vago rilevato tra `utils.ts`, `helpers.ts`, `misc.ts`, `temp.ts`.
- Il DB e centralizzato in `packages/db`.
- Le query DB app-specific sono nei server services autorizzati di `apps/workspace`.
- I tipi condivisi sono in `packages/types`.
- `@vercel/blob` e installato con casing corretto in `@qoovex/workspace`.

## Cosa e fuori posto

Non sono stati rilevati file runtime chiaramente fuori posto che richiedano spostamento immediato.

Le interface input locali nei servizi `apps/workspace/src/shared/server/*` sono accettabili come forme interne di validazione. I DTO pubblici condivisi restano in `packages/types`.

## Cosa va spostato ora

Nulla. Questa sessione deve mettere in sicurezza regole e documentazione, non fare refactor fisici.

## Cosa va spostato in futuro

- Componenti UI ripetuti tra `apps/web`, `apps/workspace`, `apps/sirio` o `apps/mobile` verso `packages/ui`.
- Loghi, simboli e asset canonici verso `packages/brand`.
- Config TypeScript, ESLint, Prettier o Tailwind condivise verso `packages/config`, solo se diventano realmente condivise.
- Utility pure usate da piu app/package verso `packages/utils`.

## Rischi

- Estrarre package troppo presto puo creare astrazioni inutili.
- Lasciare componenti o asset duplicati quando le app cresceranno puo rendere incoerente il prodotto.
- Spostare server services app-specific fuori da `apps/workspace` oggi aumenterebbe il rischio senza beneficio.
- Le route tenant legacy sono state rimosse; il naming prodotto e tecnico usa `Organization`.

## Decisioni consigliate

1. Tenere `packages/db` e `packages/types` come unici package condivisi attivi.
2. Non creare `packages/ui`, `packages/brand`, `packages/config` o `packages/utils` finche non esiste consumo reale.
3. Lasciare i servizi dominio in `apps/workspace/src/shared/server` finche sono specifici del runtime workspace.
4. Usare `packages/types` per ogni nuovo contratto condiviso API/app.
5. Ripetere questo audit prima di avviare UI, Sirio o app mobile.
