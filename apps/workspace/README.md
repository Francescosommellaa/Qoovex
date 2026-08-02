# Workspace App

Runtime Next.js autenticato del prodotto Qoovex. Contiene la Panoramica exception-driven, il motore persistente, Auth.js/NextAuth, MFA, inviti Azienda, autorizzazioni, API, servizi server, supporto auditato e Console Qoovex.

## `verified_current_state`

- `Organization` e il tenant canonico e Azienda la label prodotto.
- Ogni account usa attualmente zero o una sola `OrganizationMembership`; il ruolo organizzativo e soltanto `OWNER` o `COLLABORATOR`.
- Preset, permessi persistiti, scadenza e resource grant sono distinti e server-derived.
- `Worker` e un profilo operativo, non un ruolo account. `SUPPORT_AGENT` e `PLATFORM_ADMIN` sono ruoli piattaforma separati.
- `JobSite` conserva `clientName` testuale e `JobSiteOperationalPhase`; non esistono `JobSiteParticipant`, `CLIENT`, `ClientProperty` o inviti cliente per cantiere.
- `ContextMessage` e interno e la timeline contestuale attiva e aziendale. Gli esterni accedono soltanto a share link tokenizzati di pacchetti approvati.
- Il dominio implementa lavoratori, cantieri, documenti/versioni, scadenze, checklist, prove/revisioni, richieste, pacchetti, condivisioni, processi, decisioni, eccezioni, audit, export e data-control.

`/dashboard` presenta la Panoramica Azienda; `/operations/[processId]` mostra il dettaglio processo; `/document-packages` gestisce le Condivisioni. La ricerca metadata-only corrente e aziendale, usa un Dialog `Ctrl/Cmd+K` e non ha una pagina `/search`.

## `approved_product_direction` / `conceptual_not_implemented`

La direzione vNext aggiungera un contesto cliente separato dalla membership Azienda: un cliente autenticato partecipera ai soli cantieri in cui e invitato, organizzera privatamente i cantieri per immobile e vedra soltanto contenuti `SHARED_WITH_CLIENT`. Un cantiere avra un solo cliente principale nel primo MVP e richiedera la sua conferma iniziale prima dell'attivazione.

Timeline condivisa, step vNext, proposte versionate, pagamenti documentati, home cliente, chiusura reciproca, richieste post-chiusura ed export cliente non sono route o capability attive. I nomi futuri non autorizzano tipi, permessi o servizi.

D-VNEXT-18-45 definiscono il futuro contratto tecnico: contesto esplicito, membership multiple, partecipanti job-site-scoped, inviti cliente separati, audience/disclosure, deleghe economiche rivalidate, lifecycle versionati, export e rollout `LEGACY/VNEXT`. Nessuna di queste strutture e presente nel Workspace corrente.

## Confini invariati

Le composizioni restano app-local; DTO condivisi in `packages/types`; Prisma e migration in `packages/db`; primitive in `@qoovex/ui`. Prisma salva dati/metadati e Vercel Blob privato salva file. La foundation Geist/Tabler/light-dark-system resta invariata.

Per le fonti canoniche leggere `docs/HowToUse.md` e `docs/00_PRODUCT_AND_SCOPE.md`-`docs/08_SUPPORT_AND_DATA_CONTROL.md`.
