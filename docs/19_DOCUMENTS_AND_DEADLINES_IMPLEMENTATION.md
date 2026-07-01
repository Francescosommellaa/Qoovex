# Documents and Deadlines Implementation

Data: 2026-06-30

Questo documento descrive il primo modulo reale implementato per il nuovo Qoovex:

> Qoovex e il sistema piu semplice per piccole imprese e subappaltatori che devono tenere pronti documenti, scadenze e prove di cantiere.

Il modulo organizza tipi documento, documenti logici e scadenze registrate. Non valuta conformita, non certifica documenti e non sostituisce consulenti o responsabili.

## Implementato

- `DocumentType`: lista, creazione, aggiornamento, archiviazione soft.
- `Document`: lista, dettaglio, creazione record logico, aggiornamento metadati/stato, archiviazione soft.
- `Deadline`: lista, creazione, aggiornamento, archiviazione soft.
- Route API server-side protette.
- Servizi server-only con validazione input e filtro obbligatorio per `organizationId`.
- Test di servizio per autorizzazioni, isolamento azienda, validazioni e archiviazione soft.

## Route Disponibili

### `/api/document-types`

- `GET`: lista tipi documento attivi dell'azienda.
- `POST`: crea un tipo documento configurabile.

### `/api/document-types/[documentTypeId]`

- `PATCH`: aggiorna nome, descrizione, ambito e richiesta data scadenza.
- `DELETE`: archivia soft il tipo documento.

### `/api/documents`

- `GET`: lista documenti attivi dell'azienda, con filtri opzionali `ownerType`, `workerId`, `jobSiteId`, `status`.
- `POST`: crea un documento logico senza file binario.

### `/api/documents/[documentId]`

- `GET`: dettaglio documento filtrato per azienda.
- `PATCH`: aggiorna metadati e stato prudenziale.
- `DELETE`: archivia soft il documento e imposta `status = ARCHIVED`.

### `/api/deadlines`

- `GET`: lista scadenze attive dell'azienda, con filtri opzionali `documentId`, `workerId`, `jobSiteId`, `status`.
- `POST`: crea una scadenza manuale o collegata a un documento.

### `/api/deadlines/[deadlineId]`

- `PATCH`: aggiorna metadati, date, stato e relazioni.
- `DELETE`: archivia soft la scadenza e imposta `status = ARCHIVED`.

## Servizi Creati

- `apps/workspace/src/shared/server/domain-access-service.ts`
- `apps/workspace/src/shared/server/document-domain-validation.ts`
- `apps/workspace/src/shared/server/document-type-service.ts`
- `apps/workspace/src/shared/server/document-service.ts`
- `apps/workspace/src/shared/server/deadline-service.ts`

I route handler delegano ai servizi. La logica di dominio non vive nei route handler.

## Permessi Applicati

### DocumentType

- Lista: `documents:read`
- Creazione/aggiornamento: `documents:update`
- Archiviazione: `documents:archive`

### Document

- Lista/dettaglio: `documents:read`
- Creazione record logico: `documents:update`
- Aggiornamento metadati/stato: `documents:update`
- Archiviazione: `documents:archive`

### Deadline

- Lista: `deadlines:read`
- Creazione/aggiornamento/archiviazione: `deadlines:manage`

## Guardie Per Ruolo

- `OWNER` e `ADMIN`: accesso operativo completo al modulo secondo permessi.
- `SAFETY_CONSULTANT`: puo leggere documenti/scadenze e aggiornare documenti; non puo archiviare documenti o tipi documento e non puo gestire scadenze.
- `SITE_MANAGER`, `WORKER`, `VIEWER`: negati su questi endpoint finche non esistono filtri per assegnazione a cantiere/lavoratore o condivisione viewer.

I permessi restano action gate. Non sostituiscono lo scoping per risorsa.

## Validazioni

### DocumentType

- `name`: obbligatorio, trim, 2-120 caratteri.
- `description`: opzionale, trim.
- `appliesTo`: deve essere un enum valido.
- `requiresExpiryDate`: boolean.
- I record archiviati sono esclusi dalle liste standard.

### Document

- `title`: obbligatorio, trim, 2-160 caratteri.
- `ownerType`: obbligatorio e valido.
- `WORKER`: richiede `workerId`.
- `JOB_SITE`: richiede `jobSiteId`.
- `ORGANIZATION`: non accetta `workerId` o `jobSiteId`.
- `documentTypeId`, `workerId`, `jobSiteId`: validati nella stessa `Organization`.
- `status`: solo stati documentali prudenti, escluso `ARCHIVED` via `PATCH`.
- Nessun campo file, Blob o `DocumentVersion` e accettato.

### Deadline

- `title`: obbligatorio, trim, 2-160 caratteri.
- `dueDate`: obbligatoria e valida.
- `sourceType`: valido.
- `DOCUMENT`: richiede `documentId` nella stessa `Organization`.
- `remindAt`: se presente non puo essere successivo a `dueDate`.
- `workerId` e `jobSiteId`: se presenti, validati nella stessa `Organization`.
- I record archiviati sono esclusi dalle liste standard.

## Stati Supportati

Documenti:

- `PRESENT`
- `MISSING`
- `EXPIRED`
- `EXPIRING_SOON`
- `TO_REVIEW`
- `ARCHIVED`

Scadenze:

- `SCHEDULED`
- `EXPIRING_SOON`
- `EXPIRED`
- `DONE`
- `ARCHIVED`

Per scadenze create senza stato esplicito, il servizio calcola uno stato operativo basato solo sulla data inserita o confermata dall'utente: scaduta, in scadenza entro 30 giorni, o programmata. Questo non e una valutazione normativa.

## Escluso

- Upload Blob.
- Download file.
- `DocumentVersion` runtime.
- OCR, AI, classificazione automatica.
- Template normativi.
- Condivisione viewer e share link.
- Preset legali o liste documenti ufficiali.
- Qualsiasi promessa di conformita, validita legale o certificazione.

## Prisma e Blob

Prisma resta il solo layer database per metadati, stati, relazioni, permessi e scadenze.

Blob resta la destinazione prevista per PDF, immagini, foto, documenti caricati e prove operative. Questa sessione non implementa upload o URL Blob.

## Audit

I servizi chiamano `recordSupportAccess` per tracciare l'accesso quando e attiva una sessione di supporto. Non e stato introdotto un nuovo audit prodotto generico per documenti/scadenze. Se serve audit prodotto per utenti ordinari, va progettato come task separato.

## Rischi Privacy

- Le liste documento restituiscono solo ID e metadati minimi, non dettagli lavoratore completi.
- `SITE_MANAGER` e `WORKER` restano negati finche non esistono assegnazioni sicure.
- `VIEWER` resta fuori dal modulo; vedra solo pacchetti condivisi in una fase dedicata.
- Note e scadenze possono contenere informazioni sensibili se inserite dall'utente: servono policy UI e formazione copy per minimizzare i dati.

## Punti Da Validare

- Quali campi minimi servono davvero nelle liste mobile.
- Quale soglia usare per "In scadenza" oltre ai 30 giorni iniziali.
- Quali ruoli possono aggiornare stati documentali in casi reali.
- Se `SAFETY_CONSULTANT` deve poter creare scadenze in alcune configurazioni.
- Audit prodotto richiesto per azioni documentali ordinarie.

## Prossima Fase Consigliata

Implementare upload controllato tramite `DocumentVersion` e Blob:

- validazione MIME/size;
- `blobKey` salvato solo su `DocumentVersion`;
- URL temporanei o controllati;
- nessun download pubblico;
- test di permessi e isolamento azienda.
