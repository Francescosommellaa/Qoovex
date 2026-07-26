# Runtime and active features

## Stato attuale verificato

Workspace espone auth credentials e OAuth opzionale, MFA TOTP con backup code, recupero auditato, inviti, supporto, dashboard e Console Qoovex. Azienda, ruolo, permessi e resource scope derivano sempre dal server.

Il runtime attivo comprende:

- documenti, versioni private, tassonomia, sensibilita e requisiti configurabili;
- lavoratori, cantieri, fasi e assegnazioni;
- scadenze e calendario con import/export iCalendar locale;
- checklist, prove, pacchetti, share link revocabili e viewer esterno;
- notifiche interne, reminder, preferenze e digest email;
- ProductAuditEvent, inventario, export, retention, data-control e supporto.

`Da fare` e una coda situation-centric: ordina elementi mancanti, scaduti, in scadenza o da verificare e mostra motivo, conseguenza, contesto, responsabilita e prossima azione. Non e ancora alimentata da processi persistenti. La navigazione contiene viste di dominio, Preferiti e Azioni rapide; Ricerca e Analisi sono affordance disabilitate e non capability attive.

I flussi attuali restano validi e protetti, ma sono ancora in parte CRUD: caricamento e classificazione documenti, creazione lavoratori/cantieri, scadenze, checklist, prove e composizione pacchetti richiedono coordinamento umano. Nessun servizio OCR/AI o ingresso universale e implementato.

## Direzione approvata: modello operativo

Ogni obiettivo operativo futuro segue:

1. **Ricezione** di un evento utente, dominio, temporale, decisionale o tecnico.
2. **Blocco del contesto** di Azienda, attore, ruolo, scope, sensibilita e permessi.
3. **Normalizzazione e deduplica** di evento, risorsa, processo e step.
4. **Risoluzione delle regole** validate e versionate applicabili.
5. **Produzione del piano** con input, fonte, affidabilita, impatto, reversibilita, permesso e completamento.
6. **Esecuzione automatica** degli step ammessi.
7. **Apertura delle eccezioni** quando servono giudizio, input o autorizzazione.
8. **Riconciliazione** dopo eventi o decisioni, senza output duplicati.
9. **Chiusura** quando output, eccezioni e azioni future sono coerenti.

## Specifiche concettuali non implementate

I nomi provvisori sono `Process Definition`, `Process Run`, `Process Step`, `Process Event`, `Proposal`, `Decision`, `Exception` e `Artifact Reference`. Non esistono oggi come schema, tipi, API o UI.

Stati concettuali di processo: `RECEIVED`, `RUNNING`, `WAITING`, `RETRY_SCHEDULED`, `BLOCKED`, `COMPLETED`, `FAILED`, `CANCELLED`. Motivi di attesa: `INPUT_REQUIRED`, `CONFIRMATION_REQUIRED`, `APPROVAL_REQUIRED`, `EXTERNAL_RESPONSE_REQUIRED`. Gli stati dello step restano `PENDING`, `RUNNING`, `WAITING`, `COMPLETED`, `SKIPPED`, `FAILED`.

Eventi concettuali:

- ingresso: file, foto, nota, lavoratore, cantiere, richiesta di condivisione, import;
- dominio: documento/versione, requisito, assegnazione, checklist, prova, pacchetto/link, fase;
- tempo: finestra di attenzione, scadenza, reminder, link, processo fermo, rivalutazione;
- decisione: conferma, correzione, rifiuto, override, condivisione, annullamento;
- tecnica: step, retry, riconciliazione, supersessione, fallimento.

## Affidabilita e impatto

Non esistono soglie numeriche approvate.

| Affidabilita | Significato |
|---|---|
| `VERIFIED` | contesto bloccato, relazione confermata o regola validata |
| `HIGH` | conclusione dominante ma fallibile |
| `MEDIUM` | piu alternative plausibili |
| `LOW` | dati insufficienti |
| `CONFLICT` | fonti affidabili incompatibili |

| Impatto | Esempi |
|---|---|
| `LOW` | titolo, vista derivata, deduplica |
| `CONTROLLED` | collegamento, data proposta, pacchetto interno |
| `SENSITIVE` | invito, assegnazione, documento riservato, condivisione |
| `IRREVERSIBLE` | eliminazione definitiva, cancellazione Azienda, cleanup critico |

