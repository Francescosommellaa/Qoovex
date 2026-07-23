# Resource Assignments API

Route protette per collegamenti operativi e scope risorsa.

- `GET/POST /api/resource-assignments/worker-user-links`
- `DELETE /api/resource-assignments/worker-user-links/[linkId]`
- `GET/POST /api/resource-assignments/job-site-user-assignments`
- `DELETE /api/resource-assignments/job-site-user-assignments/[assignmentId]`
- `GET/POST /api/resource-assignments/job-site-worker-assignments`
- `DELETE /api/resource-assignments/job-site-worker-assignments/[assignmentId]`
- `GET /api/resource-assignments/my-scope`
- `GET /api/resource-assignments/options`: opzioni autorizzate per i flussi contestuali di assegnazione.

Le route non accettano `organizationId` dal client. `OWNER` e `ADMIN` gestiscono le assegnazioni; `SAFETY_CONSULTANT` legge; `SITE_MANAGER` e `WORKER` leggono solo `my-scope`.

La UI canonica `/people/assignments` espone soltanto assegnazioni responsabile-cantiere e lavoratore-cantiere, raggruppate per cantiere. La gestione `WorkerUserLink` non appare in questa pagina: resta nel dettaglio del lavoratore e nel collegamento automatico dell'invito WORKER.
