# How to use the repository

La documentazione canonica e la sequenza continua `00_PRODUCT_AND_SCOPE.md`-`08_SUPPORT_AND_DATA_CONTROL.md`. `README.md` e `project_brain.json` sono punti di ingresso; Qoovex-Brain e la memoria operativa indicizzata.

## Gerarchia delle fonti

1. richiesta corrente e regole legal/business approvate;
2. codice, `schema.prisma`, migration e manifest per lo stato implementato;
3. documentazione canonica per contratti e confini;
4. Qoovex-Brain per routing, decisioni e failure mode;
5. materiale storico soltanto per provenienza.

## Classificazione obbligatoria

Ogni documento deve distinguere:

- **Stato attuale verificato**: esiste nel codice, schema o runtime verificato.
- **Decisione implementata**: scelta approvata e realizzata con contratti verificabili.
- **Specifica concettuale non implementata**: direzione priva di contratto o runtime attivo.
- **Decisione aperta / hard stop**: richiede approvazione e non puo essere risolta per deduzione.

Processi persistenti, Centro operativo e quattro definizioni deterministiche sono implementati in Fase 3. OCR, AI, ricerca universale, nuovi canali, retention automatica, SLA e limiti commerciali non sono capability attive.

## Modifiche tecniche

Per schema, autorizzazioni, storage, API o UI, il codice e `packages/db/prisma/schema.prisma` prevalgono. Aggiornare i documenti canonici coinvolti, Qoovex-Brain e il session log; la Memory si aggiorna soltanto su richiesta esplicita.

La direzione grafica resta quella canonica: Geist/Geist Mono, Tabler, tema light/dark/system e primitive `@qoovex/ui`. Modifiche a token, font, tema, motion, iconografia o foundation richiedono un task separato.

## Preflight automatico Operations database

Classificare come database-sensitive qualunque modifica a route, server action, servizio, query, dashboard, widget dati, polling, reminder, job, notifiche, audit, liste, ricerca, filtri, export, supporto, retention o workflow documentali. Applicare `Database operation impact` di `OperationalProtocol.md`: ricostruire il flusso reale, misurare o stimare con evidenza le chiamate Prisma prima/dopo e verificare duplicazioni, N+1, polling, scansioni, over-fetching e accessi cloud evitabili.

Schema, migration, provider, auth, permessi, tenant isolation, frequenze job, audit, retention, servizi esterni e configurazioni cloud sono hard stop fuori da un piano esplicitamente approvato. La Fase 3 autorizza la sola migration additiva locale e il runner esistente; non autorizza deploy remoti.
