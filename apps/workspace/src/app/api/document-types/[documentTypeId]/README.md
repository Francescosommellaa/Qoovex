# Document Type Detail API

Gestisce un tipo documento specifico dell'azienda corrente.

- `PATCH /api/document-types/[documentTypeId]`: aggiorna metadati.
- `DELETE /api/document-types/[documentTypeId]`: archivia soft.

Permessi:
- aggiornamento: `documents:update`;
- archiviazione: `documents:archive`.
