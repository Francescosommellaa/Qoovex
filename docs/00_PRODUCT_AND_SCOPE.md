# Product and scope

## Identita e promessa prudente

Qoovex e il sistema operativo exception-driven per documenti, scadenze e prove di cantiere di piccole imprese, subappaltatori, artigiani e consulenti. Prende in carico obiettivi operativi, organizza informazioni, esegue gli step deterministici e reversibili consentiti e presenta alle persone eccezioni, decisioni e risultati.

Qoovex non garantisce conformita, non certifica persone, documenti o cantieri e non sostituisce consulenti, RSPP, tecnici, geometri, responsabili, professionisti sanitari o valutazioni legali. Il linguaggio ammesso descrive stato documentale, elementi presenti, mancanti, scaduti o da verificare, regole configurate o validate e pacchetti pronti per revisione.

## Stato attuale verificato

Il prodotto implementato possiede un dominio operativo protetto: Aziende, lavoratori, cantieri, documenti e versioni private, tipi e requisiti configurabili, scadenze, calendario, checklist, prove, pacchetti, condivisioni controllate, notifiche, audit, supporto e data-control.

La dashboard `Da fare` aggrega situazioni operative e prossime azioni, ma molte azioni aprono ancora flussi e viste di dominio separati. Non esistono ancora un motore persistente di processi, un ingresso o una ricerca universali, una timeline operativa distinta dall'audit, OCR o AI documentale.

La gerarchia documentale implementata resta `Macroarea -> Categoria -> Tipo documento -> Documento -> Versioni`. Le macroaree sono Azienda, Lavoratori e Cantieri; le categorie sono un vocabolario organizzativo, non un catalogo normativo. I record legacy non classificati restano `Da classificare` senza inferenze dal nome.

## Direzione approvata

- Il lavoro quotidiano dell'utente coincide principalmente con eccezioni e decisioni.
- Il dominio rimane ricco, ma documenti, lavoratori, cantieri, scadenze, checklist, prove e pacchetti diventano fonti, output e dettaglio dei processi.
- `Da fare` evolve nel centro operativo per decisioni richieste, processi in corso, blocchi e risultati.
- Un ingresso universale sostituisce progressivamente le azioni rapide CRUD e chiede soltanto i dati minimi.
- Regole aziendali validate e versionate vengono applicate automaticamente senza dedurre obblighi normativi.
- Stati, scadenze, promemoria, checklist e pacchetti sono derivati o riconciliati quando dati, affidabilita, impatto e policy lo consentono.
- Condivisioni esterne, azioni sensibili e correzioni di dati confermati restano decisioni esplicite di un attore autorizzato.
- Il successo si misura attraverso il lavoro manuale evitato, non tramite il numero di feature o record usati.

## Specifiche concettuali non implementate

La direzione include processi persistenti, spiegabili, idempotenti e riprendibili, con eventi, step, proposte, decisioni, eccezioni, riferimenti agli artefatti e timeline. Include quattro blueprint target: documento ricevuto, nuovo lavoratore, nuovo cantiere e controllo continuo.

Questi concetti non sono schema, API o funzionalita attive. OCR e AI potranno essere soltanto fonti fallibili dietro provider approvati; non definiscono regole e non decidono la norma.

## Fuori scope

Restano fuori ERP, contabilita, paghe, preventivi, firma qualificata, geolocalizzazione o sorveglianza continua, conformita automatica, certificazioni, deduzioni normative, integrazioni pubbliche non approvate e valutazioni automatiche di qualifiche professionali.

## Decisioni aperte e hard stop

Prima della futura implementazione devono essere approvati nomi e struttura delle entita processo, schema e migration, versionamento delle regole, criteri di affidabilita, reversibilita e annullamento, runner e frequenze, canali di ingresso, provider OCR/AI, trattamento dei documenti sensibili, retention, indicizzazione, condivisione, export, notifiche aggiuntive, compensazioni, livelli di servizio, limiti commerciali e ruoli autorizzati per ciascuna decisione.
