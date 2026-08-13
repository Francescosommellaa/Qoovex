# 02 â€” Architecture and boundaries

## verified_current_state

`apps/web` Ã¨ marketing, `apps/workspace` Ã¨ il prodotto autenticato, `apps/sirio` documenta la foundation visuale, `packages/ui` contiene primitive generiche, `packages/db` schema/client e `packages/types` contratti platform-neutral.

Workspace usa route Azienda dirette `/`, `/job-sites`, `/people` e `/payment-profile`, perché ogni account può avere una sola membership Azienda attiva. L'identificativo Azienda non compare negli URL e non esistono route di compatibilità. La proiezione cliente resta `/client/...`. Pagine e handler `/api/job-sites/...`, `/api/people` e `/api/payment-profile` derivano l'Azienda dalla sessione sul server, poi ricontrollano membership, scope, permission e ownership prima di delegare ai servizi. La business logic e Prisma restano server-only.

## Confini

- Lâ€™Azienda possiede il `JobSite` e vede timeline interna piÃ¹ contenuti condivisi del proprio tenant.
- Il cliente possiede privatamente `ClientProperty` e collega i propri cantieri; lâ€™immobile non Ã¨ tenant e non prova proprietÃ  legale.
- Aziende differenti sullo stesso immobile non si scoprono, non condividono contenuti e vedono soltanto il proprio JobSite.
- Un allegato foundation viene condiviso solo tramite `JobSiteAttachment` e `JobSiteAttachmentPublication`; nessun file Worker Ã¨ pubblicato automaticamente.

## ProductCapabilityManifest

Il manifest app-local collega capability, audience, route, navigation source, API, permission, servizio, mutation, stato e test. Un test enumera le route prodotto e rifiuta route/API/action orfane. Gli endpoint runner e finalize sono `INTERNAL_ONLY` e protetti da segreto cron.

## Processi

Otto processi persistenti `@1`: invito cliente, conferma iniziale, negoziazione modifica, richiesta pagamento, chiusura, export, richiesta post-chiusura e riapertura. Usano claim atomico, lease, fencing, retry limitato, step/eventi e receipt; non esiste un Centro operativo generico.

## CompatibilitÃ 

Non esiste dual-mode: i contratti correnti non introducono una seconda superficie prodotto. Gli unici file runtime sono `JobSiteAttachment` contestuali a timeline, step, richieste e proposte.
