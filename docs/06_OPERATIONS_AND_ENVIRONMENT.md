# Operations and environment

## Stato attuale verificato

Production, Preview, locale e CI/E2E usano target distinti e guardati. Il repository contiene diciassette migration, tutte applicate da zero e verificate senza drift sul solo database locale canonico in loopback alla porta `51225`. `20260728030000_operational_workspace_expansion` introduce il nuovo schema operativo; `20260728040000_operational_workspace_index_names` allinea in modo additivo cinque nomi indice al limite PostgreSQL di 63 byte e ai mapping Prisma espliciti. Nessun ambiente remoto e stato migrato o distribuito.

Impatto query del nuovo percorso: il caricamento di una versione aggiunge una sola lettura checksum prima del Blob per evitare duplicati; profilo e contatti usano una join organizzazione; liste di richieste/timeline sono limitate e senza N+1; controlli fonte e revisioni usano transazioni a numero fisso di query. La shell aggiunge una lettura bounded per massimo sei cantieri e una lettura bounded degli eventi contestuali, raggruppati in memoria a massimo tre per cantiere; lo scope assegnato e il filtro `organizationId` restano server-side. Nessun polling o cache condivisa e stato introdotto.

## Rollout e rollback access model

Preview e Production restano in hard stop finche target, fingerprint, migration history, drift, backup/PITR e procedura di restore non sono verificabili separatamente. Il rollout autorizzato deve eseguire expand, dry-run del backfill, backfill reale, riconciliazione, codice compatibile, smoke test e solo infine contract, prima su Preview e poi su Production. Il rollback prima del contract usa il punto di ripristino verificato e il codice dual-compatible; dopo il contract richiede restore coordinato di schema e dati. Non usare `db push`, reset, resolve, SQL manuale o rollout simultaneo su ambienti remoti.

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
Misurazione eseguita: reset locale esplicitamente autorizzato, applicazione fresca di 17 migration, seed idempotente, 2 pacchetti, 10 item, 1 link e zero riferimenti Blob; test di query, piano GIN e verify:prisma locale
```

## Database operation impact correzione CI e fixture locale

```text
Operazioni aggiunte o eliminate nel runtime: nessuna
Migration: rename additivo di cinque indici esistenti; nessuna tabella, colonna o riga di dominio modificata
Query per flusso prima/dopo: invariato
Rischio N+1 e cache: invariati
Impatto tenant isolation e autorizzazione: nessuno
Ambiente modificato: esclusivamente database locale guardato
Dati locali precedenti: eliminati dal reset autorizzato e sostituiti dalla nuova fixture sintetica
Nuovi scenari fixture: profilo/contatti, fasi e assegnazioni, link documento-cantiere, revisioni evidenza, richieste, messaggi, timeline e fonti documentali
Blob e provider: nessun oggetto Blob creato e nessuna integrazione attivata
```

Sul Prisma Dev locale canonico in loopback alla porta `51225`, il client limita il pool a una connessione per rispettare il limite del server embedded; CI e database remoti non ereditano questa eccezione. La ricerca usa PostgreSQL full-text `simple`, indici GIN di espressione e indici esatti/prefisso senza estensioni o tabelle indice.

## Specifiche non implementate

Non sono implementati coda esterna, provider aggiuntivi, retention automatica, SLA o monitoring commerciale. Non esiste polling client del Centro operativo, indicizzazione dei file, ricerca semantica o cronologia delle query.

## Decisioni aperte e hard stop

Ogni rollout remoto richiede target, backup, marker, checksum, diff, autorizzazione e smoke separati. Non usare deploy Prisma diretto, `db push`, reset o resolve sugli ambienti remoti.
