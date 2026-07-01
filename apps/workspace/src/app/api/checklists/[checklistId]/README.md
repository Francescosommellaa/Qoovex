# Checklist Detail API

Dettaglio e gestione metadata di una checklist attiva.

- `GET /api/checklists/[checklistId]`: legge la checklist con voci non archiviate.
- `PATCH /api/checklists/[checklistId]`: aggiorna metadata o stato operativo.
- `DELETE /api/checklists/[checklistId]`: archivia soft la checklist.

Permessi:
- lettura: `checklists:read`;
- aggiornamento/archiviazione: `checklists:manage`.
