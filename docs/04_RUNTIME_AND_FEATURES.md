# Runtime and active features

## `verified_current_state`

Il Workspace mantiene auth/MFA, inviti Azienda, documenti/versioni, scadenze, checklist, prove, pacchetti/share link, richieste, messaggi `INTERNAL`, timeline contestuale, notifiche, audit e data-control. Il cantiere corrente usa `DRAFT -> PREPARATION -> IN_PROGRESS <-> PAUSED -> CLOSING -> COMPLETED`; l'override Owner e l'archiviazione correnti non implementano chiusura reciproca o archive-only-after-closure.

Il motore esegue le cinque definizioni `@1` correnti con claim, lease, fencing, retry e receipt. Nessun record corrente e una proposta commerciale, una richiesta di pagamento, una partecipazione cliente o una chiusura vNext.

## `approved_product_direction`

### Attivazione e partecipazione

```text
Azienda crea il cantiere
-> invita Collaborator
-> invita il cliente
-> il cliente accede o crea un account
-> accetta la partecipazione
-> conferma il riepilogo iniziale
-> il cantiere vNext diventa ACTIVE
```

Il riepilogo iniziale e uno snapshot versionato dei dati condivisi. Nessuna partecipazione cliente diventa `ACTIVE` senza la conferma prevista da D-VNEXT-05.

Matrice transizioni invito cliente D-VNEXT-24:

| Stato | Azioni valide | Stato successivo | Fallimenti obbligatori |
| --- | --- | --- | --- |
| `PENDING` | accetta con token one-time e email verificata | `ACCEPTED` | scaduto, revocato, superseded, email diversa, replay |
| `PENDING` | revoca Owner/responsabile autorizzato | `REVOKED` | gia consumato o non nello stesso cantiere |
| `PENDING` | scadenza a 14 giorni | `EXPIRED` | nessuna estensione silenziosa |
| `PENDING` | nuovo invito per stesso slot | `SUPERSEDED` | token precedente subito inutilizzabile |
| `ACCEPTED` | crea/collega partecipante | terminale invito | non crea membership; idempotenza obbligatoria |
| `REVOKED`, `EXPIRED`, `SUPERSEDED` | nessuna accettazione | terminale | nuovo accesso richiede nuovo invito |

Dopo l'attivazione il cliente non viene rimosso silenziosamente: sospensione, fine o revoca della partecipazione sono eventi documentati e non eliminano la storia.

### Step opzionali

In vNext non esistono fasi prodotto separate. Un cantiere puo non avere step; quando esistono, avanzamento e dipendenze derivano dagli step. Uno step contiene concettualmente titolo, descrizione, risultato atteso, ordine, stato, data indicativa, conclusione stimata, eventuale valore economico, Collaborator/ruoli, dipendenze, prove, modifiche e pagamenti collegati. Stati concettuali: `NOT_STARTED`, `IN_PROGRESS`, `WAITING`, `READY_FOR_REVIEW`, `CHANGES_REQUESTED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`. La conferma cliente non e collaudo, conformita o certificazione. Senza step non si mostra una percentuale artificiale e Qoovex non predice la fine del lavoro.

### D-VNEXT-27 - proposte e negoziazione

Concetti futuri: `JobSiteChangeProposal`, `JobSiteChangeProposalVersion`, `JobSiteChangeAcceptance`. L'aggregate negoziazione e separato dalle versioni immutabili e conserva una sola versione corrente. Ogni comando usa `expectedCurrentVersion`; un conflitto non sovrascrive il lavoro concorrente. Conseguenze economiche: `NO_PRICE_CHANGE`, `FIXED_DELTA`, `BOUNDED_RANGE`; un range contiene minimo e massimo. Un costo indefinito non e accettabile come versione finale.

Ogni versione espone almeno: cosa cambia, motivazione, step interessati, prezzo precedente, variazione o intervallo economico, impatto sui tempi, nuova conclusione stimata, Collaborator/ruoli coinvolti, dipendenze, allegati, condizioni, prove richieste, autore, parte rappresentata e data. Puo aggiungere, modificare o rimuovere step e cambiare risultato atteso, materiali, prezzo, tempi, persone o condizioni senza riscrivere la versione precedente.

| Stato | Operazioni ammesse | Transizione | Invarianti/fallimenti |
| --- | --- | --- | --- |
| `DRAFT` | modifica autore autorizzato, propone, ritira | `PROPOSED`, `WITHDRAWN` | nessun effetto; grant valido all'invio |
| `PROPOSED` | contropropone, accetta, rifiuta, ritira, scade | `COUNTERED`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`, `EXPIRED` | solo versione corrente; la parte proponente e implicitamente favorevole |
| `COUNTERED` | nuova revisione e invio, accetta, rifiuta, ritira, scade | `PROPOSED`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`, `EXPIRED` | la controproposta supersede la versione precedente |
| `ACCEPTED` | sola lettura; nuova modifica separata | terminale | snapshot/fingerprint e conseguenze immutabili; effect receipt idempotente |
| `REJECTED`, `WITHDRAWN`, `SUPERSEDED`, `EXPIRED` | sola lettura | terminale | nessun effetto operativo/economico |

