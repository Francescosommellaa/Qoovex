# Dashboard API

`GET /api/dashboard` restituisce un payload sintetico per la dashboard interna.

Regole:

- accesso solo a membri autorizzati della Organization;
- `OWNER`, `ADMIN` e `SAFETY_CONSULTANT` possono leggere;
- `SITE_MANAGER`, `WORKER` e `VIEWER` restano bloccati finche non esistono filtri per risorsa;
- nessun `blobKey`, `tokenHash`, token raw o URL permanente viene restituito.
