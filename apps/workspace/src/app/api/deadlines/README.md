# Deadlines API

Scadenze e promemoria registrati dall'utente o collegati a documenti.

- `GET /api/deadlines`: lista scadenze attive filtrate per `organizationId`.
- `POST /api/deadlines`: crea una scadenza.

Filtri `GET` opzionali:
- `documentId`;
- `workerId`;
- `jobSiteId`;
- `status`.

Permessi:
- lettura: `deadlines:read`;
- gestione: `deadlines:manage`.

Le date sono dati inseriti o confermati dall'utente. Non vengono inventate scadenze normative.
