# Prisma Qoovex vNext

History immutabile: 19 migration. `OrganizationRole` contiene soltanto `OWNER` e `COLLABORATOR`; membership unica per `(organizationId,userId)`; il cliente è `JobSiteParticipant`, mai membership Azienda.

`JobSite` usa il lifecycle vNext e non contiene `clientName` o fase operativa. `JobSiteUserAssignment` è stato migrato in participant Azienda; `JobSiteWorkerAssignment` resta per Worker senza account.

La migration vNext non inventa cliente, agreement o timeline condivise per i record foundation: conserva i dati, assegna `DRAFT revision=1` e registra in audit l’eventuale `archivedAt` legacy prima di azzerarlo.

Usare i guardrail locali e `pnpm --filter @qoovex/db verify:prisma`; mai `db push`, `migrate resolve` o SQL manuale fuori migration.
