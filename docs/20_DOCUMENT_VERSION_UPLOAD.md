# Document Version Upload

Data: 2026-06-30

Questo documento descrive l'upload controllato di file come versioni documento.

Un file caricato significa solo:

> Documento caricato e collegato al record.

Non significa documento verificato, valido legalmente, certificato o conforme.

## Implementato

- Upload di una versione file collegata a `Document`.
- Salvataggio file binario su Vercel Blob privato.
- Salvataggio metadati su Prisma `DocumentVersion`.
- Lista versioni attive di un documento.
- Archiviazione soft di una versione.
- Download server-side autorizzato, senza URL Blob permanente in risposta.

## Route Disponibili

### `GET /api/documents/[documentId]/versions`

Lista versioni attive del documento corrente, filtrate per `organizationId`.

### `POST /api/documents/[documentId]/versions`

Carica una versione documento con `multipart/form-data`.

- Field consentito: `file`.
- Un solo file per richiesta.
- Nessun `organizationId` accettato dal client.

### `DELETE /api/documents/[documentId]/versions/[versionId]`

Archivia soft la versione con `archivedAt`.

Il Blob non viene cancellato fisicamente in questa fase.

### `GET /api/documents/[documentId]/versions/[versionId]/download`

Scarica il file tramite route server-side autorizzata.

La route restituisce stream e header di download. Non fa redirect verso URL Blob e non restituisce URL permanente.

## Provider Blob

Provider usato: Vercel Blob private storage tramite `@vercel/blob`.

Operazioni usate:

- `put(..., { access: "private" })` per salvare il file.
- `get(..., { access: "private" })` per leggere il file da route autorizzata.
- `del(...)` solo come cleanup best-effort se l'upload Blob riesce ma la persistenza Prisma fallisce.

Variabili standard richieste dallo SDK in ambiente runtime:

- `BLOB_READ_WRITE_TOKEN`, oppure
- credenziali Vercel OIDC con `BLOB_STORE_ID` dove supportate dall'ambiente Vercel.

Non sono stati aggiunti segreti nel repository.

## Metadati Salvati In Prisma

Prisma salva solo:

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

Il database non salva PDF, immagini o altri file binari.

## Validazioni File

Limite dimensione: 4 MB.

Motivo: questa fase usa upload server-side. Il limite resta sotto la soglia pratica di Vercel Functions per request body grandi; upload maggiori richiedono una fase successiva con client upload token.

MIME consentiti:

- `application/pdf`;
- `image/jpeg`;
- `image/png`;
- `image/webp`.

Sono rifiutati:

- file mancante;
- file multipli;
- file vuoto;
- file oltre 4 MB;
- MIME non consentito;
- campi form diversi da `file`.

## Permessi Applicati

- Upload: `documents:upload`, solo `OWNER` e `ADMIN`.
- Lista/download: `documents:read`, solo `OWNER`, `ADMIN`, `SAFETY_CONSULTANT`.
- Archiviazione: `documents:archive`, solo `OWNER` e `ADMIN`.
- `SITE_MANAGER`, `WORKER`, `VIEWER`: negati finche non esistono filtri per risorsa o pacchetti condivisi.

Ogni accesso passa da `organizationId` risolto server-side.

## Sicurezza Download

- Nessun URL Blob permanente viene restituito.
- `blobKey` resta interno a Prisma/service.
- Il download usa `Cache-Control: private, no-store`.
- Versioni archiviate non sono scaricabili.
- Documenti o versioni di un'altra azienda restituiscono errore generico.
- Il nome file originale e salvato come metadata, ma il path Blob usa una versione sanitizzata e non e fonte di autorizzazione.

## Stato Documento Dopo Upload

Se il documento era `MISSING`, l'upload lo porta a `TO_REVIEW`.

Non viene mai marcato automaticamente come verificato, certificato o valido.

## Escluso

- Viewer pubblico.
- Share link.
- DocumentPackage.
- OCR.
- AI normativa.
- Classificazione automatica.
- Firma digitale.
- Geolocalizzazione.
- Preset documentali o scadenze normative.
- Cancellazione fisica Blob su archive ordinario.

## Rischi Aperti

- Se cleanup Blob best-effort fallisce dopo errore Prisma, puo restare un Blob orfano.
- Il limite 4 MB e intenzionale per upload server-side; file piu grandi richiedono client upload token.
- Audit prodotto ordinario su upload/download/archive non e ancora implementato; oggi viene tracciato solo `recordSupportAccess` quando esiste sessione support.
- Non esistono ancora filtri per assegnazione a cantiere/lavoratore, quindi i ruoli operativi restano bloccati.

## Prossima Fase Consigliata

Implementare upload grandi con client upload token Vercel Blob, mantenendo:

- token generati solo dopo autorizzazione server-side;
- callback server-side per creare `DocumentVersion`;
- limite MIME/size lato token;
- nessun URL permanente a viewer;
- test di isolamento `organizationId`.
