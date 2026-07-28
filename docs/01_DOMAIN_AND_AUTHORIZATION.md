# Domain and authorization

## Stato attuale verificato

`Organization` e il tenant tecnico e Azienda la label prodotto. Il contratto organizzativo usa soltanto `OWNER` e `COLLABORATOR`. I profili operativi sono preset modificabili (`READ_ONLY`, `OPERATIONAL_COLLABORATION`, `SITE_MANAGER`, `DOCUMENT_REVIEWER`, `LIMITED_UPLOAD`, `CUSTOM`) che inizializzano permessi e scope senza diventare ruoli. `Worker`, `User`, membership, grant e assegnazioni restano concetti distinti. I ruoli interni `SUPPORT_AGENT` e `PLATFORM_ADMIN` appartengono alla piattaforma e non sono ruoli Azienda.

Il dominio esistente e preservato. Ai modelli operativi Fase 3 si aggiungono `DocumentPackageRevision`, `DocumentPackageShareProposal` e `OperationalEventArtifactReference`; `ShareLink` punta alla revisione approvata. Nessun modello duplica contenuto file.

## Invarianti autorizzativi implementati

- Azienda, attore, ruolo, support session, permesso e resource scope derivano dal server.
- Solo `OWNER` gestisce inviti e accessi Azienda; un `COLLABORATOR` opera esclusivamente con permessi persistiti, scadenza e scope `FULL` o `ASSIGNED` espliciti.
- `SUPPORT_AGENT` puo aprire sessioni temporanee e auditabili su codice Azienda; `PLATFORM_ADMIN` mantiene separatamente la gestione globale della piattaforma.
- Le letture operative richiedono `organization:read` e applicano anche lo scope degli artifact.
- Gli accessi `ASSIGNED` vedono soltanto risorse con grant esplicito o collegamenti operativi tenant-safe; uno scope vuoto resta vuoto.
- Decisioni, risoluzioni manuali consentite e retry richiedono il permesso della mutazione sottostante.
- Eccezioni oggettive, tecniche o collegate a decisioni non sono chiudibili manualmente.
- Processi, decisioni ed eccezioni sono leggibili solo se tutti gli artifact determinanti sono consultabili.
- Condivisioni, proposte ed eventi collegati richiedono `documentPackages:share`; nessun processo amplia visibilita, ruolo o permesso.
- Query, destinatario, finalita e `organizationId` autorevole sono sempre risolti o validati server-side.

## Direzione approvata

I processi orchestrano il dominio senza sostituirlo. Una regola configurata puo descrivere cosa attendersi, ma non equivale a un obbligo legale. Le route CRUD utili restano controllo avanzato.

## Specifiche non implementate

Non esistono deleghe decisionali nuove, permission scope operativi aggiuntivi, policy di override generale o accesso supporto dedicato ai processi.

## Decisioni aperte e hard stop

Nuovi permessi, deleghe, disclosure sensibili o policy di condivisione richiedono una decisione separata. Il motore e i preset non sono autorizzazione implicita.
