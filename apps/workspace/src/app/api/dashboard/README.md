# Dashboard API

`GET /api/dashboard` restituisce un payload sintetico per la dashboard interna.

Regole:

- accesso solo a membri autorizzati della Organization;
- `OWNER` e `COLLABORATOR` possono leggere soltanto con `organization:read` e con lo scope applicabile;
- nessun `blobKey`, `tokenHash`, token raw o URL permanente viene restituito.
