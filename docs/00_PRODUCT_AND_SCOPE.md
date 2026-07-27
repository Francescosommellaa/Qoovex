# Product and scope

## Identita e promessa prudente

Qoovex e il sistema operativo exception-driven per documenti, scadenze e prove di cantiere di piccole imprese, subappaltatori, artigiani e consulenti. Organizza informazioni operative, esegue verifiche deterministiche consentite e presenta eccezioni, decisioni e risultati agli attori autorizzati.

Qoovex non garantisce conformita, non certifica persone, documenti o cantieri e non sostituisce valutazioni professionali, tecniche, sanitarie o legali. Le regole configurate descrivono aspettative aziendali, non obblighi normativi.

## Stato attuale verificato

Il Workspace implementa il dominio protetto di Aziende, lavoratori, cantieri, documenti/versioni private, requisiti, scadenze, calendario, checklist, prove, pacchetti, condivisioni, notifiche, audit, supporto e data-control.

La Fase 3 aggiunge un motore operativo persistente con quattro definizioni versionate: `DOCUMENT_RECEIVED@1`, `WORKER_CREATED@1`, `JOB_SITE_CREATED@1` e `CONTINUOUS_CONTROL@1`. Creazione e aggiornamento di documenti, versioni, lavoratori e cantieri accodano il processo nella stessa transazione della mutazione dominio. Il runner usa claim atomico, lease, fencing, retry limitato e riconciliazione.

`/dashboard` e ora il Centro operativo; `/operations/[processId]` mostra step, timeline utente, decisioni, eccezioni e riferimenti autorizzati. La shell espone Centro operativo, Documenti, Lavoratori, Cantieri, Pacchetti quando autorizzato e Impostazioni. L'ingresso universale instrada verso i flussi controllati esistenti senza endpoint generico.

## Direzione approvata

- Il lavoro quotidiano dell'utente coincide principalmente con eccezioni e decisioni.
- Il dominio rimane ricco e continua a essere fonte, output e controllo avanzato dei processi.
- Solo azioni `LOW`, deterministiche, reversibili, autorizzate e con affidabilita `VERIFIED/HIGH` possono essere automatiche.
- Condivisioni, ampliamenti di accesso, azioni sensibili/irreversibili e valutazioni legali restano esplicite o vietate.
- Timeline operativa e `ProductAuditEvent` restano separati.
- Il successo si misura attraverso lavoro manuale evitato e condizioni risolte, non tramite il numero di record.

## Specifiche non implementate

Non sono implementati OCR, AI documentale, ricerca universale, editor visuale di processi, nuovi canali di ingresso o notifica, nuove policy di condivisione, annullamento/undo, retention automatica dedicata o nuovi ruoli/permessi.

I nomi concettuali delle Fasi 1-2 restano storia decisionale; i contratti implementati usano i nomi `Operational*` descritti dal codice e dallo schema.

## Decisioni aperte e hard stop

Restano aperti provider e policy OCR/AI, retention di processi/eventi, ricerca e indicizzazione, nuovi canali, annullamento/compensazioni, trattamento ulteriore dei documenti sensibili, SLA/monitoraggio e limiti commerciali. Qualunque deploy o migration fuori dal database locale richiede verifica e autorizzazione separate.
