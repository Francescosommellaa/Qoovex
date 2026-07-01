# Storage And Database Decisions

## Decisione vincolante

Qoovex usa:

- Prisma per database, schema, modelli, relazioni, stati, permessi, scadenze e audit.
- Blob per file binari come PDF, immagini, documenti caricati, allegati e prove di cantiere.

Non introdurre Supabase, Firebase, S3, storage custom o provider non richiesti.

## Stato attuale del repo

Il repo contiene una traccia Blob collegata al profilo utente e, dal modello MVP, campi metadata Blob per documenti e prove:

- `User.avatarBlobPathname` nello schema Prisma;
- `DocumentVersion.blobKey` per versioni documento;
- `Evidence.blobKey` opzionale per prove operative;
- README account che indica che le immagini profilo sono salvate come Blob.

Non esiste ancora una pipeline upload documenti/prove basata su Blob. I nuovi record salvano solo metadati e chiavi Blob.

## Cosa salva Prisma

Prisma deve salvare:

- record `Organization`, `Worker`, `JobSite`, `Document`, `DocumentVersion`, `Deadline`, `Checklist`, `Evidence`, `DocumentPackage`, `ShareLink`;
- metadati file;
- relazioni tra file, utenti, organizzazione, cantieri e lavoratori;
- stati documentali;
- permessi e ruoli;
- scadenze e promemoria;
- audit log;
- chi ha caricato, aggiornato o archiviato un elemento.

Prisma non deve salvare file binari pesanti.

## Cosa salva Blob

Blob deve salvare:

- PDF;
- immagini;
- foto di cantiere;
- documenti caricati;
- allegati;
- prove operative;
- eventuali anteprime generate solo se approvate in una fase successiva.

## Relazione prevista tra Prisma e Blob

Il record Prisma futuro `DocumentVersion` deve contenere almeno:

- `id`;
- `organizationId`;
- `documentId`;
- `blobKey` o `blobUrl`;
- `originalFileName`;
- `mimeType`;
- `size`;
- `checksum`, se utile e sostenibile;
- `uploadedById`;
- `visibility`;
- `createdAt`;
- eventuale `deletedAt` o stato di archiviazione.

`Evidence` puo seguire lo stesso pattern: record Prisma per metadati e relazione con Blob per il file.

## Privacy e sicurezza

- Ogni file deve essere legato a una `Organization`.
- L'accesso al Blob deve passare da autorizzazione server-side o da link firmati/temporanei.
- I link condivisi devono essere revocabili o scadere.
- I viewer devono vedere solo file inclusi nel pacchetto condiviso.
- I dati personali dei lavoratori devono essere minimizzati.
- Non loggare URL privati, token o contenuto file.

## Cosa non implementare ancora

- Upload completo documenti/prove.
- Provider Blob nuovo o credenziali nuove.
- API complete per documenti/cantieri/lavoratori.
- Anteprime, OCR, AI o classificazione automatica.
- Liste normative precompilate.

## Rischi da evitare

- Salvare PDF o immagini direttamente in colonne database.
- Esporre URL Blob permanenti a viewer esterni.
- Mescolare dati di organizzazioni diverse.
- Usare nomi file come fonte autorevole di stato documentale.
- Inventare scadenze o requisiti documentali.
- Presentare un file caricato come validato legalmente.
