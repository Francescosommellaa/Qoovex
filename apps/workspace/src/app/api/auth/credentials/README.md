# Credentials auth API

Route pubbliche per il flusso credentials app-local:

- `POST /api/auth/credentials/sign-up`
- `POST /api/auth/credentials/verify-email`
- `POST /api/auth/credentials/sign-up/complete`
- `POST /api/auth/credentials/password-reset/request`
- `POST /api/auth/credentials/password-reset/confirm`

La registrazione richiede prima un codice email e poi una sessione HttpOnly firmata; username e password arrivano al service di creazione solo dopo questa prova. Le route applicano messaggi anti-enumerazione e non restituiscono password, stack trace, token o dati storage.
