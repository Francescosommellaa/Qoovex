# Architecture and boundaries

## Stato attuale verificato

Il monorepo contiene:

- `apps/workspace`: runtime Next.js del prodotto, pagine, auth, MFA, API, servizi server, supporto e Console Qoovex;
- `apps/web`: sito pubblico e pagine legali;
- `apps/sirio`: catalogo e prova tecnica del design system;
- `apps/mobile`: placeholder;
- `packages/db`: Prisma, client, schema, migration e guardrail database;
- `packages/types`: contratti platform-neutral;
- `packages/ui`: foundation condivisa per token, CSS, primitive, tema, hook e utility;
- `packages/brand-resources`: SVG proprietari asset-only.

Le app non si importano tra loro. `packages/ui` non conosce auth, Prisma, route, ruoli o dominio; le composizioni prodotto restano app-locali. Route e servizi autorizzativi vivono nel workspace. Prisma salva dati e metadati; Vercel Blob privato salva binari.

Gli alias Feature-Sliced del workspace esistono, ma non provano una migrazione completa delle view. Il registro documentale condiviso vive in `packages/types`; nessuna view ricostruisce categorie o sensibilita dal nome.

## Direzione approvata

Il motore operativo futuro resta server-side nel workspace e orchestra servizi dominio esistenti. I processi non duplicano Document, Worker, JobSite, Deadline, Checklist, Evidence o DocumentPackage: li referenziano come input e output autorizzati.

Il placement target, subordinato alle decisioni di Fase 3, e:

- `apps/workspace`: orchestrazione, runner, accesso, riconciliazione, read model del centro operativo e route decisionali;
- `packages/types`: eventuali enum e DTO platform-neutral approvati;
- `packages/db`: eventuale persistenza e indici soltanto dopo schema e migration approvati;
- `packages/ui`: sole primitive realmente generiche; composizioni processo app-locali;
- `apps/sirio`: eventuale proof visuale prima di promozioni UI;
- `apps/web`: nessuna logica dominio.

## Specifiche concettuali non implementate

Il modello target prevede acquisizione evento, blocco del contesto autorizzativo, deduplica, risoluzione delle regole, piano, esecuzione, eccezioni, riconciliazione e chiusura. Questa sequenza non autorizza cartelle, servizi, code, dipendenze o contratti.

## Decisioni aperte e hard stop

Schema, migration, naming, runner, frequenze, adapter OCR/AI, code o scheduler, cache, indicizzazione e placement concreto richiedono approvazione. Le architetture esistenti di auth, Prisma, Blob, Vercel e isolamento Azienda restano vincolanti.
