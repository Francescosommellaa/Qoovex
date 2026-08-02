# Runtime and active features

## Stato attuale verificato

Il Workspace mantiene auth, MFA, inviti, supporto, dominio documentale, scadenze/calendario, checklist/prove, pacchetti/condivisioni, notifiche, audit e data-control. Gli inviti creano soltanto `COLLABORATOR`; preset, permessi normalizzati, scope, grant tenant-safe e scadenza vengono persistiti. L'`OWNER` puo modificarli con optimistic concurrency, reinviare o revocare inviti e accessi; aggiornamento e revoca invalidano le sessioni del destinatario.

Il motore operativo implementa cinque definizioni:

| Definizione | Trigger | Effetti deterministici |
|---|---|---|
| `DOCUMENT_RECEIVED@1` | documento, aggiornamento o nuova versione | contesto, dati mancanti, requisiti, deadline/reminder, pacchetti interni |
| `WORKER_CREATED@1` | creazione o aggiornamento lavoratore | snapshot requisiti WORKER, documenti mancanti, reminder |
| `JOB_SITE_CREATED@1` | creazione o aggiornamento cantiere | requisiti globali/specifici, documenti/checklist esistenti, reminder |
| `CONTINUOUS_CONTROL@1` | una volta per Azienda/finestra oraria | stati temporali a 30 giorni, requisiti, processi fermi, reminder e artifact |
| `DOCUMENT_PACKAGE_SHARING@1` | preparazione esplicita pacchetto | manifest deterministico, problemi, decisione umana e pubblicazione idempotente |

Una nuova versione riporta da `READY_FOR_REVIEW` a `DRAFT` soltanto pacchetti interni non condivisi. I pacchetti `SHARED` non vengono modificati. I problemi tecnici sono ritentati; i dati mancanti o ambigui aprono decisioni/eccezioni senza retry infinito.

## Spazio operativo contestuale

Il Workspace espone servizi tenant-safe per profilo azienda e contatti, link non duplicanti documento-cantiere, revisione delle versioni, assegnazioni con ruolo/periodo/storico, prove classificate e revisionate, richieste, messaggi e timeline contestuale append-only. La timeline utente resta separata da `ProductAuditEvent` e accetta solo metadati minimizzati.

La fase cantiere segue `DRAFT -> PREPARATION -> IN_PROGRESS <-> PAUSED -> CLOSING -> COMPLETED`. Il cambio usa una route dedicata: apertura e completamento calcolano richieste, checklist e documenti bloccanti; override e riapertura richiedono Owner e motivazione. L'editing generico non puo cambiare fase.

Le fonti v1 sono `DIRECT_UPLOAD` e `GUIDED_MANUAL`. Un controllo deterministico puo aprire una richiesta guidata ma non degrada documenti approvati. `AUTHORIZED_INTEGRATION`, scraping, password conservate e AI restano disabilitati.

## Affidabilita e impatto

I livelli implementati sono `VERIFIED/HIGH/MEDIUM/LOW/CONFLICT` e `LOW/CONTROLLED/SENSITIVE/IRREVERSIBLE`. La policy non usa soglie numeriche:

- automatico: affidabilita `VERIFIED/HIGH`, impatto `LOW`, effetto deterministico, reversibile e autorizzato;
- decisione: impatto `CONTROLLED` o affidabilita `MEDIUM/LOW/CONFLICT`;
- vietato: `IRREVERSIBLE`, effetto non autorizzato, ampliamento accesso, disclosure o azione legale;
- `SENSITIVE` non e automatico.

## Foundation Operational Intelligence — Tranche 1

Il runtime espone un registry azioni server-side allow-listed, versione 1:

