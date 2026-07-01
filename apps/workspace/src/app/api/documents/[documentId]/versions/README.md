# Document Versions API

Versioni file collegate a un documento logico.

- `GET /api/documents/[documentId]/versions`: lista versioni attive.
- `POST /api/documents/[documentId]/versions`: carica una versione con `multipart/form-data`.

Regole upload:
- field unico `file`;
- massimo 4 MB;
- MIME consentiti: PDF, JPEG, PNG, WebP;
- file salvato su Vercel Blob privato;
- Prisma salva solo metadata e `blobKey`;
- nessun URL Blob permanente in risposta.
