# Shared Packages Roadmap

Data: 2026-06-30.

## Package esistenti oggi

### `packages/db`

Stato: esistente e attivo.

Contiene Prisma schema, migrations, client e utility DB server-only.

Deve restare indipendente dalle app. Non deve importare route, auth Next, componenti UI o codice client.

### `packages/types`

Stato: esistente e attivo.

Contiene ruoli, permessi, enum e DTO condivisi. E il posto corretto per contratti serializzabili che possono servire a workspace, web, mobile o test.

Non deve contenere query DB, Prisma client, funzioni server-only o componenti React.

## Package mancanti

### `packages/ui`

Stato: non esiste.

Non crearlo ora.

Crearlo quando:

- esistono componenti UI riusabili tra almeno due app;
- `apps/sirio` deve mostrare il design system reale;
- `apps/workspace` e `apps/web` iniziano a condividere primitive visuali;
- token e base styles diventano canonici.

Deve contenere:

- componenti UI generici;
- primitive accessibili;
- pattern UI senza business logic;
- `styles/tokens.css`;
- `styles/base.css`;
- README con regole di consumo.

Non deve contenere:

- query DB;
- auth workspace;
- copy prodotto troppo specifico;
- route handler;
- Prisma;
- logica documenti/cantieri/lavoratori.

Ordine consigliato:

1. Avviare UI workspace reale.
2. Identificare componenti ripetuti.
3. Creare `packages/ui`.
4. Far importare `apps/sirio` da `packages/ui`.
5. Solo dopo, valutare consumo da `apps/web` e `apps/mobile`.

### `packages/brand`

Stato: non esiste.

Non crearlo ora.

Crearlo quando:

- esistono loghi, simboli, favicon o asset brand canonici;
- `apps/web`, `apps/workspace` e `apps/sirio` devono usare gli stessi asset;
- serve una fonte unica per identita visiva.

Deve contenere:

- loghi;
- simboli;
- asset statici;
- metadata brand non sensibili;
- README.

Non deve contenere business logic o componenti React pesanti.

### `packages/config`

Stato: non esiste.

Non crearlo ora.

Crearlo quando:

- piu package/app duplicano configurazioni TypeScript;
- viene introdotto lint condiviso;
- Tailwind o Prettier devono avere una fonte comune.

Deve contenere configurazioni tecniche, non logica prodotto.

### `packages/utils`

Stato: non esiste.

Non crearlo ora.

Crearlo quando:

- la stessa utility pura viene usata da piu app/package;
- esistono helper date/string/formatting davvero generici;
- hook riusabili non dipendono dal runtime workspace.

Non deve contenere:

- Prisma;
- auth;
- segreti;
- route handler;
- logica autorizzativa workspace;
- regole normative o documentali sensibili.

## Impatto per app

### `apps/workspace`

Oggi importa `@qoovex/db` e `@qoovex/types`.

In futuro potra importare:

- `@qoovex/ui` per componenti generici;
- `@qoovex/brand` per asset;
- `@qoovex/utils` per utility pure.

I server services restano app-local finche dipendono da auth, policy e runtime Next.

### `apps/web`

Oggi e placeholder.

In futuro dovrebbe importare solo package necessari per marketing:

- `@qoovex/ui` se usa componenti condivisi;
- `@qoovex/brand` per asset;
- raramente `@qoovex/types`, solo per contratti pubblici non sensibili.

Non deve importare `@qoovex/db`.

### `apps/sirio`

Oggi e placeholder.

In futuro dovra mostrare, non possedere, il design system:

- importa da `@qoovex/ui`;
- importa da `@qoovex/brand`;
- non duplica componenti canonici.

### `apps/mobile`

Oggi e placeholder.

In futuro potra importare:

- `@qoovex/types`;
- `@qoovex/utils`;
- eventuali contratti API;
- componenti solo se compatibili con runtime nativo.

Non deve contenere logica condivisa.

## Ordine consigliato

1. Mantenere solo `packages/db` e `packages/types` finche il prodotto resta API-first.
2. Quando parte UI workspace, creare componenti localmente se sono specifici.
3. Quando un componente serve anche a `apps/sirio` o `apps/web`, creare `packages/ui`.
4. Quando esistono asset brand canonici, creare `packages/brand`.
5. Quando due app duplicano config, creare `packages/config`.
6. Quando utility pure sono duplicate, creare `packages/utils`.

## Criterio di creazione package

Creare un package solo se risponde ad almeno una condizione:

- ha due consumer reali;
- elimina duplicazione gia presente;
- definisce una fonte canonica necessaria;
- riduce accoppiamento senza spostare logica app-specific.

Non creare package per anticipazione astratta.