L'accettazione registra versione, fingerprint, autore, parte rappresentata, capability rivalidata, conseguenze economiche/temporali/operative, persone, condizioni e timestamp. `expiresAt` e opzionale e non esiste scadenza predefinita. Errori: versione stale `409`, parte errata `403`, grant revocato `403`, conseguenza incompleta `409`, doppia accettazione idempotente se identica e conflitto se differente.

| Concorrenza proposta | Esito richiesto |
| --- | --- |
| due revisioni sulla stessa `expectedCurrentVersion` | una sola vince; l'altra riceve conflitto e ricarica la versione corrente |
| accettazione mentre arriva una controproposta | vale soltanto l'operazione che blocca per prima la versione corrente; nessuna accettazione stale |
| doppia accettazione identica della stessa parte/versione | risposta idempotente, un solo receipt |
| accettazioni differenti o parte errata | conflitto/forbidden senza effetto |
| revoca grant tra preview e conferma | conferma negata dopo rivalidazione |

### Pagamenti documentati

Qoovex non incassa, custodisce, trasferisce, trattiene, rimborsa, arbitra o garantisce denaro.

| Stato | Attore/azione | Stato successivo | Invarianti |
| --- | --- | --- | --- |
| `DRAFT` | Azienda autorizzata prepara/annulla | `REQUESTED`, `CANCELLED` | IBAN snapshot e importo completo |
| `REQUESTED` | cliente dichiara invio; Azienda annulla | `TRANSFER_DECLARED`, `CANCELLED` | richiesta immutabile dopo invio |
| `TRANSFER_DECLARED` | cliente allega/rivede dichiarazione; Azienda prende in esame | `UNDER_REVIEW`, `DISPUTED` | dichiarazione non prova accredito |
| `UNDER_REVIEW` | Azienda conferma o contesta | `CONFIRMED`, `DISPUTED` | capability rivalidata; receipt idempotente |
| `DISPUTED` | thread disputa o accordo separato | resta o nuova richiesta | Qoovex non arbitra |
| `CONFIRMED`, `CANCELLED` | sola lettura | terminale | correzioni tramite nuovo record |

I pagamenti parziali usano richieste separate. Una richiesta include importo, motivazione, step/proposte, prove, payment-profile snapshot, causale, data, termine e allegati; la dichiarazione cliente include data, importo, metodo, riferimento, ricevuta e nota.

### D-VNEXT-30 - notifiche

Le notifiche usano dedupe key, destinatario user-scoped, deep link autenticato e copy minimizzata. Nessuna email contiene file, ricevute, IBAN completo o dati sensibili nel subject. Preferenze disabilitano solo eventi non critici.

| Evento | Destinatari | Canale/frequenza | Disabilitabile |
| --- | --- | --- | --- |
| invito cliente, scadenza/supersede | cliente; Azienda per esito | immediata in-app/email minimizzata | no per sicurezza/accesso |
| conferma iniziale richiesta/completata | cliente; responsabile | immediata | no |
| proposta/controproposta/accettazione/rifiuto/ritiro/scadenza | controparte e delegati necessari | immediata | no per azioni pendenti/economiche |
| richiesta pagamento, invio dichiarato, ricevuta mancante, conferma, disputa | parti economiche autorizzate | immediata | no |
| chiusura, post-chiusura, sospensione/revoca accesso | parti coinvolte | immediata | no |
| export pronto/scaduto | richiedente | immediata | no |
| modifica payment profile | Owner e destinatari di sicurezza definiti | immediata, senza IBAN completo | no |
| aggiornamento lavoro/foto/commento non urgente/progresso step | partecipanti autorizzati | digest | si |

### D-VNEXT-37 - dispute

Scope concettuali: step, proposta, pagamento, allegato, chiusura o attivita. Stati: `OPEN`, `IN_DISCUSSION`, `RESOLVED_BY_AGREEMENT`, `WITHDRAWN`, `CLOSED_WITHOUT_AGREEMENT`.

| Stato | Azioni | Stato successivo | Blocco |
| --- | --- | --- | --- |
| `OPEN` | entrambe le parti possono aprire e rispondere; preservation automatica | `IN_DISCUSSION`, `WITHDRAWN` | elemento collegato e chiusura se rilevante |
| `IN_DISCUSSION` | accordo reciproco, ritiro autore, chiusura senza accordo riconosciuta | `RESOLVED_BY_AGREEMENT`, `WITHDRAWN`, `CLOSED_WITHOUT_AGREEMENT` | minimo scope possibile; mai arbitrato Qoovex |
| `RESOLVED_BY_AGREEMENT` | sola lettura; conseguenze in proposta separata | terminale | richiede conferma delle parti |
| `WITHDRAWN` | sola lettura | terminale | solo autore; preservation termina secondo policy |
| `CLOSED_WITHOUT_AGREEMENT` | sola lettura | terminale | entrambe le parti riconoscono la chiusura del thread, non il merito |

