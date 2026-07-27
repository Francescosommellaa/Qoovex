# Operations and environment

## Stato attuale verificato

Production, Preview, locale e CI/E2E usano target distinti e guardati. Il repository contiene dieci migration; `20260726010000_operational_engine_phase_3` e stata applicata soltanto al database locale `qoovex-local` tramite wrapper protetto. `verify:prisma` ha confermato dieci migration e diff nullo; nessun ambiente remoto e stato migrato o distribuito.

Il workflow `scheduled-jobs.yml` include data-control, digest e il nuovo runner operativo ogni cinque minuti. Il runner operativo crea al massimo 25 processi di controllo continuo per batch, uno per Azienda/finestra oraria, e consuma al massimo 20 step per invocazione. La route `/api/operations/run` richiede `CRON_SECRET`; il workflow modificato non e attivo in ambienti remoti finche non viene distribuito.

## Database operation impact Fase 3

```text
Operazioni aggiunte: enqueue transazionale, read model Centro/dettaglio, claim/step, timeline, decisioni, eccezioni e receipt
Operazioni eliminate: N+1 artifact sostituito da query batch fisse; i widget shell rimossi non eseguivano query database
Query per flusso prima: nessuna operazione del motore; restano invariate le query proprie della mutazione dominio
Query per flusso dopo: enqueue aggiunge validazione artifact batch e upsert processo nella transazione; Centro full-scope 8 query parallele oltre al gate auth; dettaglio 1 query aggregata oltre al gate/scope
Rischio N+1: artifact validation continua usa 10 query tipizzate fisse per batch di 100 riferimenti; nessuna query per artifact/card
Strategia cache: nessuna cache condivisa; dati autorizzativi e operativi letti request-scoped
Strategia invalidazione: mutazioni e runner persistono stato; UI usa refresh esplicito dopo azioni
Impatto tenant isolation: tutte le query operative filtrano organizationId e, per ruoli limitati, resource scope/artifact
Ambienti coinvolti: codice repository e solo database locale guardato; nessun Blob, Preview o Production modificato
Misurazione eseguita: conteggio statico dei Prisma Client call-site, test di query fisse, test runner e verify:prisma locale
```

## Specifiche non implementate

Non sono implementati coda esterna, provider aggiuntivi, retention automatica, SLA o monitoring commerciale. Non esiste polling client del Centro operativo.

## Decisioni aperte e hard stop

Ogni rollout remoto richiede target, backup, marker, checksum, diff, autorizzazione e smoke separati. Non usare deploy Prisma diretto, `db push`, reset o resolve.
