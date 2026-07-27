# Packages

Package condivisi attivi:

- `db`: schema Prisma, dieci migration canoniche, client e guardrail database server-only;
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

La Fase 3 aggiunge modelli persistenti in `db` e contratti platform-neutral in `types`; non modifica `packages/ui` o la direzione grafica.