| Azione | Permesso | Scope | Receipt |
|---|---|---|---|
| `DOCUMENT_STATUS_RECONCILE@1` | `documents:update` | documento | `DOCUMENT_STATUS_RECONCILED` |
| `DEADLINE_RECONCILE@1` | `documents:expiry:manage` | documento/scadenza | `DEADLINE_RECONCILED` |
| `REMINDERS_RECONCILE@1` | `documents:expiry:manage` | Azienda/scadenza | `REMINDERS_RECONCILED` |
| `PACKAGE_REVIEW_RESET@1` | `documentPackages:update` | pacchetto | `PACKAGE_REVIEW_RESET` |

Decisioni, eccezioni e notifiche sono prodotte soltanto dai servizi interni gia autorizzati del runner: non sono comandi generici proponibili da un adapter.

L'executor della Tranche 1 non muta il dominio: valida envelope, action key, schema, tenant, permission e scope, applica `execution-policy.ts` e restituisce output/receipt/event preview `@1`. `OFF` e il default; `SHADOW` e `SUGGEST_ONLY` restano non scriventi; anche `AUTO_LOW_RISK` e dry-run e non puo essere selezionata senza una soglia evaluation approvata lato server. Il provider-neutral adapter e disabilitato e non espone metodi di scrittura.

La provenienza distingue osservato, estratto, inferito, confermato dall'utente, confermato dal sistema, conflittuale e sconosciuto. La confidence e obbligatoriamente riferita a un task e a una versione di soglia. L'evaluation harness rifiuta fixture non sintetiche.

I receipt coprono gli effetti del runner rappresentabili dall'enum esistente: stato documento, deadline, reminder, reset review pacchetto, apertura/risoluzione eccezione e apertura decisione. Servono tipi Prisma aggiuntivi, quindi una migration futura, per rappresentare semanticamente applicazione delle decisioni ai campi documento, snapshot regole e scadenza share link senza riusare tipi impropri.

### Database operation impact

Questa tranche non modifica schema, migration, permessi o relazioni. Il runner aggiunge un `upsert` idempotente per ciascun effetto reale gia rappresentabile da `OperationalEffectType`; la chiave unica Azienda/effetto rende il replay non duplicante. Inventario ed export eseguono query tenant-scoped aggiuntive soltanto quando un Owner avvia quei flussi di data-control; il proxy budget testato dell'inventario passa da 57 a 77 operazioni per includere tutti i modelli operativi. Nessun nuovo polling, cache, provider, upload o operazione bulk distruttiva e introdotto.

## API e UI attive

Sono attive le route `/api/operations/processes`, timeline processo/artifact cursor-based, risoluzione decisioni/eccezioni, retry step e runner protetto. I read endpoint legacy `/api/operations/center`, `/api/operations/inbox` e `/api/dashboard` sono stati rimossi insieme ai relativi filtri e payload orfani; `/dashboard` compone il nuovo read model server-side. `POST /api/search` applica query 2-120 caratteri, massimo 8 termini, timeout due secondi e ranking deterministico sui soli metadati. Le route share proposal applicano preparazione, review e conferma con fingerprint.

La Panoramica mostra soltanto interventi umani autorizzati, deduplicati per processo e artifact, e risultati significativi da eventi operativi system-generated; non mostra processi normalmente in corso. Il dettaglio espone step, timeline, artifact e sole azioni consentite. Documenti, lavoratori, cantieri e pacchetti mostrano l'ultimo stato operativo collegato. Le mutazioni principali restano nelle `Azioni rapide` della sidebar.

## Specifiche non implementate

Nessun OCR, provider IA, analisi di file, ricerca nei file/semantica, query salvata, template inventato, nuovo canale, annullamento, undo, condivisione automatica o deduzione normativa e attivo. La foundation provider-neutral e spenta e non simula queste capacita.

## Decisioni aperte e hard stop

Restano aperti OCR/AI, retention, ricerca nei file o semantica, viste salvate e cronologia, nuovi canali, compensazioni/undo, SLA e limiti commerciali. Cancellazione e undo non sono esposti finche la policy resta aperta.
