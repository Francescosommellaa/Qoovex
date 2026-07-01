# Packages

Codice condiviso del monorepo.

Package attivi:

- `db`: schema Prisma, client, migrations e utility DB server-only;
- `types`: ruoli, permessi, enum e DTO platform-neutral.

Package non ancora creati:

- `ui`: componenti UI, token e base styles quando esisteranno consumer reali;
- `brand`: loghi e asset canonici quando saranno definiti;
- `config`: configurazioni condivise quando emergera duplicazione;
- `utils`: utility pure riusabili tra app/package.

Regole:

- i package non importano da `apps/*`;
- nessun package condiviso deve contenere business logic app-specific;
- `packages/db` non deve importare UI, routing Next o auth workspace;
- `packages/types` non deve contenere Prisma client o query DB.