| Affidabilita / impatto | LOW | CONTROLLED | SENSITIVE | IRREVERSIBLE |
|---|---|---|---|---|
| VERIFIED | automatico | automatico se reversibile e approvato | conferma autorizzata | conferma forte |
| HIGH | automatico con timeline | conferma predefinita | conferma autorizzata | conferma forte |
| MEDIUM | conferma | conferma | blocco fino ad approvazione | blocco |
| LOW | input | input | blocco | blocco |
| CONFLICT | blocco | blocco | blocco | blocco |

Affidabilita alta non rende automatica un'azione sensibile o irreversibile.

## Policy di automazione

Automatiche per principio, quando supportate da dati e policy valide:

- derivazione degli stati temporali;
- situazioni mancanti da requisiti validati;
- eredita del contesto;
- titoli operativi modificabili;
- deduplica di eventi e notifiche;
- viste derivate e versione corrente deterministica;
- promemoria secondo policy approvata;
- aggiornamento di pacchetti interni non condivisi;
- chiusura di eccezioni soddisfatte;
- timeline e audit consentiti.

Richiedono conferma:

- classificazioni fallibili e date estratte;
- associazioni non ereditate dal contesto;
- sostituzioni non deterministiche;
- applicazione retroattiva di modelli;
- inviti e assegnazioni;
- esclusione di elementi richiesti;
- condivisioni esterne;
- correzione di dati confermati.

Non sono automatiche senza una futura decisione esplicita:

- dichiarazioni di conformita, deduzioni normative o certificazioni;
- modifica dei ruoli o ampliamento dello scope;
- condivisione esterna di dati riservati;
- trattamento sensibile con provider non approvati;
- eliminazione definitiva, cancellazione Azienda o cleanup Blob;
- modifica silenziosa dello storico;
- sorveglianza o geolocalizzazione continua.

## Eccezioni, timeline e retry

Un'eccezione persistente descrive problema, motivo, conseguenza, fonti, attore autorizzato, azione primaria e condizione di ripresa. Le categorie concettuali includono input mancante, match ambiguo, fonti in conflitto, regola assente, permesso richiesto, contenuto sensibile, duplicato sospetto, failure tecnica, risposta esterna e failure terminale.

Una notifica porta l'eccezione all'attenzione; leggerla o chiuderla non risolve l'eccezione. La timeline spiega avvio, regole, step, proposte, decisioni, retry, output e risultato; ProductAuditEvent resta separato e tecnico.

Gli errori tecnici transitori usano claim atomico, fencing, tentativi limitati e backoff. Gli errori di business attendono un nuovo evento o una decisione. Il completamento parziale mostra output salvati, step mancanti, retry sicuri e possibili compensazioni.

## Blueprint target

### Documento ricevuto

Input minimo: file, attore e contesto ereditato. Il processo valida file, deduplica, propone destinazione/tipo/titolo/date, riconcilia versione, requisiti, scadenze e pacchetti e apre soltanto le eccezioni residue. Classificazione fallibile, data estratta, sostituzione e sensibilita richiedono conferma.

### Nuovo lavoratore

Input minimo: nome, cognome ed eventuali mansione/contatto. Il processo controlla duplicati, applica il modello validato, identifica mancanti e propone cantieri e invito. Duplicati plausibili, assegnazioni, accesso e documenti ambigui richiedono conferma.

### Nuovo cantiere

Input minimo: identita operativa, fase dichiarata o confermata ed eventuali dati di contesto. Il processo applica un modello validato, predispone aspettative, checklist, attivita e pacchetto interno e propone persone. Modello, fase, date, persone, eccezioni e condivisione richiedono conferma quando non deterministici.

### Controllo continuo

Il sistema rivaluta su evento o frequenza approvata requisiti, date, processi fermi, pacchetti, link, assegnazioni e regole. Riconcilia tramite chiavi idempotenti senza ricreare processi o notifiche equivalenti. Runner e frequenze non sono decisi.

## Centro operativo futuro

La UI primaria mostrera decisioni richieste, processi in corso o in retry, processi bloccati/falliti e risultati recenti. Non simulera percentuali senza pesi reali. Il valore mostrato sara il lavoro evitato, non il numero di record creati.

## Decisioni aperte e hard stop

Restano aperti naming e schema, regole versionate, autorizzazioni decisionali, soglie, reversibilita, annullamento, runner/frequenze, canali di ingresso, provider, sensibilita, retention, ricerca, condivisione, export, notifiche, modifiche regole sui run aperti, compensazioni, livelli di servizio e limiti commerciali.
