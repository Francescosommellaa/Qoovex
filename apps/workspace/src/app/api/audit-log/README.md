# Audit Log API

`GET /api/audit-log`

Route owner-only per leggere eventi audit prodotto redatti.

- Richiede associazione aziendale e permesso `auditLog:read`.
- Filtra sempre per `organizationId` server-side.
- Supporta `limit`, `cursor`, `action`, `entityType`, `outcome`, `from`, `to`.
- Non espone contenuti file, body email, token o riferimenti privati di storage.
