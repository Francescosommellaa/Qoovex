# Evidence API

Prove operative collegate ad azienda, lavoratore, cantiere o voce checklist.

- `GET /api/evidence`: lista prove attive filtrate per `organizationId`.
- `POST /api/evidence`: crea una nota operativa JSON oppure una prova `PHOTO`/`FILE` via `multipart/form-data`.

Filtri `GET` opzionali:
- `type`;
- `jobSiteId`;
- `workerId`;
- `checklistItemId`.

Permessi:
- lettura: `evidence:read`;
- creazione/upload: `evidence:upload`.

Le response non espongono URL Blob permanenti.
