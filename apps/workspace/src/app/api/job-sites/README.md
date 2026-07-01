# Job Sites API

Cantieri o contesti operativi dell'azienda corrente.

- `GET /api/job-sites`: lista cantieri attivi.
- `POST /api/job-sites`: crea un cantiere.

Permessi:
- lettura: `jobSites:read`;
- creazione: `jobSites:create`.

Questa API non gestisce geolocalizzazione continua, presenze o prove di cantiere.
