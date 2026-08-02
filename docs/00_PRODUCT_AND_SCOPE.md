# Product and scope

## Identita e promessa prudente

Qoovex e il sistema operativo exception-driven per documenti, scadenze e prove di cantiere di piccole imprese, subappaltatori, artigiani e consulenti. Organizza informazioni operative, esegue verifiche deterministiche consentite e presenta eccezioni, decisioni e risultati agli attori autorizzati.

Qoovex non garantisce conformita, non certifica persone, documenti o cantieri e non sostituisce valutazioni professionali, tecniche, sanitarie o legali. Le regole configurate descrivono aspettative aziendali, non obblighi normativi.

## Stato attuale verificato

Il Workspace implementa il dominio protetto di Aziende, lavoratori, cantieri, documenti/versioni private, requisiti, scadenze, calendario, checklist, prove, pacchetti, condivisioni, notifiche, audit, supporto e data-control.

Le Fasi 3-4 implementano un motore operativo persistente con cinque definizioni versionate: `DOCUMENT_RECEIVED@1`, `WORKER_CREATED@1`, `JOB_SITE_CREATED@1`, `CONTINUOUS_CONTROL@1` e `DOCUMENT_PACKAGE_SHARING@1`. Il runner usa claim atomico, lease, fencing, retry limitato e riconciliazione.

`/dashboard` e la Panoramica exception-driven: comunica lo stato sintetico, mostra soltanto decisioni/eccezioni/review che una persona autorizzata deve completare e presenta al massimo cinque risultati significativi prodotti dal motore. I vecchi KPI, filtri `?view=` e processi normalmente in corso sono rimossi. `/operations/[processId]` resta il controllo avanzato con step, timeline utente, decisioni, eccezioni e riferimenti autorizzati. La shell espone destinazioni autorizzate, una ricerca metadata-only in modale separato e la card `Azioni rapide` per le mutazioni manuali principali. Non esiste una pagina `/search`. `/document-packages` prepara una revisione immutabile, richiede review e crea il link soltanto dopo conferma umana.

## Direzione approvata

- Il lavoro quotidiano dell'utente coincide principalmente con eccezioni e decisioni.
- Il dominio rimane ricco e continua a essere fonte, output e controllo avanzato dei processi.
- Solo azioni `LOW`, deterministiche, reversibili, autorizzate e con affidabilita `VERIFIED/HIGH` possono essere automatiche.
- Condivisioni, ampliamenti di accesso, azioni sensibili/irreversibili e valutazioni legali restano esplicite o vietate.
- Timeline operativa e `ProductAuditEvent` restano separati.
- Il successo si misura attraverso lavoro manuale evitato e condizioni risolte, non tramite il numero di record.

## Specifiche non implementate

Non sono implementati OCR, AI documentale, ricerca nei file o semantica, viste salvate o cronologia query, editor visuale di processi, nuovi canali di ingresso/notifica, condivisione automatica, annullamento/undo o retention automatica dedicata.

I nomi concettuali delle Fasi 1-2 restano storia decisionale; i contratti implementati usano i nomi `Operational*` descritti dal codice e dallo schema.

## Decisioni aperte e hard stop

Restano aperti provider e policy OCR/AI, retention di processi/eventi, ricerca nei file/semantica, privacy di viste salvate e cronologia, nuovi canali, annullamento/compensazioni, trattamento ulteriore dei documenti sensibili, SLA/monitoraggio e limiti commerciali. Qualunque deploy o migration fuori dal database locale richiede verifica e autorizzazione separate.
