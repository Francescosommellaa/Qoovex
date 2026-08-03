# Prisma Qoovex vNext

History canonica: 6 migration. `OrganizationRole` contiene soltanto `OWNER` e `COLLABORATOR`; membership unica per `(organizationId,userId)`; il cliente è `JobSiteParticipant`, mai membership Azienda.

`JobSite` usa il lifecycle vNext e non contiene `clientName` o fase operativa. `JobSiteUserAssignment` è eliminato; i membri Azienda usano participant e `JobSiteWorkerAssignment` resta per Worker senza account.

`20260803230000_qoovex_vnext_from_zero` azzera intenzionalmente tutti i record della baseline e crea il dominio vNext senza backfill o compatibilità legacy. Il reset è limitato a questo head ed è registrato come autorizzazione empty-database.

Usare i guardrail locali e `pnpm --filter @qoovex/db verify:prisma`; Preview e Production usano `prisma migrate deploy`, mai `db push` o `migrate resolve`.
