# 33 - Email reminder e digest controllati

## Cosa e stato implementato

La fase aggiunge il primo livello di email manuali collegate alle notifiche interne:

- anteprima sicura del digest notifiche;
- invio manuale del digest all'utente autenticato corrente;
- invio manuale di una singola notifica all'utente autenticato corrente;
- rate limit persistente per ridurre invii ripetuti accidentali;
- integrazione UI nella pagina `/notifications`.

Le email sono solo un'estensione delle notifiche interne gia generate da dati registrati in Qoovex. Non introducono nuove regole, obblighi, scadenze o valutazioni.

## Provider email

Il workspace riusa il servizio email transazionale esistente in `apps/workspace/src/shared/server/transactional-email-service.ts`, basato su Resend.

Non sono stati installati provider o dipendenze nuove.

Variabili gia previste dal workspace:

- `RESEND_API_KEY`;
- `RESEND_FROM_EMAIL`;
- `RESEND_REPLY_TO_EMAIL`, opzionale;
- `AUTH_URL` o `NEXTAUTH_URL` per costruire link interni assoluti quando disponibili.

In ambienti non production, se Resend non e configurato, il servizio mantiene il comportamento dev gia esistente. In production la configurazione email e obbligatoria per l'invio reale.

## Route API

- `GET /api/notifications/email-digest/preview`: restituisce anteprima sicura del digest, senza inviare email.
- `POST /api/notifications/email-digest/send-to-me`: invia il digest alla email dell'utente autenticato corrente.
- `POST /api/notifications/[notificationId]/send-to-me`: invia una singola notifica alla email dell'utente autenticato corrente.

Il client non puo passare destinatari arbitrari. L'email viene letta lato server dal record utente.

## Service creati o aggiornati

- `notification-email-service.ts`: costruisce preview, invia digest, invia singola notifica, applica permessi e rate limit.
- `transactional-email-service.ts`: aggiunge template `notification-digest` e `notification-single`.

## Destinatari consentiti

Solo l'utente autenticato corrente, se ha email disponibile e verificata.

Non sono consentiti:

- invio a tutti i membri;
- invio a ruoli;
- invio a consulenti esterni;
- invio a viewer;
- invio a email libera inserita dal client.

## Contenuto email

Il digest contiene:

- subject prudente;
- numero notifiche non lette;
- massimo 10 notifiche principali;
- titolo, messaggio, severity e data delle notifiche;
- link interno a `/notifications`, se la base URL e configurabile;
- nota prudente.

La singola email contiene solo la notifica selezionata.

## Dati esclusi dalle email

Le email non includono:

- allegati;
- file, PDF o immagini;
- contenuto documenti;
- link download;
- URL Blob;
- `blobKey`;
- `tokenHash`;
- token raw;
- link viewer/share raw;
- destinatari arbitrari;
- dati personali non necessari.

## Permessi

Sono consentiti:

- `OWNER`;
- `ADMIN`;
- `SAFETY_CONSULTANT`.

Sono negati:

- `SITE_MANAGER`;
- `WORKER`;
- `VIEWER`.

La scelta segue la policy notifiche interne: finche mancano filtri per risorsa, i ruoli operativi non ricevono accesso largo.

## Rate limit e dedupe

Gli invii manuali usano `AuthRateLimit` esistente:

- massimo 1 digest ogni 10 minuti per utente e azienda;
- massimo 1 reminder singolo ogni 10 minuti per utente e azienda.

Le chiamate Resend usano anche una idempotency key per la finestra corrente, cosi un retry non produce invii duplicati.

## Delivery log

Non e stato aggiunto un modello persistente di delivery log.

Motivo:

- gli invii sono solo manuali e verso se stessi;
- il provider restituisce successo/fallimento;
- il rate limit persistente riduce invii accidentali;
- non viene salvato contenuto email completo.

Un delivery log minimale potra essere aggiunto quando verranno introdotti scheduling, preferenze o invii piu ampi.

## UI aggiornata

La pagina `/notifications` include il pannello “Riepilogo email” con:

- bottone “Anteprima riepilogo”;
- bottone “Invia riepilogo a me”;
- stato loading;
- messaggio errore;
- feedback dopo invio;
- nota che l'email non include file o link di download.

Ogni notifica puo inviare un promemoria manuale a se stessi.

## Cosa non e stato implementato

- invio automatico schedulato;
- invio massivo;
- invio a viewer esterni;
- WhatsApp, SMS o push native;
- cron provider esterni;
- preferenze avanzate;
- unsubscribe pubblico;
- marketing email;
- report PDF;
- allegati;
- link download o link share raw nelle email.

## Rischi aperti

- Senza delivery log persistente non esiste una vista amministrativa storica degli invii.
- La base URL delle email dipende da `AUTH_URL` o `NEXTAUTH_URL`.
- Le preferenze utente non sono ancora configurabili.

## Prossima fase consigliata

Implementare preferenze notifiche e scheduling protetto, con delivery log minimale e opt-in chiaro prima di qualsiasi invio ricorrente.
