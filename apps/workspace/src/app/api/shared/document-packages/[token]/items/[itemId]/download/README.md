# /api/shared/document-packages/[token]/items/[itemId]/download

Download destinatario esterno controllato per file inclusi in un pacchetto condiviso.

- `GET`: stream server-side di `DocumentVersion` o `Evidence` inclusi.

Token scaduti, revocati, package archiviati, item non inclusi o file archiviati restituiscono accesso negato.
