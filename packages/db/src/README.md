# DB Source

Scopo: superficie TypeScript del package database.

Metti qui:
- `client.ts`, `index.ts` e file di supporto per esporre il package in modo pulito.

Non mettere qui:
- schema Prisma;
- query feature-specific non riusabili.

Regole:
- entrypoint minimo e leggibile;
- separa bootstrap client da eventuali helper futuri.
- normalizza gli SSL mode PostgreSQL non canonici a `verify-full` prima di inizializzare Prisma.
