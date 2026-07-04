# 32 - Notifications And Reminders Implementation

## Cosa e stato implementato

Questa fase aggiunge notifiche interne e promemoria operativi nel workspace admin.

Le notifiche derivano solo da dati gia registrati dall'utente o dal sistema:
- scadenze registrate superate;
- scadenze registrate in arrivo;
- documenti da verificare;
- documenti scaduti;
- documenti in scadenza;
- pacchetti pronti per revisione;
- share link in scadenza o revocati.

Non vengono creati obblighi, documenti ufficiali, scadenze normative o valutazioni legali.

## Modello dati

E stato aggiunto il modello Prisma `Notification` con:
- `organizationId`;
- `userId` opzionale;
- `type`;
- `severity`;
- `title`;
- `message`;
- `sourceType`;
- `sourceId`;
- `dedupeKey`;
- `actionHref`;
- `readAt`;
- `dismissedAt`;
- timestamp.

Il campo `dedupeKey` e usato solo internamente per evitare duplicati e non viene esposto nei DTO o nella UI.

Enum aggiunti:
- `NotificationType`;
- `NotificationSeverity`;
- `NotificationSourceType`.

## Route API create

- `GET /api/notifications`: lista notifiche non nascoste, con filtro opzionale `filter=unread`.
- `POST /api/notifications/[notificationId]/read`: marca una notifica come letta.
- `POST /api/notifications/[notificationId]/dismiss`: nasconde una notifica.
- `POST /api/reminders/sync`: sincronizza manualmente i promemoria interni.

Le route sono protette e filtrate per `organizationId`.

## Service creati

- `notification-service.ts`: lista notifiche, mapping DTO, mark read e dismiss.
- `reminder-service.ts`: generazione idempotente dei promemoria interni.

`GET /api/notifications`, pagina `/notifications` e dashboard eseguono un sync leggero e idempotente prima della lettura.

## Permessi applicati

Accesso consentito:
- `OWNER`;
- `ADMIN`;
- `SAFETY_CONSULTANT`.

Accesso negato in questa fase:
- `SITE_MANAGER`;
- `WORKER`;
- `VIEWER`.

La guardia usa `organization:read` piu allowlist ruoli. I ruoli operativi richiedono filtri per risorsa prima di ricevere notifiche mirate.

## Soglia operativa

La soglia `UPCOMING_DEADLINE_WINDOW_DAYS` e impostata a 30 giorni.

E una soglia operativa configurabile, non normativa.

## UI creata

Route:
- `/notifications`.

La pagina mostra:
- notifiche non lette e lette;
- filtri minimi tutte/non lette;
- severity;
- titolo e messaggio breve;
- data;
- azione principale se disponibile;
- bottone "Segna come letta";
- bottone "Nascondi";
- empty state operativo.

La dashboard mostra:
- conteggio notifiche non lette;
- prime notifiche di attenzione;
- link alla pagina notifiche.

## Sicurezza payload

I DTO e la UI non espongono:
- `organizationId`;
- `dedupeKey`;
- `blobKey`;
- `tokenHash`;
- token raw;
- URL Blob permanenti;
- contenuto file.

## Cosa non e stato implementato

- Email automatiche massive.
- SMS, WhatsApp o push native.
- Cron provider esterni.
- Preferenze avanzate.
- Notifiche a viewer esterni.
- Filtri risorsa per `SITE_MANAGER` e `WORKER`.
- Audit prodotto ordinario completo.

## Rischi privacy

Le notifiche organizzative sono visibili agli utenti autorizzati dell'azienda. In futuro, notifiche personali o per risorsa richiederanno `userId` e assegnazioni sicure.

I messaggi devono restare brevi e non contenere dati sensibili, contenuto documentale, URL privati o token.

## Prossima fase consigliata

Introdurre preferenze semplici e job schedulato protetto solo dopo aver definito filtri per risorsa e policy su notifiche personali.
