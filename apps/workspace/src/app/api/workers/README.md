# Workers API

Lavoratori collegati all'azienda corrente.

- `GET /api/workers`: lista lavoratori attivi.
- `POST /api/workers`: crea un lavoratore.

Permessi:
- lettura: `workers:read`;
- creazione: `workers:create`.

Questa API non raccoglie dati sanitari strutturati e non usa `roleLabel` come permesso o qualifica.
