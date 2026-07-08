# Workspace API Routes

Scopo: route handler server-side dell'app workspace.

Metti qui:
- `route.ts` per endpoint HTTP dell'app;
- validazione input, autenticazione, delega a funzioni del layer corretto.

Non mettere qui:
- logica business corposa;
- utility pure riusabili o query duplicate sparse.

Regole:
- un endpoint per cartella;
- nome cartella coerente con la risorsa o il caso d'uso;
- ordine file secondo `docs/CodePatterns.md`.

Endpoint dominio MVP attivi:
- `auth/credentials`: registrazione credentials e verifica email per ingresso workspace;
- `dashboard`: payload sintetico per la dashboard operativa interna;
- `document-types`: tipi documento configurabili, senza preset normativi;
- `documents`: documenti logici e versioni file con Blob privato;
- `deadlines`: scadenze registrate dall'utente o collegate a documenti;
- `workers`: lavoratori con metadati operativi minimi;
- `job-sites`: cantieri senza geolocalizzazione o presenze;
- `checklists`: checklist operative configurabili e voci completabili;
- `evidence`: note, foto e file operativi con Blob privato e download autorizzato;
- `document-packages`: pacchetti documentali, item inclusi e share link revocabili;
- `shared/document-packages`: accesso viewer tokenizzato e limitato al singolo pacchetto.
- `notifications`: notifiche interne filtrate per azienda, lettura e dismiss;
- `notifications/preferences`: preferenze email dell'utente corrente, opt-in e filtrate per azienda;
- `notifications/email-deliveries`: ultimi invii email dell'utente corrente senza body o dettagli sensibili;
- `notifications/email-digest`: anteprima digest email e invio manuale a se stessi, senza destinatari client-side;
- `notifications/[notificationId]/send-to-me`: invio manuale di una singola notifica all'utente corrente;
- `reminders/sync`: sync idempotente dei promemoria interni da dati registrati.
- `reminders/email-digest/run`: endpoint schedulabile protetto da `QOOVEX_CRON_SECRET`, senza cron provider configurato qui.
- `audit-log`: audit prodotto owner-only con metadata redatti e paginazione semplice.
- `data`: inventario dati, export metadata JSON e retention operativa owner-only.
- `resource-assignments`: collegamenti operativi e assegnazioni risorsa per scope granulare.