Matrice blocchi: una disputa step blocca conferma/chiusura correlata; proposta blocca gli effetti della proposta; pagamento blocca la sua conferma e la chiusura; allegato blocca l'uso dell'allegato; chiusura blocca la chiusura; attivita blocca solo l'elemento quando isolabile.

### Chiusura e D-VNEXT-38 riapertura

| Stato chiusura | Azione | Stato successivo | Precondizioni |
| --- | --- | --- | --- |
| `OPEN` | Azienda propone | `CLOSURE_PROPOSED` | nessuno step, proposta, richiesta, pagamento, chiarimento o disputa bloccante aperti |
| `CLOSURE_PROPOSED` | cliente conferma o apre richiesta | `CLIENT_CONFIRMED` o ritorno a `OPEN` | riepilogo immutabile |
| `CLIENT_CONFIRMED` | Azienda conferma | `CLOSED` | capability e precondizioni rivalidate |
| `CLOSED` | sola lettura; richiesta post-chiusura | resta `CLOSED` | nessuna chiusura unilaterale o automatica |

La chiusura registra soltanto l'assenza, alla data indicata, di elementi aperti nello spazio condiviso. Non certifica assenza di difetti, conformita, collaudo, rinuncia o termine garanzie.

| Stato riapertura | Azione | Stato successivo | Invariante |
| --- | --- | --- | --- |
| `POST_CLOSURE_REQUESTED` | discussione | `IN_DISCUSSION`, `RESOLVED_WITHOUT_REOPEN` | timeline precedente immutata |
| `IN_DISCUSSION` | proposta di riapertura | `REOPEN_PROPOSED` | scope e motivo espliciti |
| `REOPEN_PROPOSED` | conferma reciproca o rifiuto | `REOPENED`, `RESOLVED_WITHOUT_REOPEN` | nessuna riapertura unilaterale |
| `REOPENED` | evento `REOPENED`, nuovo episodio, nuovi/reopened step tramite proposta | nuova chiusura futura | chiusura ed export precedenti restano storia |

### D-VNEXT-43 - processi ed effect receipt

| Processo corrente | Semantica corrente | Compatibilita vNext |
| --- | --- | --- |
| `DOCUMENT_RECEIVED@1` | riconcilia documento | invariato; eventuale disclosure usa nuovo processo |
| `WORKER_CREATED@1` | requisiti Worker | invariato e mai esposto al cliente |
| `JOB_SITE_CREATED@1` | requisiti del cantiere legacy | non equivale ad invito o conferma iniziale vNext |
| `CONTINUOUS_CONTROL@1` | controlli Azienda | invariato; non produce azioni cliente implicite |
| `DOCUMENT_PACKAGE_SHARING@1` | review e share link | invariato; share link non e partecipazione autenticata |

Processi futuri concettuali: `CLIENT_INVITATION`, `JOB_SITE_INITIAL_CONFIRMATION`, `CHANGE_NEGOTIATION`, `PAYMENT_REQUEST`, `JOB_SITE_CLOSURE`, `JOB_SITE_EXPORT`, `POST_CLOSURE_REQUEST`, `JOB_SITE_REOPENING`, tutti con versioni nuove. Il motore non concede accesso; authorization precede l'enqueue e ogni effetto economico usa policy, registry e receipt.

| Operazione futura | Effect receipt minimo | Chiave idempotente |
| --- | --- | --- |
| accettazione invito | partecipante creato/collegato | invito + versione |
| conferma iniziale | snapshot confermato | cantiere + summary version + parte |
| accettazione proposta | versione accettata + effetti applicati | proposta + versione + parte |
| richiesta pagamento inviata | richiesta + payment-profile version | richiesta + versione |
| ricezione pagamento confermata | conferma + attore | richiesta + dichiarazione version |
| chiusura confermata | closure snapshot | cantiere + closure version + parte |
| export generato | manifest/fingerprint | tipo export + closure/version |
| riapertura confermata | nuovo episodio | cantiere + reopen proposal version |

## `conceptual_not_implemented`

Tutti gli stati, processi, capability, receipt e matrici vNext sono concettuali. Non sono enum Prisma, DTO, route, notifiche, job o permission key attivi. I lifecycle correnti restano invariati.

## `hard_stop`

Nessuna capability vNext puo essere attivata prima della futura migration coordinata e dei gate descritti in `06` e `07`.
