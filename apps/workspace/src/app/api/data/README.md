# Data Control API

Route owner-only per inventario dati, export metadata JSON e retention operativa.

- `GET /api/data/inventory`: restituisce solo conteggi filtrati per `organizationId`.
- `GET /api/data/export`: genera on-demand un file JSON metadata, senza file, allegati, token, hash, `blobKey`, URL Blob o body email.
- `GET /api/data/retention`: restituisce candidati a revisione operativa. Non cancella dati e non elimina Blob.

Le route usano `auditLog:read` e ruolo effettivo `OWNER`.
