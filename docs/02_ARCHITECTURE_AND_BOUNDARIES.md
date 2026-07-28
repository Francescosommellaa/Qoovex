# Architecture and boundaries

## Stato attuale verificato

- `apps/workspace`: runtime prodotto, auth/MFA, route, motore, runner, read model e UI operativa;
- `apps/web`: marketing pubblico e pagine legali;
- `apps/sirio`: catalogo/proof del design system con scenario operativo Fase 4, senza logica prodotto;
- `packages/db`: Prisma, sedici migration canoniche, client e guardrail; l'ultima migration additiva e presente nel repository ma non ancora applicata al target locale corrente;
- `packages/types`: contratti platform-neutral inclusi i DTO `Operational*`;
- `packages/ui`: foundation condivisa con primitive generiche search/timeline/work queue, senza dominio;
- `packages/brand-resources`: asset SVG proprietari.

Nel Workspace il registry e l'enqueue server-only vivono nel layer condiviso; read model e azioni operative vivono nella feature; il riepilogo artifact e un'entity; Centro operativo e dettaglio sono view; il routing resta in `app`. Il gate FSD impedisce import verso layer superiori.

Le definizioni eseguibili sono un registry server-side versionato, non una tabella o un editor. Ricerca, timeline e condivisione sono servizi Workspace server-only; i route handler fanno parsing, auth e delega. PostgreSQL full-text usa indici di espressione e non replica il dominio in una tabella indice.

## Direzione approvata

Documenti, lavoratori, cantieri, scadenze, checklist, prove e pacchetti restano entita dominio. I processi conservano riferimenti, snapshot di regole e receipt idempotenti. Prisma salva dati/metadati; Blob privato resta l'unico storage dei binari.

## Specifiche non implementate

Non esistono editor processi, plugin provider, coda esterna, ricerca semantica/nei file o runtime in Web/Sirio. `packages/ui` non contiene logica operativa, permessi o API.

## Decisioni aperte e hard stop

Provider OCR/AI, indicizzazione, nuove infrastrutture, retention e osservabilita esterna richiedono approvazione. Le app non si importano tra loro e i package non acquisiscono business logic app-specific.
