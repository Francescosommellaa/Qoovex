# 02 — Architecture and boundaries

## verified_current_state

`apps/web` è marketing, `apps/workspace` è il prodotto autenticato, `apps/sirio` documenta la foundation visuale, `packages/ui` contiene primitive generiche, `packages/db` schema/client e `packages/types` contratti platform-neutral.

Workspace usa route esplicite `/org/[organizationId]/...` e `/client/...`. I route handler fanno parsing, auth, risoluzione contesto, delega al servizio ed error mapping uniforme. La business logic e Prisma restano server-only.

## Confini

- L’Azienda possiede il `JobSite` e vede timeline interna più contenuti condivisi del proprio tenant.
- Il cliente possiede privatamente `ClientProperty` e collega i propri cantieri; l’immobile non è tenant e non prova proprietà legale.
- Aziende differenti sullo stesso immobile non si scoprono, non condividono contenuti e vedono soltanto il proprio JobSite.
- Un allegato foundation viene condiviso solo tramite `JobSiteAttachment` e `JobSiteAttachmentPublication`; nessun file Worker è pubblicato automaticamente.
- Un share link esterno legacy non esiste e non equivale a partecipazione autenticata.

## ProductCapabilityManifest

Il manifest app-local collega capability, audience, route, navigation source, API, permission, servizio, mutation, stato e test. Un test enumera le route prodotto e rifiuta route/API/action orfane. Gli endpoint runner e finalize sono `INTERNAL_ONLY` e protetti da segreto cron.

## Processi

Otto processi persistenti `@1`: invito cliente, conferma iniziale, negoziazione modifica, richiesta pagamento, chiusura, export, richiesta post-chiusura e riapertura. Usano claim atomico, lease, fencing, retry limitato, step/eventi e receipt; non esiste un Centro operativo generico.

## Compatibilità

Non esiste dual-mode. `clientName`, `JobSiteOperationalPhase`, processi legacy e route implicite non vengono reinterpretati. `Document`, `DocumentVersion`, `Evidence` ed `EvidenceRevision` restano librerie interne foundation.
