# /api/shared/document-packages/[token]

Accesso destinatario esterno in sola lettura tramite token.

- `GET`: restituisce solo il pacchetto condiviso e gli item inclusi.

Il destinatario esterno non diventa membro dell'organizzazione e non vede `organizationId`, `tokenHash`, `blobKey` o URL permanenti.
La risposta omette documenti non classificati o non `STANDARD`, anche per pacchetti legacy precedenti alla tassonomia.
Il link consegnato al destinatario usa `/shared/document-packages/[token]`; questa route resta il confine JSON consumabile e supporta il viewer frontend.

Questo share link non e una partecipazione cliente autenticata, non crea un contesto `CLIENT_JOB_SITE` e non costituisce la timeline condivisa vNext. Il contratto corrente resta invariato durante il rollout futuro.
