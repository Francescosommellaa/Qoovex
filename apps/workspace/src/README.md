# Workspace Source

- `app`: route Next.js, pagine e route handler API;
- `shared/server`: servizi, repository, accesso, audit e integrazioni server-only;
- `shared/api`, `shared/lib` e `shared/config`: contratti e utility app-locali;
- `views`: composizioni prodotto e superfici Workspace;
- `types`: tipi app-locali;
- `proxy.ts`: confine delle API previsto dal runtime.

Gli alias FSD sono configurati, ma la migrazione e progressiva e non prova che ogni view segua gia la struttura finale. Auth, Prisma, Blob e business logic non entrano nei componenti client.

La futura orchestrazione di processo, se approvata, restera server-side; i contratti concettuali correnti non autorizzano nuove cartelle, route o servizi.
