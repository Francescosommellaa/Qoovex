# Document Detail API

Gestisce un documento logico dell'azienda corrente.

- `GET /api/documents/[documentId]`: dettaglio documento.
- `PATCH /api/documents/[documentId]`: aggiorna metadati o stato prudenziale.
- `DELETE /api/documents/[documentId]`: archivia soft e imposta `ARCHIVED`.

Questa API non accetta Blob, file binari o URL permanenti.
