# Prisma Qoovex

History canonica: nove migration. `OrganizationRole` contiene soltanto `OWNER` e `COLLABORATOR`; `AccountRole` contiene `BUSINESS`, `PROFESSIONAL` e `CLIENT`; ogni account può avere al massimo una membership Azienda attiva. Il cliente è `JobSiteParticipant`, mai membership Azienda. La head `20260813010000_direct_workspace_routes` migra i link Workspace persistiti senza cambiare lo schema.

`JobSite` usa il lifecycle corrente e non contiene `clientName` o una fase operativa separata. `JobSiteUserAssignment` è eliminato; i membri Azienda usano participant e `JobSiteWorkerAssignment` resta per Worker senza account. I file sono modellati esclusivamente come `JobSiteAttachment` contestuali.

Usare i guardrail locali e `pnpm --filter @qoovex/db verify:prisma`; Preview e Production possono usare soltanto il wrapper di `prisma migrate deploy` dai workflow manuali, mai `db push`, `migrate reset` o `migrate resolve`.
