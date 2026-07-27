# Operations and environment

## Stato attuale verificato

Production, Preview, locale e CI/E2E usano target distinti e guardati. Il repository contiene tredici migration; `20260727030000_adaptive_access_model` e stata applicata soltanto al database locale guardato tramite wrapper protetto. `verify:prisma` ha confermato tredici migration e diff nullo; nessun ambiente remoto e stato migrato o distribuito.

Il workflow `scheduled-jobs.yml` include data-control, digest e il nuovo runner operativo ogni cinque minuti. Il runner operativo crea al massimo 25 processi di controllo continuo per batch, uno per Azienda/finestra oraria, e consuma al massimo 20 step per invocazione. La route `/api/operations/run` richiede `CRON_SECRET`; il workflow modificato non e attivo in ambienti remoti finche non viene distribuito.

## Database operation impact Fase 4

```text
Operazioni aggiunte: revisione e proposta di condivisione, riferimenti evento-artifact, ricerca metadata-only, timeline aggregate e work item condivisione
Operazioni eliminate: doppia lettura del Centro operativo nella stessa request; il form di creazione link diretto non esegue piu la mutazione legacy
Query per flusso prima: Centro letto due volte in alcune pagine; condivisione creava direttamente il link; nessuna ricerca multi-dominio o timeline artifact aggregata
Query per flusso dopo: Centro legge una volta e pagina in memoria il read model autorizzato; la preparazione crea revisione/proposta/processo nella transazione; ricerca e timeline usano query SQL bounded e cursor-based
Rischio N+1: Centro usa query sequenziali in numero fisso, ricerca una query bounded e timeline una query aggregata; nessuna query per card o risultato
Strategia cache: nessuna cache condivisa; dati autorizzativi e operativi letti request-scoped
Strategia invalidazione: mutazioni e runner persistono stato; le revisioni approvate restano immutabili e la UI aggiorna esplicitamente dopo le azioni
Impatto tenant isolation: tutte le query operative filtrano organizationId e, per ruoli limitati, resource scope/artifact
Ambienti coinvolti: codice repository e solo database locale guardato; nessun Blob, Preview o Production modificato
Misurazione eseguita: conteggi pre/post invariati (pacchetti 2, item 4, link 1, processi 1, eventi 10), test di query, piano GIN, suite E2E e verify:prisma locale
```

Sul Prisma Dev locale canonico in loopback alla porta `51225`, il client limita il pool a una connessione per rispettare il limite del server embedded; CI e database remoti non ereditano questa eccezione. La ricerca usa PostgreSQL full-text `simple`, indici GIN di espressione e indici esatti/prefisso senza estensioni o tabelle indice.

## Specifiche non implementate

Non sono implementati coda esterna, provider aggiuntivi, retention automatica, SLA o monitoring commerciale. Non esiste polling client del Centro operativo, indicizzazione dei file, ricerca semantica o cronologia delle query.

## Decisioni aperte e hard stop

Ogni rollout remoto richiede target, backup, marker, checksum, diff, autorizzazione e smoke separati. Non usare deploy Prisma diretto, `db push`, reset o resolve.
