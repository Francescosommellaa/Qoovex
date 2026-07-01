# Checklist Items API

Voci operative di una checklist configurata.

- `GET /api/checklists/[checklistId]/items`: lista voci non archiviate.
- `POST /api/checklists/[checklistId]/items`: crea una voce checklist.

Permessi:
- lettura: `checklists:read`;
- creazione: `checklists:manage`.
