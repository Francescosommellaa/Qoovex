# MVP Domain Model

Data: 2026-06-30.

## Obiettivo

Questo documento definisce la base dominio MVP per Qoovex:

> Il sistema piu semplice per piccole imprese e subappaltatori che devono tenere pronti documenti, scadenze e prove di cantiere.

Il modello e generico e configurabile. Non contiene liste normative, scadenze ufficiali, template legali o automatismi di conformita.

## Principi

- Ogni entita dominio appartiene a una `Organization`.
- Prisma salva metadati, relazioni, stati, scadenze e audit.
- Blob salva file binari, PDF, immagini, documenti caricati e prove operative.
- Il database non salva file binari pesanti.
- Gli stati sono prudenziali e operativi.
- Le query future devono filtrare sempre per `organizationId`.
- `SITE_MANAGER`, `WORKER` e `VIEWER` richiedono filtri per risorsa oltre ai permessi.

## Stati principali

Stati documentali:

- `PRESENT`: documento presente.
- `MISSING`: documento mancante secondo configurazione o checklist.
- `EXPIRED`: scadenza registrata superata.
- `EXPIRING_SOON`: scadenza registrata prossima.
- `TO_REVIEW`: documento o informazione da verificare.
- `ARCHIVED`: elemento archiviato.

Stati pacchetto:

- `DRAFT`: pacchetto in preparazione.
- `READY_FOR_REVIEW`: pacchetto pronto per revisione.
- `SHARED`: pacchetto condiviso in lettura.
- `ARCHIVED`: pacchetto archiviato.

## Entita MVP

### Organization

Tenant tecnico gia esistente. Nel prodotto visibile puo essere chiamato "Azienda".

Non duplicare Organization. Ogni nuovo record dominio deve riferirsi a `organizationId`.

### Worker

Persona operativa collegata a una Organization.

Campi minimi:

- `id`;
- `organizationId`;
- `displayName`;
- `email`;
- `phone`;
- `roleLabel`;
- `status`;
- `notes`;
- `createdAt`;
- `updatedAt`;
- `archivedAt`.

Privacy:

- raccogliere solo dati minimi;
- non modellare dati sanitari strutturati;
- collegare eventuali file sensibili a `Document`, non esporli liberamente.

### JobSite

Cantiere o contesto operativo.

Campi minimi:

- `id`;
- `organizationId`;
- `name`;
- `address`;
- `clientName`;
- `status`;
- `startDate`;
- `endDate`;
- `notes`;
- `createdAt`;
- `updatedAt`;
- `archivedAt`.

Non include geolocalizzazione continua.

### DocumentType

Tipo documento configurabile dall'utente o dal progetto.

Campi minimi:

- `id`;
- `organizationId`;
- `name`;
- `description`;
- `appliesTo`;
- `requiresExpiryDate`;
- `createdAt`;
- `updatedAt`;
- `archivedAt`.

Non contiene preset normativi non validati.

### Document

Documento logico collegato ad azienda, lavoratore o cantiere.

Campi minimi:

- `id`;
- `organizationId`;
- `documentTypeId`;
- `ownerType`;
- `workerId`;
- `jobSiteId`;
- `title`;
- `status`;
- `expiryDate`;
- `reviewedAt`;
- `reviewedById`;
- `notes`;
- `createdAt`;
- `updatedAt`;
- `archivedAt`.

Il documento logico non contiene il file binario.

### DocumentVersion

Versione caricata di un documento.

Campi minimi:

- `id`;
- `organizationId`;
- `documentId`;
- `blobKey`;
- `originalFileName`;
- `mimeType`;
- `size`;
- `checksum`;
- `uploadedById`;
- `createdAt`;
- `archivedAt`.

`blobKey` collega il record Prisma al file Blob. Non esporre URL permanenti a viewer esterni.

### DocumentRequirement

Richiesta documentale configurata.

Campi minimi:

- `id`;
- `organizationId`;
- `name`;
- `description`;
- `targetType`;
- `documentTypeId`;
- `jobSiteId`;
- `isRequired`;
- `createdAt`;
- `updatedAt`;
- `archivedAt`.

