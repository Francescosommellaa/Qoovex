# 04 — Runtime and features

## Lifecycle JobSite

`DRAFT → WAITING_FOR_CLIENT → PENDING_INITIAL_CONFIRMATION → ACTIVE → CLOSURE_PROPOSED → CLOSED → ARCHIVED`.

Il cliente accetta un invito job-site-scoped e resta pending. Solo la conferma della versione corrente del riepilogo iniziale attiva il cantiere. `CLOSED` e `ARCHIVED` sono read-only salvo post-chiusura, riapertura ed export. L’archiviazione è ammessa soltanto da `CLOSED`.

## Timeline, step e richieste

Timeline interna e condivisa sono proiezioni della stessa storia canonica con audience. Gli step sono opzionali; senza step non viene inventata una percentuale. Stati step: `NOT_STARTED`, `IN_PROGRESS`, `WAITING`, `READY_FOR_REVIEW`, `CHANGES_REQUESTED`, `WORK_COMPLETED`, `CONFIRMED`, `CANCELLED`. La conferma cliente non equivale a collaudo.

Le richieste strutturate e i thread post-chiusura sono append-only. La ricerca è metadata-only e limitata al JobSite autorizzato; non indicizza il contenuto dei file e non usa ricerca semantica.

## Proposte

Proposte e controproposte creano versioni immutabili. Lifecycle: `DRAFT`, `PROPOSED`, `COUNTERED`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`, `SUPERSEDED`, `EXPIRED`. Consenso e effect sono legati alla versione precisa; expected revision/current version rifiutano input stale. Accettare registra quanto mostrato, non costituisce firma qualificata o approvazione tecnica.

## Pagamenti documentati

`DRAFT → REQUESTED → TRANSFER_DECLARED → UNDER_REVIEW → CONFIRMED | DISPUTED | CANCELLED`. Qoovex non movimenta denaro. Il cliente dichiara l’intero importo della richiesta e può collegare una ricevuta; l’Azienda registra l’esito. Pagamenti parziali richiedono record separati.

## Dispute, chiusura e riapertura

Le dispute producono preservation e possono concludersi con accordo, ritiro o chiusura senza accordo; Qoovex non arbitra. La chiusura richiede precondizioni senza elementi aperti, snapshot fingerprinted, conferma cliente e conferma Azienda. Non esiste chiusura unilaterale automatica.

Una richiesta post-chiusura non riscrive la timeline precedente e non riapre automaticamente. La riapertura richiede consensi reciproci sulla proposta corrente.

## Receipt e concorrenza

Le action critiche sono versionate `@1`, richiedono `Idempotency-Key` ed `expectedRevision`. Il receipt è unico per organizzazione/action/key; replay identico restituisce lo stesso risultato, riuso con fingerprint diverso restituisce 409.
