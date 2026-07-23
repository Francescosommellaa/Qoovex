# Documents API

Documenti logici dell'azienda. La route base non accetta file; le versioni file sono gestite sotto `documents/[documentId]/versions`.

- `GET /api/documents`: lista documenti attivi filtrati per `organizationId`; `status=ARCHIVED` restituisce soltanto l'archivio a OWNER e ADMIN.
- `POST /api/documents`: crea un documento logico soltanto con tipo classificato e compatibile con la destinazione.

Filtri `GET` opzionali:
- `ownerType`;
- `workerId`;
- `jobSiteId`;
- `status`.
- `categoryKey`.

Le letture applicano scope risorsa e sensibilita server-side. I record legacy senza tipo restano leggibili; `RESTRICTED` e `HEALTH_JUDGMENT` sono limitati a OWNER e ADMIN.

Permessi:
- lettura: `documents:read`;
- creazione: `documents:update`.
