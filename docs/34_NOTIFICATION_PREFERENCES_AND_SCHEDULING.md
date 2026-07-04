# 34 - Preferenze notifiche, delivery log e scheduling protetto

## Cosa e stato implementato

La fase aggiunge controllo esplicito sugli invii email delle notifiche:

- preferenze email per utente dentro una azienda;
- digest automatico opt-in, disattivato di default;
- delivery log minimale degli invii;
- endpoint schedulabile protetto da secret;
- UI minima in `/notifications` per preferenze e invii recenti.

Le email restano un riepilogo dei dati registrati in Qoovex. Non introducono obblighi, scadenze ufficiali o valutazioni legali.

## Modelli Prisma aggiunti

### `NotificationPreference`

Preferenze email per coppia `organizationId + userId`.

Campi principali:

- `emailDigestEnabled`;
- `emailDigestFrequency`;
- `emailDigestHour`;
- `lastDigestSentAt`.

Default sicuri:

- `emailDigestEnabled = false`;
- `emailDigestFrequency = OFF`;
- `emailDigestHour = 8`.

### `NotificationEmailDelivery`

Log minimo degli invii email.

Salva:

- azienda e utente;
- tipo invio;
- eventuale `notificationId`;
- email destinataria derivata server-side;
- numero notifiche;
- stato;
- eventuale id provider;
- errore generico;
- data invio.

Non salva:

- body completo email;
- token;
- `blobKey`;
- `tokenHash`;
- URL Blob;
- link download;
- allegati.

Enum aggiunti:

- `EmailDigestFrequency`: `OFF`, `DAILY`, `WEEKLY`;
- `NotificationEmailDeliveryType`: `DIGEST`, `SINGLE_NOTIFICATION`;
- `NotificationEmailDeliveryStatus`: `SENT`, `FAILED`, `SKIPPED`.

Migration creata:

- `20260706000000_notification_preferences_and_delivery_log`.

## Route API

- `GET /api/notifications/preferences`: legge o crea preferenze default dell'utente corrente.
- `PATCH /api/notifications/preferences`: aggiorna solo preferenze consentite dell'utente corrente.
- `GET /api/notifications/email-deliveries`: lista gli ultimi invii dell'utente corrente.
- `POST /api/reminders/email-digest/run`: esegue il job digest schedulato se il secret e valido.

## Scheduling protetto

La route di scheduling richiede header:

- `x-qoovex-cron-secret`

e variabile env:

- `QOOVEX_CRON_SECRET`

Se la variabile manca, se l'header manca o se il valore non corrisponde, la route rifiuta la richiesta con errore sicuro.

Questa fase non configura Vercel Cron o altri provider. La route e pronta per essere collegata a un job protetto in una fase successiva.

## Comportamento del job

Il job:

- considera solo preferenze abilitate con frequenza `DAILY` o `WEEKLY`;
- limita gli invii a `OWNER`, `ADMIN`, `SAFETY_CONSULTANT`;
- salta `SITE_MANAGER`, `WORKER`, `VIEWER`;
- richiede email utente disponibile e verificata;
- invia solo dopo l'ora digest configurata;
- rispetta `lastDigestSentAt` per evitare invii nella stessa finestra;
- usa solo notifiche interne non lette e non nascoste;
- salta utenti senza notifiche utili;
- aggiorna `lastDigestSentAt` solo dopo invio riuscito.

L'ora digest e una soglia operativa semplice in Europe/Rome, non una regola normativa.

## Invio manuale

L'invio manuale a se stessi resta disponibile anche se il digest automatico e disattivato, perche e un'azione esplicita dell'utente.

Gli invii manuali continuano a usare rate limit e ora registrano delivery log.

## UI aggiornata

La pagina `/notifications` contiene:

- sezione “Preferenze email”;
- toggle digest email;
- select frequenza;
- campo ora digest;
- ultimo invio;
- sezione “Invii recenti”;
- pannello digest manuale gia esistente.

La UI non accetta destinatari liberi e non mostra body email, token, hash, `blobKey`, URL permanenti o link download.

## Permessi

Consentiti:

- `OWNER`;
- `ADMIN`;
- `SAFETY_CONSULTANT`.

Negati:

- `SITE_MANAGER`;
- `WORKER`;
- `VIEWER`.

## Cosa non e stato implementato

- SMS;
- WhatsApp;
- push native;
- provider cron esterni;
- invio a ruoli o gruppi;
- invio a email arbitrarie;
- unsubscribe pubblico;
- marketing email;
- allegati;
- report PDF;
- preferenze granulari per tipo notifica;
- notifiche email per viewer esterni.

## Rischi privacy

- Il delivery log salva la email destinataria per tracciamento minimo degli invii.
- Non viene salvato il contenuto completo delle email.
- Eventuali preferenze granulari future dovranno rispettare filtri per risorsa prima di aprire `SITE_MANAGER` e `WORKER`.

## Prossima fase consigliata

Configurare un job schedulato protetto in ambiente di deploy, con rotazione del secret e monitoraggio minimo di errori/skip.
