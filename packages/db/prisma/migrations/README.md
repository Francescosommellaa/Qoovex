# Prisma migrations

Questa cartella contiene l'unica cronologia Prisma canonica di Qoovex. Le migration applicate sono immutabili; il verifier ammette soltanto equivalenza EOL LF/CRLF e blocca differenze sostanziali.

## Stato corrente

- migration 1–5: baseline storico effettivamente presente in Production prima del rollout corrente;
- `20260803230000_qoovex_vnext_from_zero`: passaggio distruttivo storico al dominio basato sul cantiere;
- `20260809010000_account_roles_and_contextual_attachments`: aggiunge `AccountRole`, mantiene gli allegati contestuali e rimuove le tabelle autonome residue;
- `20260809020000_single_active_organization_membership`: vincola ogni account a una sola membership Azienda attiva.
- `20260813010000_direct_workspace_routes`: migra i precedenti link Workspace parametrizzati alle route dirette senza identificativo Azienda.

La head repository è `20260813010000_direct_workspace_routes` con nove migration. Preview e Production restano verificate alla precedente `20260809020000_single_active_organization_membership` con otto migration e drift nullo fino al prossimo rollout guardato. I nomi del prodotto precedente restano esclusivamente nel SQL storico necessario a ricostruire e aggiornare correttamente il database.

## Regole operative

- Non modificare migration già pubblicate e non usare `migrate resolve` per aggirare errori.
- Non usare `db push` o `migrate reset` in Preview o Production: il rollout usa il wrapper guardato di `prisma migrate deploy`.
- Preview e Production devono mantenere database, Blob, callback e segreti distinti.
- La promozione del dominio pubblico avviene soltanto dopo CI verde e smoke del deployment staged.
- Dopo l'applicazione eseguire status, checksum, diff/drift, FK/unique/enum/orfani e `verify:prisma`.
