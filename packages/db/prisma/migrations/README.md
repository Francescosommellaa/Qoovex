# Prisma migrations

Questa cartella contiene l'unica cronologia Prisma canonica di Qoovex. Le migration applicate sono immutabili; il verifier ammette soltanto equivalenza EOL LF/CRLF e blocca differenze sostanziali.

## Stato corrente

- migration 1-5: baseline effettivamente presente in Production prima del rollout vNext;
- `20260803230000_qoovex_vnext_from_zero`: reset distruttivo tecnicamente attestato ma non autorizzato automaticamente; passaggio completo al dominio Qoovex vNext.

La migration vNext azzera tutti i record applicativi della baseline, elimina tabelle, colonne, enum e relazioni legacy, quindi crea lo schema vNext. Local è stato verificato alla head vNext; Production è stata verificata alla baseline con conteggi applicativi principali pari a zero; Preview non è stato verificato. Nessun ambiente remoto può essere assunto vuoto senza un nuovo inventario read-only immediatamente precedente al rollout.

## Regole operative

- Non modificare migration gia pubblicate e non usare `migrate resolve` per aggirare errori.
- Non usare `db push` o `migrate reset` in Preview o Production: l'eventuale rollout usa il wrapper guarded di `prisma migrate deploy`.
- Preview viene ricreata soltanto dopo aver provato l'isolamento da Production.
- Production accetta il reset vNext soltanto da dispatch manuale con conferma esatta, inventario aggiornato e gate GitHub Environment.
- Il Blob store resta privato e viene azzerato una sola volta insieme al passaggio dal vecchio head al nuovo.
- Dopo l'applicazione eseguire status, checksum, diff/drift, FK/unique/enum/orfani e `verify:prisma`.
