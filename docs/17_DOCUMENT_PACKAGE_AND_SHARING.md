# Document Package And Sharing

Data: 2026-06-30.

## Obiettivo

Definire il pacchetto documentale condivisibile in modo controllato, revocabile e prudente.

Un pacchetto documentale puo essere pronto per revisione. Non significa conforme, certificato o legalmente valido.

## Struttura pacchetto

`DocumentPackage` rappresenta una raccolta ordinata di elementi selezionati.

Stati:

- `DRAFT`: in preparazione.
- `READY_FOR_REVIEW`: pronto per revisione.
- `SHARED`: condiviso in lettura.
- `ARCHIVED`: archiviato.

Campi minimi:

- titolo;
- descrizione opzionale;
- cantiere opzionale;
- stato;
- autore;
- date di creazione, aggiornamento e archiviazione.

## Cosa puo contenere

`DocumentPackageItem` puo includere:

- documento logico;
- versione documento;
- prova di cantiere;
- checklist;
- nota testuale.

Ogni elemento deve essere selezionato o generato da configurazione esplicita. Non includere automaticamente documenti sensibili senza consenso operativo.

## Accesso viewer

`VIEWER` puo leggere solo il pacchetto condiviso e gli elementi inclusi.

Il viewer non deve ottenere:

- `documents:read` globale;
- accesso a tutta l'organizzazione;
- accesso a lavoratori non inclusi;
- accesso a cantieri non inclusi;
- URL Blob permanenti.

## ShareLink

`ShareLink` rappresenta un link sicuro e revocabile.

Regole:

- salvare solo `tokenHash`;
- non salvare token in chiaro;
- consentire `expiresAt`;
- consentire `revokedAt`;
- registrare `lastAccessedAt` se utile;
- filtrare sempre per `organizationId` e `documentPackageId`.

## Revoca

La revoca imposta `revokedAt`.

Dopo revoca:

- il link non deve mostrare contenuti;
- gli accessi devono fallire con risposta generica;
- non rivelare se il pacchetto esiste.

## Scadenza link

`expiresAt` e opzionale nel modello, ma consigliata in prodotto.

Se manca una decisione dal proprietario, usare default prudente e configurabile in fase API futura. Non inventare policy legali.

## Dati da minimizzare

In un pacchetto condiviso includere solo:

- titolo documento;
- stato operativo;
- scadenza registrata se utile;
- file o versione selezionata;
- note necessarie alla revisione;
- prove selezionate.

Evitare dati non necessari:

- dati personali non collegati al pacchetto;
- documenti lavoratore non richiesti dalla condivisione;
- note interne;
- audit log interno;
- token, URL privati o dettagli di sicurezza.

## Cosa non includere automaticamente

- Tutti i documenti di un lavoratore.
- Tutti i documenti di una azienda.
- Tutte le prove di un cantiere.
- Documenti archiviati.
- File non selezionati.
- Dati sanitari o altamente sensibili non necessari.

## Rischi privacy

- Link inoltrato a destinatari non previsti.
- Pacchetto con dati personali superflui.
- URL Blob permanente esposto.
- Revoca non applicata a tutti gli accessi.
- Viewer con permessi troppo ampi.

## Copy prudente

Usare:

- "Pacchetto pronto per revisione".
- "Condiviso in lettura".
- "Link revocato".
- "Link scaduto".
- "Elementi inclusi nel pacchetto".

Non usare:

- "Pacchetto conforme".
- "Documenti certificati".
- "Validita legale garantita".
- "Revisione completata automaticamente".

## Punti da validare

- Durata default dei link.
- Se il viewer deve essere autenticato o solo tokenizzato.
- Se registrare email o identificativo destinatario.
- Quali sezioni mostrare nel pacchetto.
- Quali metadati nascondere sempre.
