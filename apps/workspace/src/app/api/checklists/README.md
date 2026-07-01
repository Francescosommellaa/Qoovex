# Checklists API

Checklist operative configurabili dell'azienda corrente.

- `GET /api/checklists`: lista checklist attive filtrate per `organizationId`.
- `POST /api/checklists`: crea una checklist configurata.

Filtri `GET` opzionali:
- `jobSiteId`;
- `status`.

Permessi:
- lettura: `checklists:read`;
- creazione: `checklists:manage`.

Nessun template normativo viene creato da questa API.
