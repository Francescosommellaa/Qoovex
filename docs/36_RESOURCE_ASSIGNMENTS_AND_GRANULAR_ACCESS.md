# 36 - Resource assignments e accesso granulare

## Decisione

Questa fase introduce assegnazioni risorsa addittive per sbloccare accessi limitati a `SITE_MANAGER` e `WORKER` senza dare visibilita all'intera azienda.

I permessi restano action gate. Ogni query sensibile applica anche `organizationId` e scope risorsa.

## Modelli Prisma aggiunti

Migration creata: `20260708000000_resource_assignments`.

Nuovi modelli:

- `WorkerUserLink`: collega un utente autenticato a un record `Worker`.
- `JobSiteUserAssignment`: assegna un utente a un cantiere con ruolo operativo `SITE_MANAGER`.
- `JobSiteWorkerAssignment`: assegna un lavoratore a un cantiere.

Nuovo enum:

- `JobSiteUserAssignmentRole` con valore `SITE_MANAGER`.

Audit esteso con azioni e tipi entita per creazione e archiviazione delle tre assegnazioni.

## Permessi

Nuovi permessi condivisi:

- `assignments:read`;
- `assignments:manage`.

Matrice applicata:

- `OWNER`: legge e gestisce assegnazioni.
- `ADMIN`: legge e gestisce assegnazioni.
- `SAFETY_CONSULTANT`: legge assegnazioni, non gestisce.
- `SITE_MANAGER`: legge solo `my-scope`.
- `WORKER`: legge solo `my-scope`.
- `VIEWER`: nessun accesso workspace admin.

`WORKER` riceve lettura limitata per lavoratore, cantiere ed evidence, piu upload documento/prova dove lo scope lo consente. Non riceve `checklists:read` in questa fase.

## Service creati

- `resource-assignment-service.ts`: crea, lista e archivia collegamenti e assegnazioni; valida azienda, record attivi, membership coerente e duplicati attivi.
- `resource-scope-service.ts`: risolve worker collegato, cantieri assegnati e helper per controllare accesso a documenti, scadenze, checklist, evidence, worker e job site.

## Route API create

- `GET/POST /api/resource-assignments/worker-user-links`
- `DELETE /api/resource-assignments/worker-user-links/[linkId]`
- `GET/POST /api/resource-assignments/job-site-user-assignments`
- `DELETE /api/resource-assignments/job-site-user-assignments/[assignmentId]`
- `GET/POST /api/resource-assignments/job-site-worker-assignments`
- `DELETE /api/resource-assignments/job-site-worker-assignments/[assignmentId]`
- `GET /api/resource-assignments/my-scope`

Le route non accettano `organizationId`, `role` o altri campi autoritativi dal client.

## UI creata

Route:

- `/access`

Sezioni:

- collegamento utente-lavoratore;
- assegnazione capocantiere-cantiere;
- assegnazione lavoratore-cantiere;
- liste attive e azione archivia.

La shell ora mostra:

- `Audit` solo quando il ruolo effettivo e `OWNER`;
- `Accessi` solo per `OWNER` e `ADMIN`;
- niente pacchetti/notifiche/audit per ruoli operativi.

## Cosa vede SITE_MANAGER

Un `SITE_MANAGER` con cantieri assegnati puo leggere:

- solo cantieri assegnati;
- checklist dei cantieri assegnati;
- scadenze collegate ai cantieri assegnati;
- documenti con `ownerType = JOB_SITE` dei cantieri assegnati;
- evidence collegate ai cantieri assegnati;
- lista minima dei lavoratori assegnati agli stessi cantieri.

La lista minima lavoratori non include email, telefono o note.

Puo completare voci checklist e caricare evidence solo se il cantiere e assegnato.

## Cosa vede WORKER

Un `WORKER` collegato a un record Worker puo leggere:

- solo il proprio record lavoratore;
- documenti con `ownerType = WORKER` e `workerId` proprio;
- scadenze proprie o collegate ai propri documenti;
- cantieri assegnati al proprio worker;
- evidence collegate al proprio worker o ai cantieri assegnati.

Puo caricare versioni documento solo su propri documenti worker e caricare evidence solo nel proprio scope.

## Cosa resta negato

Restano negati a `SITE_MANAGER` e `WORKER`:

- gestione lavoratori, cantieri, documenti, scadenze e checklist;
- pacchetti documentali e share link;
- audit log;
- `/access`;
- notifiche/email operative con filtri granulari incompleti.

`VIEWER` resta limitato ai pacchetti condivisi tramite token.

## Audit

Sono auditati come best-effort:

- creazione/archiviazione `WorkerUserLink`;
- creazione/archiviazione `JobSiteUserAssignment`;
- creazione/archiviazione `JobSiteWorkerAssignment`.

I metadata salvano solo `entityType` e `reasonCode`; non salvano dati personali, token, Blob key o URL privati.

## Privacy

Il collegamento utente-lavoratore e operativo. Non prova identita, competenze o valore legale.

Le viste operative evitano dati personali non necessari. In particolare, la vista SITE_MANAGER dei lavoratori e minimizzata.

## Limiti noti

- Non ci sono unique parziali DB sugli archiviati; i duplicati attivi sono bloccati dai service.
- Le notifiche/email per ruoli operativi restano rimandate finche non avranno filtri per sorgente.
- WORKER non legge checklist in questa fase.
- Non esiste ancora una UI personale dedicata per ruoli operativi; le pagine esistenti usano payload filtrati.

## Prossima fase consigliata

13.3 dovrebbe completare una UX dedicata per ruoli operativi, filtri granulari sulle notifiche e policy item-specific per checklist worker.
