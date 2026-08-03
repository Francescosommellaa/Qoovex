# Workspace Qoovex vNext

`verified_current_state`: Workspace è il runtime autenticato del prodotto vNext.

## Contesti e route

- `/contexts`: seleziona il contesto quando l’account dispone di più Aziende, lavori cliente o accesso piattaforma.
- `/org/[organizationId]`: home Azienda, cantieri, Collaborator e profilo pagamento.
- `/org/[organizationId]/job-sites/[jobSiteId]`: riepilogo, timeline, step, richieste, modifiche, pagamenti, persone, file, chiusura e impostazioni.
- `/client`: immobili privati, cantieri e azioni cliente.
- `/client/job-sites/[jobSiteId]`: sola proiezione condivisa e azioni participant-scoped.
- `/exports/access/[token]`: scambio autenticato del link opaco con un grant breve.

Le route implicite legacy `/dashboard`, `/job-sites`, `/documents` e `/evidence` non esistono e restituiscono 404. Auth, supporto e console piattaforma restano context-neutral.

## Sicurezza

La route identifica il contesto; cookie e input client non sono fonti di autorizzazione. Ogni mutation ricontrolla identity, tenant, membership o participant, scope, permission, `accessVersion`, revisione e delega economica quando richiesta. `CLIENT` non è un `OrganizationRole`.

Le azioni critiche usano `Idempotency-Key`, fingerprint e receipt; gli aggiornamenti concorrenti usano revisione ottimistica e transazioni Serializable con retry. Blob resta privato. Upload e download sono mediati dal server, auditati e non espongono pathname. Il profilo IBAN richiede MFA e usa AES-256-GCM con key ring dedicato.

## Capability manifest

`src/shared/server/vnext-registry.ts` dichiara route, navigazione, permesso, servizio, mutation, stato e test. Sono ammessi solo `ACTIVE` e `INTERNAL_ONLY`; il contract test impedisce API prodotto orfane e processi non registrati.

## Esclusioni

Non sono implementati pricing/billing, marketplace, pagamenti in-app, escrow, KYC, firma qualificata, IA, OCR o cancellazione fisica. Nessuna di queste capacità è mostrata nella UI.
