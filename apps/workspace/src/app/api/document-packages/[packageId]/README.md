# /api/document-packages/[packageId]

Dettaglio e gestione metadata del pacchetto documentale.

- `GET`: dettaglio pacchetto con item.
- `PATCH`: aggiorna metadata o stato prudente diverso da `ARCHIVED`.
- `DELETE`: archivia con `archivedAt` e `status = ARCHIVED`.

Ogni accesso e filtrato per `organizationId`.
