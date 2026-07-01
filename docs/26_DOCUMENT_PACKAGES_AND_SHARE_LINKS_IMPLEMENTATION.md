# 26 - DocumentPackage e ShareLink

## Stato implementato

Questa fase introduce il modulo minimo per pacchetti documentali condivisibili in sola lettura.

Qoovex continua a trattare il pacchetto come un insieme operativo pronto per revisione. Il pacchetto non certifica conformita, validita legale o idoneita.

## Route interne

- `GET /api/document-packages`: lista pacchetti attivi dell'organizzazione.
- `POST /api/document-packages`: crea un pacchetto.
- `GET /api/document-packages/[packageId]`: dettaglio pacchetto con item.
- `PATCH /api/document-packages/[packageId]`: aggiorna metadata o stato prudente.
- `DELETE /api/document-packages/[packageId]`: archivia il pacchetto con `archivedAt` e `status = ARCHIVED`.
- `GET /api/document-packages/[packageId]/items`: lista item del pacchetto.
- `POST /api/document-packages/[packageId]/items`: aggiunge un item.
- `PATCH /api/document-packages/[packageId]/items/[itemId]`: aggiorna la posizione.
- `DELETE /api/document-packages/[packageId]/items/[itemId]`: rimuove fisicamente l'item.
- `GET /api/document-packages/[packageId]/share-links`: lista metadata dei link, senza token raw e senza hash.
- `POST /api/document-packages/[packageId]/share-links`: crea un link.
- `DELETE /api/document-packages/[packageId]/share-links/[shareLinkId]`: revoca un link.

## Route viewer

- `GET /api/shared/document-packages/[token]`: legge solo il pacchetto condiviso.
- `GET /api/shared/document-packages/[token]/items/[itemId]/download`: scarica solo file inclusi nel pacchetto.

Il viewer via token non diventa membro dell'organizzazione e non riceve permessi generali.

## Servizi creati

- `document-package-service.ts`: CRUD package e gestione item.
- `share-token-service.ts`: generazione token raw e hash SHA-256.
- `share-link-service.ts`: list, create e revoke share link interni.
- `shared-package-access-service.ts`: lettura viewer e download server-side.

## Permessi applicati

- `OWNER` e `ADMIN`: gestione completa di package, item e share link.
- `SAFETY_CONSULTANT`: lettura e creazione/gestione package e item; non puo creare o revocare share link.
- `SITE_MANAGER`, `WORKER`, `VIEWER`: negati sugli endpoint interni finche mancano assegnazioni e filtri per risorsa.

Gli endpoint interni usano `organizationId` dal contesto server. Il client non puo indicare l'organizzazione autorevole.

## Validazioni principali

- `title` pacchetto obbligatorio e normalizzato.
- `jobSiteId`, se presente, deve appartenere alla stessa organizzazione ed essere attivo.
- `ARCHIVED` non e accettato via `PATCH`; si usa `DELETE`.
- Ogni item deve avere un solo riferimento coerente con `itemType`.
- Tipi item supportati: `DOCUMENT`, `DOCUMENT_VERSION`, `EVIDENCE`, `CHECKLIST`, `NOTE`.
- Record archiviati o di altra organizzazione non possono essere aggiunti.
- Duplicati identici nello stesso pacchetto sono rifiutati.
- `position` deve essere intero non negativo; se assente viene calcolato in append.

`DocumentPackageItem` non ha `archivedAt` o `status`; la rimozione usa delete fisico dell'item, senza cancellare documenti, versioni, prove o checklist collegati.

## Token e scadenza

Il token raw viene generato lato server con entropia adeguata e restituito solo nella risposta di creazione.

Il database salva solo:

- `tokenHash`;
- `expiresAt`;
- `revokedAt`;
- `lastAccessedAt`;
- relazioni con organizzazione, pacchetto e creatore.

Default provvisorio: il link scade dopo 7 giorni se il client non fornisce `expiresAt`.

## Cosa vede il viewer

Il viewer vede solo:

- titolo e descrizione del pacchetto;
- stato prudente del pacchetto;
- ultimo aggiornamento;
- item inclusi;
- metadata minimi dei file inclusi.

Il viewer non vede:

- `organizationId`;
- `tokenHash`;
- `blobKey`;
- URL permanenti Blob;
- dati interni non inclusi;
- dati completi di lavoratori, cantieri o organizzazione.

## Blob e download

Non e stato introdotto nuovo upload Blob.

Il download usa il Blob adapter esistente e passa solo da route server-side autorizzata dal token. Sono scaricabili solo file gia inclusi come `DocumentVersion` o `Evidence`.

Le response non espongono URL permanenti.

## Esclusioni

- Nessuna UI.
- Nessun viewer globale.
- Nessuna membership viewer.
- Nessun nuovo upload Blob.
- Nessun OCR o AI.
- Nessun preset normativo.
- Nessuna firma digitale.
- Nessuna geolocalizzazione.
- Nessuna promessa di conformita o validita legale.

## Audit futuro

In una fase successiva andranno auditati almeno:

- package created/updated/archived;
- item added/removed/reordered;
- share link created/revoked;
- viewer package access;
- viewer file download;
- accessi negati su token scaduti o revocati, se coerente con la policy.

Non loggare token raw, token hash, blob key, URL privati o contenuto file.

## Prossima fase consigliata

La fase successiva puo concentrarsi sulla dashboard operativa mobile-first, mostrando stato documentale, scadenze, pacchetti pronti per revisione e prove operative senza introdurre promesse legali.
