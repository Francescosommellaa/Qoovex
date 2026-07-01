# Document Types API

Tipi documento configurabili dall'azienda.

- `GET /api/document-types`: lista tipi attivi filtrati per `organizationId`.
- `POST /api/document-types`: crea un tipo documento.

Permessi:
- lettura: `documents:read`;
- creazione: `documents:update`.

Nessun preset normativo viene creato da questa API.
