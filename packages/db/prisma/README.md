# Prisma Qoovex

History canonica: 6 migration. `OrganizationRole` contiene soltanto `OWNER` e `COLLABORATOR`; membership unica per `(organizationId,userId)`; il cliente Ã¨ `JobSiteParticipant`, mai membership Azienda.

`JobSite` usa il lifecycle attuale e non contiene `clientName` o fase operativa. `JobSiteUserAssignment` Ã¨ eliminato; i membri Azienda usano participant e `JobSiteWorkerAssignment` resta per Worker senza account.

la sesta migration pubblicata nel migration ledger azzera intenzionalmente tutti i record della baseline e crea il dominio attuale senza backfill o compatibilitÃ  precedente. Il reset Ã¨ limitato a questo head e possiede attestazioni tecniche, ma richiede comunque dispatch manuale, inventario aggiornato e autorizzazione esplicita; non Ã¨ autorizzato dallo stato corrente.

Usare i guardrail locali e `pnpm --filter @qoovex/db verify:prisma`; Preview e Production possono usare soltanto il wrapper guarded di `prisma migrate deploy` da workflow manuale, mai `db push`, `migrate reset` o `migrate resolve`.
