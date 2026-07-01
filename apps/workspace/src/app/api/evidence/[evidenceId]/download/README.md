# Evidence Download API

Download server-side autorizzato del file collegato a una prova operativa.

- `GET /api/evidence/[evidenceId]/download`: stream del file Blob privato.

Permessi:
- download: `evidence:read`.

La route non restituisce URL Blob permanenti e non consente download di prove archiviate.
