# Packages

Package condivisi attivi:

- `db`: schema Prisma, nove migration canoniche, client e guardrail database server-only;
- `types`: ruoli, permessi, enum e DTO platform-neutral, inclusi i contratti operativi minimizzati;
- `ui`: foundation condivisa shadcn `base-nova`, Base UI, Tabler, token, CSS, tema, hook e utility;
- `brand-resources`: asset SVG proprietari, senza tipografia o comportamento.

Regole:

- i package non importano da `apps/*`;
- nessun package condiviso contiene business logic app-specific;
- `packages/db` non importa UI, routing Next o auth Workspace;
- `packages/types` non contiene Prisma Client, transizioni o query;
- `packages/ui` non conosce auth, ruoli, API, Prisma o dominio;
- registry, policy, runner e automazioni restano app-locali in Workspace.

Le Fasi 3-4 aggiungono modelli persistenti in `db`, contratti platform-neutral in `types` e primitive generiche di ricerca, timeline e work queue in `ui`. La logica dominio resta nel Workspace e la direzione grafica non cambia.
