# Credentials auth API

Route pubbliche per il flusso credentials app-local:

- `POST /api/auth/credentials/sign-up`
- `POST /api/auth/credentials/verify-email`

Delegano ai service auth esistenti, applicano messaggi sicuri e non restituiscono password, stack trace, token o dati storage.
