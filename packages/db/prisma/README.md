# Prisma Qoovex vNext

History canonica: 6 migration. `OrganizationRole` contiene soltanto `OWNER` e `COLLABORATOR`; membership unica per `(organizationId,userId)`; il cliente è `JobSiteParticipant`, mai membership Azienda.

`JobSite` usa il lifecycle vNext e non contiene `clientName` o fase operativa. `JobSiteUserAssignment` è eliminato; i membri Azienda usano participant e `JobSiteWorkerAssignment` resta per Worker senza account.

`20260803230000_qoovex_vnext_from_zero` azzera intenzionalmente tutti i record della baseline e crea il dominio vNext senza backfill o compatibilità legacy. Il reset è limitato a questo head e possiede attestazioni tecniche, ma richiede comunque dispatch manuale, inventario aggiornato e autorizzazione esplicita; non è autorizzato dallo stato corrente.

Usare i guardrail locali e `pnpm --filter @qoovex/db verify:prisma`; Preview e Production possono usare soltanto il wrapper guarded di `prisma migrate deploy` da workflow manuale, mai `db push`, `migrate reset` o `migrate resolve`.
