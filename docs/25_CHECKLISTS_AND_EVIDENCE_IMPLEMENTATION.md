# Checklists And Evidence Implementation

Data: 2026-07-01.

Questo documento descrive l'implementazione minima di checklist operative e prove di cantiere.

Qoovex usa checklist ed evidence per organizzare attivita e informazioni operative. Una checklist completata o una prova caricata non significa conformita, certificazione o validita legale.

## Implementato

- `Checklist`: lista, dettaglio, creazione, aggiornamento metadata/stato, archiviazione soft.
- `ChecklistItem`: lista, creazione, aggiornamento, completamento e archiviazione tramite `status = ARCHIVED`.
- `Evidence`: lista, dettaglio, creazione note, upload foto/file, aggiornamento metadata, archiviazione soft.
- Download Evidence server-side autorizzato.
- Upload file Evidence su Vercel Blob privato tramite adapter esistente.
- Prisma salva solo metadati e riferimenti Blob.
- Isolamento obbligatorio per `organizationId`.

## Route Disponibili

### Checklist

- `GET /api/checklists`
- `POST /api/checklists`
- `GET /api/checklists/[checklistId]`
- `PATCH /api/checklists/[checklistId]`
- `DELETE /api/checklists/[checklistId]`

### ChecklistItem

- `GET /api/checklists/[checklistId]/items`
- `POST /api/checklists/[checklistId]/items`
- `PATCH /api/checklists/[checklistId]/items/[itemId]`
- `DELETE /api/checklists/[checklistId]/items/[itemId]`

### Evidence

- `GET /api/evidence`
- `POST /api/evidence`
- `GET /api/evidence/[evidenceId]`
- `PATCH /api/evidence/[evidenceId]`
- `DELETE /api/evidence/[evidenceId]`
- `GET /api/evidence/[evidenceId]/download`

## Services Creati

- `checklist-service.ts`
- `evidence-service.ts`

I route handler restano sottili e delegano ai services server-only.

## Campi Gestiti

### Checklist

- `name`
- `description`
- `jobSiteId`
- `status`
- `archivedAt`

### ChecklistItem

- `checklistId`
- `label`
- `description`
- `status`
- `completedAt`
- `completedById`

`completedById` arriva dal contesto server, non dal client.

### Evidence

- `jobSiteId`
- `workerId`
- `checklistItemId`
- `type`
- `title`
- `description`
- `blobKey`
- `originalFileName`
- `mimeType`
- `size`
- `createdById`
- `archivedAt`

`blobKey` non viene restituito nelle response pubbliche.

## Validazioni

### Checklist

- `name`: obbligatorio, trim, 2-160 caratteri.
- `description`: opzionale, trim.
- `jobSiteId`: opzionale, ma deve appartenere alla stessa `Organization` ed essere attivo.
- `ARCHIVED` non e impostabile via `PATCH`; si usa `DELETE`.
- Le liste escludono checklist archiviate.

### ChecklistItem

- `label`: obbligatorio, trim, 2-160 caratteri.
- La checklist deve appartenere alla stessa `Organization` ed essere attiva.
- `status`: `OPEN`, `DONE`, `TO_REVIEW`; `ARCHIVED` si usa solo via `DELETE`.
- `DONE` imposta `completedAt` e `completedById`.
- `OPEN` e `TO_REVIEW` rimuovono completamento e completatore.
- Le liste escludono item con `status = ARCHIVED`.

### Evidence

- `title`: obbligatorio, trim, 2-160 caratteri.
- Serve almeno un contesto tra `jobSiteId`, `workerId`, `checklistItemId`.
- Ogni riferimento deve appartenere alla stessa `Organization` ed essere attivo.
- `PATCH` aggiorna solo titolo e descrizione.
- Evidence archiviate sono escluse dalle liste standard e non sono scaricabili.

## Uso Blob Per Evidence

Evidence `NOTE`:

- usa JSON;
- non accetta file;
- non salva Blob.

Evidence `PHOTO` e `FILE`:

- usano `multipart/form-data`;
- accettano un solo field `file`;
- salvano file su Vercel Blob privato;
- salvano in Prisma solo metadata e `blobKey`;
- non restituiscono URL Blob permanenti.

Limite upload: 4 MB.

MIME consentiti:

- `PHOTO`: `image/jpeg`, `image/png`, `image/webp`;
- `FILE`: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`.

Se l'upload Blob riesce ma la persistenza Prisma fallisce, il service tenta cleanup Blob best-effort.

## Permessi Applicati

### Checklist

- Lettura: `checklists:read`.
- Creazione/aggiornamento/archiviazione: `checklists:manage`.
- Completamento item via solo stato: `checklists:complete`.

Ruoli ammessi: `OWNER`, `ADMIN`, `SAFETY_CONSULTANT`.

### Evidence

- Lettura/download: `evidence:read`.
- Creazione/upload/aggiornamento metadata: `evidence:upload`.
- Archiviazione: `evidence:delete`.

Ruoli:

- `OWNER`: lettura, upload, download, archiviazione.
- `ADMIN`: lettura, upload, download, archiviazione.
- `SAFETY_CONSULTANT`: lettura, upload e download; non archivia.
- `SITE_MANAGER`, `WORKER`, `VIEWER`: negati finche non esistono filtri per risorsa.

## Cosa Resta Escluso

- UI.
- Viewer pubblico.
- Share link.
- DocumentPackage.
- Checklist normative precompilate.
- Presenze.
- Geolocalizzazione continua.
- OCR o AI.
- Firma digitale.
- Audit prodotto ordinario.

## Audit

I services usano `recordSupportAccess` quando esiste una sessione di supporto.

Non e stato introdotto un audit prodotto ordinario. In futuro andranno auditati:

- checklist created/updated/archived;
- checklist item created/updated/completed/archived;
- evidence created/uploaded/downloaded/archived;
- accessi negati a file evidence quando coerente con la policy.

## Rischi Privacy

- Evidence puo contenere immagini, file o note sensibili inserite dall'utente.
- `SITE_MANAGER` e `WORKER` restano bloccati per evitare accessi larghi senza assegnazioni.
- `VIEWER` non accede al modulo.
- La UI futura dovra guidare l'utente a minimizzare dati personali non necessari.

## Prossima Fase Consigliata

Implementare `DocumentPackage` e `ShareLink` con:

- pacchetti revocabili;
- token hash;
- viewer in sola lettura;
- accesso limitato ai soli elementi inclusi;
- nessun URL Blob permanente.
