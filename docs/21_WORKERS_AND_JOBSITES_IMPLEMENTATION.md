# Workers And JobSites Implementation

Data: 2026-06-30

Questo documento descrive le API minime reali per lavoratori e cantieri.

Qoovex usa queste entita per organizzare documenti e scadenze. Non usa questi dati per dichiarare idoneita, abilitazioni, conformita o valutazioni legali.

## Implementato

- `Worker`: lista, dettaglio, creazione, aggiornamento metadati, archiviazione soft.
- `JobSite`: lista, dettaglio, creazione, aggiornamento metadati, archiviazione soft.
- Isolamento obbligatorio per `organizationId`.
- Validazioni input minime.
- Test di autorizzazione, isolamento azienda, validazione e soft archive.

## Route Disponibili

### Worker

- `GET /api/workers`
- `POST /api/workers`
- `GET /api/workers/[workerId]`
- `PATCH /api/workers/[workerId]`
- `DELETE /api/workers/[workerId]`

### JobSite

- `GET /api/job-sites`
- `POST /api/job-sites`
- `GET /api/job-sites/[jobSiteId]`
- `PATCH /api/job-sites/[jobSiteId]`
- `DELETE /api/job-sites/[jobSiteId]`

## Services Creati

- `worker-service.ts`
- `job-site-service.ts`
- `worker-jobsite-validation.ts`

I route handler restano sottili e delegano ai services.

## Campi Worker Gestiti

- `displayName`
- `email`
- `phone`
- `roleLabel`
- `status`
- `notes`
- `archivedAt`

`roleLabel` e solo testo operativo libero. Non e un permesso, una qualifica legale o una prova di idoneita.

## Campi JobSite Gestiti

- `name`
- `address`
- `clientName`
- `status`
- `startDate`
- `endDate`
- `notes`
- `archivedAt`

Non sono gestite coordinate, presenza, tracciamento o geolocalizzazione continua.

## Validazioni

### Worker

- `displayName`: obbligatorio, trim, 2-160 caratteri.
- `email`: opzionale, trim, lowercase, formato semplice `local@domain.tld`.
- `phone`: opzionale, trim.
- `roleLabel`: opzionale, trim.
- `notes`: opzionale, trim.
- `status`: solo `ACTIVE` o `ARCHIVED`; `ARCHIVED` non e impostabile via `PATCH`.
- campi sensibili noti come `taxCode`, `fiscalCode`, `healthData`, `medicalData` sono rifiutati.

### JobSite

- `name`: obbligatorio, trim, 2-160 caratteri.
- `address`: opzionale, trim.
- `clientName`: opzionale, trim.
- `notes`: opzionale, trim.
- `startDate` e `endDate`: opzionali e valide.
- se entrambe presenti, `endDate` non puo precedere `startDate`.
- `status`: solo `ACTIVE` o `ARCHIVED`; `ARCHIVED` non e impostabile via `PATCH`.
- campi di geolocalizzazione come `latitude`, `longitude`, `coordinates` sono rifiutati.

## Permessi Applicati

### Worker

- Lista/dettaglio: `workers:read`
- Creazione: `workers:create`
- Aggiornamento: `workers:update`
- Archiviazione: `workers:archive`

### JobSite

- Lista/dettaglio: `jobSites:read`
- Creazione: `jobSites:create`
- Aggiornamento: `jobSites:update`
- Archiviazione: `jobSites:archive`

## Ruoli

- `OWNER`: gestione completa.
- `ADMIN`: gestione completa.
- `SAFETY_CONSULTANT`: sola lettura.
- `SITE_MANAGER`: negato in questa fase.
- `WORKER`: negato in questa fase.
- `VIEWER`: negato.

`SITE_MANAGER` e `WORKER` hanno bisogno di filtri per risorsa prima di poter leggere dati in modo sicuro.

## Assegnazioni Future

Per sbloccare accessi sicuri serviranno entita o relazioni dedicate, ad esempio:

- `WorkerUserLink`: collega un utente login a un record lavoratore.
- `WorkerJobSiteAssignment`: collega lavoratori a cantieri.
- `SiteManagerJobSiteAssignment`: collega capocantiere/preposti ai cantieri assegnati.

Queste relazioni non sono state implementate in questa fase.

## Interazione Con Documenti E Scadenze

I servizi `Document` e `Deadline` gia validano `workerId` e `jobSiteId` con:

- stesso `organizationId`;
- `archivedAt: null`.

Sono stati aggiunti test espliciti per impedire collegamenti a lavoratori o cantieri di altra azienda o archiviati.

## Audit

I services usano `recordSupportAccess` quando esiste una sessione supporto.

Non e stato introdotto un audit prodotto ordinario. In futuro andranno auditati:

- worker created/updated/archived;
- jobsite created/updated/archived;
- assegnazioni future.

## Escluso

- UI.
- Upload Blob.
- Evidence.
- Checklist.
- Presenze.
- Geolocalizzazione.
- Assegnazioni worker-cantiere.
- Viewer/share link.
- Dati sanitari strutturati.
- Qualifiche legali o normative precompilate.

## Rischi Privacy

- `notes` e `roleLabel` sono testo libero: la UI futura dovra guidare l'utente a non inserire dati sensibili non necessari.
- I ruoli operativi restano bloccati per evitare accessi larghi.
- La lettura del consulente sicurezza resta ampia sull'azienda e va rivalutata quando esisteranno filtri granulari.

## Prossima Fase Consigliata

Implementare `Checklist` ed `Evidence` solo dopo aver deciso:

- quali checklist sono configurabili;
- come collegare prove a cantiere, lavoratore e voce checklist;
- quali ruoli possono caricare o vedere prove in assenza/presenza di assegnazioni.
