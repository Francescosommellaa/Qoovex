# Document Archive API

Gestisce soltanto documenti gia archiviati dell'Azienda corrente.

- `PATCH /api/documents/[documentId]/archive`: ripristina il documento nello stato `TO_REVIEW`.
- `DELETE /api/documents/[documentId]/archive`: elimina definitivamente metadati, versioni e Blob privati. Le scadenze e gli elementi dei pacchetti restano registrati e perdono soltanto il collegamento, secondo le relazioni `onDelete: SetNull` dello schema.

Entrambe le operazioni riusano il permesso `documents:archive`, verificano `organizationId` e rifiutano documenti attivi o appartenenti a un'altra Azienda. La cancellazione elimina prima i record nel database; un eventuale errore successivo dello storage viene registrato e segnalato come cleanup pendente.
