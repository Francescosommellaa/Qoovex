# Architecture and boundaries

## Stato attuale verificato

- `apps/workspace`: runtime prodotto, auth/MFA, route, motore, runner, read model e UI operativa;
- `apps/web`: marketing pubblico e pagine legali;
- `apps/sirio`: catalogo/proof del design system, non modificato in Fase 3;
- `packages/db`: Prisma, dieci migration canoniche, client e guardrail;
- `packages/types`: contratti platform-neutral inclusi i DTO `Operational*`;
- `packages/ui`: foundation condivisa invariata;
- `packages/brand-resources`: asset SVG proprietari.

Nel Workspace il registry e l'enqueue server-only vivono nel layer condiviso; read model e azioni operative vivono nella feature; il riepilogo artifact e un'entity; Centro operativo e dettaglio sono view; il routing resta in `app`. Il gate FSD impedisce import verso layer superiori.

Le definizioni eseguibili sono un registry server-side versionato, non una tabella o un editor. Gli enqueue avvengono nella stessa transazione delle mutazioni dominio. Il runner usa l'infrastruttura GitHub Actions/`CRON_SECRET` gia adottata e non introduce code o dipendenze esterne.

## Direzione approvata

Documenti, lavoratori, cantieri, scadenze, checklist, prove e pacchetti restano entita dominio. I processi conservano riferimenti, snapshot di regole e receipt idempotenti. Prisma salva dati/metadati; Blob privato resta l'unico storage dei binari.

## Specifiche non implementate

Non esistono editor processi, plugin provider, coda esterna, ricerca universale o runtime in Web/Sirio. `packages/ui` non contiene logica operativa.

## Decisioni aperte e hard stop

Provider OCR/AI, indicizzazione, nuove infrastrutture, retention e osservabilita esterna richiedono approvazione. Le app non si importano tra loro e i package non acquisiscono business logic app-specific.
