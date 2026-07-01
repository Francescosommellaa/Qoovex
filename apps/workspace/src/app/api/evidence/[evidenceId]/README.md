# Evidence Detail API

Dettaglio e gestione metadata di una prova operativa.

- `GET /api/evidence/[evidenceId]`: legge una prova attiva.
- `PATCH /api/evidence/[evidenceId]`: aggiorna solo titolo e descrizione.
- `DELETE /api/evidence/[evidenceId]`: archivia soft la prova.

Permessi:
- lettura: `evidence:read`;
- aggiornamento metadata: `evidence:upload`;
- archiviazione: `evidence:delete`.
