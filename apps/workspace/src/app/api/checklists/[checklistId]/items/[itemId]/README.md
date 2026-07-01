# Checklist Item Detail API

Aggiornamento, completamento e archiviazione soft di una voce checklist.

- `PATCH /api/checklists/[checklistId]/items/[itemId]`: aggiorna label, descrizione o stato.
- `DELETE /api/checklists/[checklistId]/items/[itemId]`: imposta `status = ARCHIVED`.

Permessi:
- completamento solo stato: `checklists:complete`;
- altri aggiornamenti e archive: `checklists:manage`.
