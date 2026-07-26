# Packages

Package condivisi attivi:

- `db`: schema Prisma, nove migration canoniche, client, config e guardrail database server-only;
- `types`: ruoli, permessi, enum e DTO platform-neutral;
- `ui`: foundation condivisa shadcn `base-nova`, Base UI, Tabler, token, CSS, tema, hook e utility;
- `brand-resources`: asset SVG proprietari, senza tipografia o comportamento.

Regole:

- i package non importano da `apps/*`;
- nessun package condiviso contiene business logic app-specific;
- `packages/db` non importa UI, routing Next o auth Workspace;
- `packages/types` non contiene Prisma Client o query;
- `packages/ui` non conosce auth, ruoli, API, Prisma o dominio;
- le composizioni di processo future restano app-locali finche non esiste riuso reale.

I contratti concettuali del motore operativo non autorizzano nuovi tipi, modelli o package prima delle decisioni di Fase 3.
