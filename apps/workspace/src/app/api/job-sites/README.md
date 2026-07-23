# Job Sites API

Cantieri o contesti operativi dell'azienda corrente.

- `GET /api/job-sites`: lista paginata con ricerca, fase e segnali di attenzione.
- `POST /api/job-sites`: crea un cantiere con fase obbligatoria e assegnazioni opzionali atomiche.
- `POST /api/job-sites/duplicate-check`: avviso tenant-scoped su corrispondenze semplici, senza fuzzy matching.

Permessi:
- lettura: `jobSites:read`;
- creazione: `jobSites:create`.

Questa API non deduce la fase dalle date e non gestisce geolocalizzazione continua, presenze o prove di cantiere.