Rappresenta una configurazione interna, una checklist o una richiesta operativa. Non rappresenta automaticamente un obbligo legale.

### Deadline

Scadenza o promemoria registrato.

Campi minimi:

- `id`;
- `organizationId`;
- `title`;
- `dueDate`;
- `sourceType`;
- `documentId`;
- `workerId`;
- `jobSiteId`;
- `status`;
- `remindAt`;
- `createdAt`;
- `updatedAt`;
- `archivedAt`.

Le date devono essere inserite, importate da fonte fornita o confermate dall'utente.

### Checklist

Lista operativa configurata.

Campi minimi:

- `id`;
- `organizationId`;
- `jobSiteId`;
- `name`;
- `description`;
- `status`;
- `createdAt`;
- `updatedAt`;
- `archivedAt`.

Non creare checklist normative precompilate.

### ChecklistItem

Voce di checklist.

Campi minimi:

- `id`;
- `organizationId`;
- `checklistId`;
- `label`;
- `description`;
- `status`;
- `completedAt`;
- `completedById`;
- `createdAt`;
- `updatedAt`.

### Evidence

Prova di cantiere: foto, file, nota o evidenza operativa.

Campi minimi:

- `id`;
- `organizationId`;
- `jobSiteId`;
- `workerId`;
- `checklistItemId`;
- `type`;
- `title`;
- `description`;
- `blobKey`;
- `originalFileName`;
- `mimeType`;
- `size`;
- `createdById`;
- `createdAt`;
- `archivedAt`.

La prova non deve essere presentata come certificazione.

### DocumentPackage

Pacchetto documentale condivisibile.

Campi minimi:

- `id`;
- `organizationId`;
- `jobSiteId`;
- `title`;
- `description`;
- `status`;
- `createdById`;
- `createdAt`;
- `updatedAt`;
- `archivedAt`.

### DocumentPackageItem

Elemento incluso in un pacchetto.

Campi minimi:

- `id`;
- `organizationId`;
- `documentPackageId`;
- `itemType`;
- `documentId`;
- `documentVersionId`;
- `evidenceId`;
- `checklistId`;
- `note`;
- `position`;
- `createdAt`.

### ShareLink

Link sicuro e revocabile per viewer esterni.

Campi minimi:

- `id`;
- `organizationId`;
- `documentPackageId`;
- `tokenHash`;
- `expiresAt`;
- `revokedAt`;
- `createdById`;
- `createdAt`;
- `lastAccessedAt`.

Il token non deve essere salvato in chiaro.

## Relazioni principali

- `Organization` ha molti Worker, JobSite, DocumentType, DocumentRequirement, Document, Deadline, Checklist, Evidence, DocumentPackage e ShareLink.
- `Document` puo appartenere a Organization, Worker o JobSite tramite `ownerType` e relazioni opzionali.
- `DocumentVersion` appartiene a un Document.
- `Deadline` puo collegarsi a Document, Worker o JobSite.
- `Checklist` puo collegarsi a JobSite.
- `ChecklistItem` appartiene a Checklist.
- `Evidence` puo collegarsi a JobSite, Worker o ChecklistItem.
- `DocumentPackageItem` include elementi selezionati manualmente.
- `ShareLink` espone solo il DocumentPackage collegato.

## Escluso intenzionalmente

- Template normativi precompilati.
- OCR.
- AI normativa o classificazione automatica.
- Firma digitale qualificata.
- Geolocalizzazione continua.
- Download Blob o link esterni pubblici.
- Validazione legale automatica.
- Pricing o limiti commerciali.

## Rischi privacy

- Documenti lavoratore possono contenere dati personali sensibili.
- Prove di cantiere possono includere persone, targhe o informazioni operative.
- Pacchetti condivisi possono esporre dati non necessari.
- Share link devono essere revocabili e possibilmente temporanei.

## Punti da validare

- Documenti reali da supportare come preset.
- Dati minimi da raccogliere per lavoratori.
- Regole di visibilita per consulenti, capicantiere, lavoratori e viewer.
- Durata default dei link di condivisione.
- Struttura desiderata dei pacchetti documentali.
