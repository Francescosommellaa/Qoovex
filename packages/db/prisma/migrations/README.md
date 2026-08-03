# Prisma migrations

Questa cartella contiene l'unica cronologia Prisma canonica di Qoovex. Le migration applicate sono immutabili; il verifier ammette soltanto equivalenza EOL LF/CRLF e blocca differenze sostanziali.

## Stato corrente

- migration 1-5: baseline effettivamente presente in Production prima del rollout vNext;
- `20260803230000_qoovex_vnext_from_zero`: reset distruttivo esplicitamente autorizzato e passaggio completo al dominio Qoovex vNext.

La migration vNext azzera tutti i record applicativi della baseline, elimina tabelle, colonne, enum e relazioni legacy, quindi crea lo schema vNext. Questa scelta e intenzionale: Local, Preview e Production sono stati dichiarati privi di dati reali e il rollout deve partire da zero senza backfill o compatibilita legacy.

## Regole operative

- Non modificare migration gia pubblicate e non usare `migrate resolve` per aggirare errori.
- Non usare `db push` in Preview o Production: il rollout usa `prisma migrate deploy`.
- Preview viene ricreata soltanto dopo aver provato l'isolamento da Production.
- Production accetta il reset vNext soltanto con l'attestazione esatta registrata nel workflow.
- Il Blob store resta privato e viene azzerato una sola volta insieme al passaggio dal vecchio head al nuovo.
- Dopo l'applicazione eseguire status, checksum, diff/drift, FK/unique/enum/orfani e `verify:prisma`.
