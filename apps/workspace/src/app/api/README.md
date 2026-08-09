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
- ordine file secondo `docs/02_ARCHITECTURE_AND_BOUNDARIES.md`.

Endpoint infrastrutturali e attuale presenti:
- `auth/credentials`: registrazione credentials verify-first, verifica email e reset password;
- `account/notification-preferences`: preferenze personali di notifica collegate all'Azienda;
- `org/[organizationId]`: cantieri, participant, inviti, agreement, timeline, step, richieste, proposte, pagamenti documentati, dispute, allegati, chiusura, post-chiusura, export e impostazioni attuale;
- `client`: inviti, immobili privati, cantieri partecipati e proiezioni condivise participant-scoped;
- `exports`: scambio autenticato di token opachi con grant brevi;
- `internal/job-site`: runner processi e finalize allegati protetti da segreto interno;
- `notifications`: preferenze e delivery del runtime attuale;
- `GET data/jobs/run`: runner data-control con lo stesso contratto cron; secret in query e header custom non sono accettati.
- `audit-log`: audit prodotto owner-only con metadata redatti e paginazione semplice.
- `data`: inventario dati, export metadata JSON e retention operativa owner-only.
- `resource-assignments`: foundation di accesso scoped, non superficie prodotto autonoma.

Le route prodotto implicite precedente non sono endpoint attivi. La presenza delle route attuale non prova la vertical slice end-to-end, che resta bloccata dai test lifecycle dedicati.
