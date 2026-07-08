# 38 - Data retention, export metadata e cancellazione controllata

## Implementazione

La fase introduce un primo modulo owner-only per controllo dati:

- `/data-control`: pagina workspace per inventario, export metadata e retention operativa;
- `GET /api/data/inventory`: conteggi per Organization;
- `GET /api/data/export`: export JSON metadata generato on-demand;
- `GET /api/data/retention`: overview retention e candidati a revisione.

Non sono stati aggiunti modelli Prisma per job export o richieste cancellazione. L'audit prodotto esistente registra gli export riusciti o falliti.

## Export metadata

L'export include solo metadati sicuri: organization minima, conteggi, lavoratori minimizzati, cantieri, documenti logici, versioni documento senza `blobKey`, scadenze, checklist, prove, pacchetti, share link senza token/hash, notifiche, preferenze, delivery log senza corpo email, audit redatti e assegnazioni risorsa.

L'export non include file, allegati, PDF, immagini, URL Blob, link download, token, hash, contenuti documento, body email, password, segreti, dati sanitari, coordinate o note libere escluse.

## Retention operativa

Le soglie sono default operativi modificabili, non requisiti legali.

La pagina mostra candidati a revisione: record archiviati, share link scaduti o revocati, notifiche lette/nascoste oltre 180 giorni, delivery email oltre 365 giorni e audit event vecchi come solo conteggio di revisione.

Nessuna cancellazione automatica viene eseguita.

## Cancellazione controllata

La cancellazione definitiva e rimandata. In questa fase non ci sono hard delete massivi, eliminazione fisica Blob, cancellazione audit o richieste cancellazione persistenti.

Un flusso futuro dovra gestire conferme esplicite, relazioni, file collegati e audit dedicato.

## Permessi

Accesso solo `OWNER`. `ADMIN`, `SAFETY_CONSULTANT`, `SITE_MANAGER`, `WORKER` e `VIEWER` sono negati.

## Audit

Azioni aggiunte:

- `DATA_EXPORT_GENERATED`;
- `DATA_EXPORT_FAILED`.

I metadata audit restano minimizzati e non salvano contenuto export.

## Rischi aperti

- Export molto grandi sono generati in memoria.
- Non esiste ancora download asincrono o job persistente.
- Le note libere sono escluse per prudenza.
- La cancellazione definitiva richiede un piano separato.
