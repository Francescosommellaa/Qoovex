# Document Version Download API

Download server-side autorizzato di una versione documento.

- `GET /api/documents/[documentId]/versions/[versionId]/download`

La route:
- verifica permessi e `organizationId`;
- blocca versioni archiviate;
- legge il Blob privato lato server;
- restituisce stream con `Cache-Control: private, no-store`;
- non restituisce URL permanenti.
