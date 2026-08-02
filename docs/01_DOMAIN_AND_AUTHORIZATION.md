# 01 — Dominio e autorizzazione

## verified_current_state

`User` è identità personale. Ogni User ha al massimo una `OrganizationMembership` (`userId @unique`). I soli ruoli Azienda sono `OWNER` e `COLLABORATOR`. `Worker`, `WorkerUserLink`, `JobSiteUserAssignment` e `JobSiteWorkerAssignment` restano distinti. Scope `FULL/ASSIGNED`, grant, expiry, `accessVersion`, revoca e support session restano attivi.

Le risorse assegnabili sono soltanto `JOB_SITE`, `WORKER`, `DOCUMENT`, `EVIDENCE`. I permessi riguardano esclusivamente foundation disponibili. Support Agent non legge file; Platform Admin non bypassa l’autorizzazione Azienda.

## approved_product_direction / conceptual_not_implemented

Il futuro account multi-contesto, membership multiple, `JobSiteParticipant`, `ClientProperty`, cliente principale e deleghe economiche appartengono a D-VNEXT-48. `CLIENT` non entra mai in `OrganizationRole` e non è presente nello schema corrente.

## Hard stop

Nessuna membership multipla, partecipazione cliente, permesso economico o ruolo cliente viene anticipato. Il contratto dominio/permission matrix del Prompt B deve precedere Prisma.
