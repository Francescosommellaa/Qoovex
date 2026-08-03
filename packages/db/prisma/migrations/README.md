# Prisma migrations

Questa cartella contiene l’unica cronologia Prisma canonica di Qoovex. I file applicati sono immutabili; il verifier ammette soltanto equivalenza EOL LF/CRLF e blocca differenze sostanziali.

## Stato corrente

- migration 1–17: history storica del prodotto precedente;
- `20260802010000_remove_legacy_product_foundation`: eradication locale del dominio legacy e stato foundation-only;
- `20260803010000_implement_qoovex_vnext`: membership multiple, dominio vNext, vincoli/indici, backfill JobSite e sostituzione delle assegnazioni account.

Le descrizioni storiche spiegano la provenienza della history, non capability correnti: modelli legacy creati da migration precedenti sono stati rimossi dalle migration successive.

## Regole operative

- Non modificare migration precedenti e non usare `migrate resolve`.
- Non applicare la baseline sopra un database esistente.
- Il wrapper `db:migrate:deploy` è deny-by-default e richiede target, approvazione, backup e expected migration.
- CI usa soltanto database loopback esplicitamente attestati.
- Non usare `db push`, reset remoto o SQL manuale fuori migration.
- Dopo l’applicazione eseguire status, checksum, diff/drift, FK/unique/enum/orfani e `verify:prisma`.
- Preview e Production richiedono un task separato; Prompt B ha usato soltanto database locali isolati.
