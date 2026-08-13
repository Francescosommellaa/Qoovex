# Workspace Qoovex

`verified_current_state`: Workspace è il runtime autenticato del prodotto. L'account sceglie una sola volta il proprio ruolo; un account `BUSINESS` possiede una sola Azienda attiva, `PROFESSIONAL` accede tramite invito Collaborator e `CLIENT` tramite partecipazione al singolo cantiere. La prima vertical slice è verificata: il creatore del cantiere è subito un participant Azienda `ACTIVE`, mentre il cliente invitato resta `PENDING` fino alla conferma del riepilogo iniziale. La copertura end-to-end delle capability più ampie resta valutata caso per caso.

## Route

- `/`: mostra la home dell'unica Azienda collegata oppure indirizza alla superficie Cliente, all'attesa invito Professionista o alla console Qoovex.
- `/account/organization`: creazione dell'unica Azienda per un account `BUSINESS` senza membership attiva.
- `/account/invitations`: attesa dell'invito Collaborator per un account `PROFESSIONAL`.
- `/account/notifications`: preferenze personali di notifica.
- `/job-sites` e `/job-sites/[jobSiteId]`: elenco e dettaglio cantieri dell'unica Azienda collegata, con riepilogo, timeline, step, richieste, modifiche, pagamenti, persone, file, chiusura e impostazioni.
- `/people` e `/payment-profile`: Collaborator e profilo pagamento dell'unica Azienda collegata.
- `/client`: immobili privati, cantieri e azioni cliente.
- `/client/job-sites/[jobSiteId]`: sola proiezione condivisa e azioni participant-scoped.
- `/exports/access/[token]`: scambio autenticato del link opaco con un grant breve.

## Sicurezza

Pagine e API Azienda derivano lo scope unico dalla sessione sul server; `organizationId` resta esplicito soltanto nel layer server e nei servizi tenant-scoped. URL, cookie e input client non concedono autorizzazione. Ogni mutation ricontrolla identity, tenant, membership o participant, scope, permission, `accessVersion`, revisione e delega economica quando richiesta. `CLIENT` non è un `OrganizationRole`.

Le azioni critiche usano `Idempotency-Key`, fingerprint e receipt; gli aggiornamenti concorrenti usano revisione ottimistica e transazioni Serializable con retry. Blob resta privato. Upload e download sono mediati dal server, auditati e non espongono pathname. Il profilo IBAN richiede MFA e usa AES-256-GCM con key ring dedicato.

## Capability manifest

`src/shared/server/job-site-registry.ts` dichiara route, navigazione, permesso, servizio, mutation, stato e riferimenti di test. Sono ammessi solo `ACTIVE` e `INTERNAL_ONLY`; il contract test impedisce API prodotto orfane e processi non registrati, ma non sostituisce test comportamentali o end-to-end.

## Esclusioni

Non sono implementati pricing/billing, marketplace, pagamenti in-app, escrow, KYC, firma qualificata, automazioni intelligenti o cancellazione fisica. Nessuna di queste capacità è mostrata nella UI.
