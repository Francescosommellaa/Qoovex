# How to use the repository

La documentazione canonica e la sequenza continua `00_PRODUCT_AND_SCOPE.md`–`08_SUPPORT_AND_DATA_CONTROL.md`. `README.md` e `project_brain.json` sono punti di ingresso; Qoovex-Brain e la memoria operativa indicizzata.

## Gerarchia delle fonti

1. richiesta corrente e regole legali/business approvate;
2. codice, `schema.prisma`, migration e manifest per lo stato implementato;
3. documentazione canonica per contratti e direzione approvata;
4. Qoovex-Brain per routing, decisioni e failure mode;
5. materiale storico soltanto per provenienza, mai per sovrascrivere lo stato corrente.

## Classificazione obbligatoria

Ogni documento deve distinguere:

- **Stato attuale verificato**: esiste nel codice o nello schema corrente.
- **Direzione approvata**: decisione prodotto definitiva, non necessariamente implementata.
- **Specifica concettuale non implementata**: modello target privo di contratto o schema approvato.
- **Decisione aperta / hard stop**: richiede approvazione e non puo essere risolta per deduzione.

Non presentare placeholder, ricerca universale, processi, OCR o AI come capability attive. Non usare i nomi concettuali dei processi come tipi o tabelle senza una decisione successiva.

## Modifiche tecniche

Per schema, autorizzazioni, storage, API o UI, il codice e `packages/db/prisma/schema.prisma` prevalgono. Aggiornare i documenti canonici coinvolti, Qoovex-Brain e il session log; la Memory si aggiorna soltanto su richiesta esplicita.

## Preflight automatico Operations database

Classificare come database-sensitive qualunque modifica a route, server action, servizio, query, dashboard, widget dati, polling, reminder, job, notifiche, audit, liste, ricerca, filtri, export, supporto, retention o workflow documentali. Applicare il controllo `Database operation impact` di `OperationalProtocol.md`: ricostruire il flusso reale, misurare o stimare con evidenza le chiamate Prisma prima/dopo e verificare duplicazioni, N+1, polling, scansioni, over-fetching e accessi cloud evitabili.

Schema, migration, provider, auth, permessi, tenant isolation, frequenze job, audit, retention, servizi esterni e configurazioni cloud sono hard stop. Una specifica concettuale non autorizza alcuna di queste modifiche.
