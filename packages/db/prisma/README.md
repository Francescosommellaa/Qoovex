# Prisma foundation

History immutabile: 18 migration. `20260802010000_remove_legacy_product_foundation` elimina il dominio precedente e preserva identità/sicurezza, piattaforma, Aziende/accessi, Worker/assegnazioni, JobSite minimo, file/versioni, prove, audit, notifiche `SYSTEM` e data-control.

`JobSite` non contiene `clientName` o fase operativa. `OrganizationRole` contiene soltanto `OWNER` e `COLLABORATOR`. Nessun modello vNext è anticipato.

Usare i guardrail locali e `pnpm --filter @qoovex/db verify:prisma`; mai `db push`, `migrate resolve` o SQL manuale fuori migration.
