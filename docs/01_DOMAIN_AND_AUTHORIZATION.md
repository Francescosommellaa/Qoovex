# Domain and authorization

## Stato attuale verificato

`Organization` e il tenant tecnico e Azienda la label prodotto. I ruoli restano OWNER, ADMIN, SAFETY_CONSULTANT, SITE_MANAGER e WORKER; non sono stati aggiunti ruoli o permessi in Fase 3. `Worker`, `User`, membership, link e assegnazioni restano concetti distinti.

Il dominio esistente e preservato. I modelli Fase 3 sono `OperationalProcess`, `OperationalStep`, `OperationalEvent`, `OperationalDecision`, `OperationalException`, `OperationalArtifactReference`, `OperationalRuleSnapshot` e `OperationalEffectReceipt`. Referenziano gli oggetti dominio senza duplicare file o contenuti.

## Invarianti autorizzativi implementati

- Azienda, attore, ruolo, support session, permesso e resource scope derivano dal server.
- Le letture operative richiedono `organization:read` e applicano anche lo scope degli artifact.
- SITE_MANAGER e WORKER vedono soltanto processi collegati a risorse assegnate o proprie.
- Decisioni, risoluzioni manuali consentite e retry richiedono il permesso della mutazione sottostante.
- Eccezioni oggettive, tecniche o collegate a decisioni non sono chiudibili manualmente.
- Nessun processo amplia visibilita, ruolo o permesso; la condivisione esterna resta nel flusso esplicito esistente.

## Direzione approvata

I processi orchestrano il dominio senza sostituirlo. Una regola configurata puo descrivere cosa attendersi, ma non equivale a un obbligo legale. Le route CRUD utili restano controllo avanzato.

## Specifiche non implementate

Non esistono deleghe decisionali nuove, permission scope operativi aggiuntivi, policy di override generale o accesso supporto dedicato ai processi.

## Decisioni aperte e hard stop

Nuovi ruoli, permessi, deleghe, disclosure sensibili o policy di condivisione richiedono una decisione separata. Il motore non e autorizzazione implicita.
