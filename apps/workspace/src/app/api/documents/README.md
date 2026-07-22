# Documents API

Documenti logici dell'azienda. La route base non accetta file; le versioni file sono gestite sotto `documents/[documentId]/versions`.

- `GET /api/documents`: lista documenti attivi filtrati per `organizationId`; `status=ARCHIVED` restituisce soltanto l'archivio a OWNER e ADMIN.
- `POST /api/documents`: crea un documento logico.

Filtri `GET` opzionali:
- `ownerType`;
- `workerId`;
- `jobSiteId`;
- `status`.

Permessi:
- lettura: `documents:read`;
- creazione: `documents:update`.
