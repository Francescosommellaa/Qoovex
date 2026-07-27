# Workspace App

Runtime Next.js autenticato del prodotto Qoovex. Contiene Centro operativo, motore persistente exception-driven, Auth.js/NextAuth, MFA, inviti, autorizzazioni, API, servizi server, supporto auditato e Console Qoovex.

## Stato attuale verificato

`Organization` e il tenant canonico e Azienda la label prodotto. Ogni account usa zero o una sola `OrganizationMembership`; ruolo e resource scope derivano dal server. SITE_MANAGER e WORKER restano limitati alle assegnazioni. Gli esterni usano soltanto share link tokenizzati.

Il dominio comprende lavoratori, cantieri, documenti e versioni private, tipi/requisiti, scadenze, calendario, checklist, prove, pacchetti, condivisioni, notifiche, audit, export, retention e data-control. Prisma salva dati e metadati; Vercel Blob privato salva file. Le response non espongono storage key, token hash o URL permanenti.

`/dashboard` resta compatibile e presenta il Centro operativo. La navigazione primaria e ridotta a Centro operativo, Documenti, Lavoratori, Cantieri, Pacchetti quando autorizzato e Impostazioni. Notifiche e account restano nella topbar. L'ingresso universale compone i flussi controllati esistenti e non introduce un endpoint generico.

`/operations/[processId]` mostra step, timeline, decisioni, eccezioni e artifact autorizzati. Le viste dominio espongono lo stato operativo collegato e mantengono le route CRUD utili come controllo avanzato.

## Motore operativo

Il registry server-side versionato contiene `DOCUMENT_RECEIVED@1`, `WORKER_CREATED@1`, `JOB_SITE_CREATED@1` e `CONTINUOUS_CONTROL@1`. Il lifecycle centralizzato usa idempotenza, claim atomico, lease di cinque minuti, fencing, massimo cinque tentativi, backoff 1/5/15/60 minuti, snapshot minimizzati ed effect receipt.

Il runner usa l'infrastruttura scheduled esistente e `CRON_SECRET`. Affidabilita e impatto sono derivati dal server: il client non puo impostare liberamente stati o transizioni. Le decisioni e i retry richiedono il permesso della mutazione sottostante; le eccezioni oggettive non sono chiudibili manualmente.

## Confini

- route handler: parsing HTTP, auth, delega al servizio e risposta;
- `src/shared/server`: infrastruttura server-only riusabile nell'app;
- `src/features/operational-engine`: lifecycle, policy, automazioni e read model;
- `src/entities`, `src/views` e `src/app`: read model, composizioni e routing;
- primitive e foundation da `@qoovex/ui` tramite subpath espliciti;
- DTO condivisi in `packages/types`; Prisma e migration in `packages/db`;
- nessun `organizationId`, ruolo o permesso proveniente dal client e autorevole;
- nessuna promessa di conformita, certificazione o validita legale.

OCR, AI, ricerca universale, nuovi canali, retention automatica, SLA e limiti commerciali restano fuori perimetro. La foundation Geist/Tabler/light-dark-system resta invariata.

Per le fonti canoniche leggere `docs/HowToUse.md` e `docs/00_PRODUCT_AND_SCOPE.md`-`docs/08_SUPPORT_AND_DATA_CONTROL.md`.
