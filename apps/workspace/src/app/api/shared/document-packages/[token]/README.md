# /api/shared/document-packages/[token]

Accesso destinatario esterno in sola lettura tramite token.

- `GET`: restituisce solo il pacchetto condiviso e gli item inclusi.

Il destinatario esterno non diventa membro dell'organizzazione e non vede `organizationId`, `tokenHash`, `blobKey` o URL permanenti.
Il link consegnato al destinatario usa `/shared/document-packages/[token]`; questa route resta il confine JSON consumabile e supporta il viewer frontend.
