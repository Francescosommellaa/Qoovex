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

## API e UI attive

Sono attive le route `/api/operations/center`, `/inbox`, `/processes`, timeline processo/artifact cursor-based, risoluzione decisioni/eccezioni, retry step e runner protetto. `POST /api/search` applica query 2-120 caratteri, massimo 8 termini, timeout due secondi e ranking deterministico sui soli metadati. Le route share proposal applicano preparazione, review e conferma con fingerprint.

Il Centro operativo mostra decisioni, eccezioni, processi attivi e risultati; il dettaglio espone step, timeline, artifact e sole azioni consentite. Documenti, lavoratori, cantieri e pacchetti mostrano l'ultimo stato operativo collegato. L'ingresso universale compone i flussi esistenti.

## Specifiche non implementate

Nessun OCR, AI, ricerca nei file/semantica, query salvata, template inventato, nuovo canale, annullamento, undo, condivisione automatica o deduzione normativa e attivo.

## Decisioni aperte e hard stop

Restano aperti OCR/AI, retention, ricerca nei file o semantica, viste salvate e cronologia, nuovi canali, compensazioni/undo, SLA e limiti commerciali. Cancellazione e undo non sono esposti finche la policy resta aperta.
