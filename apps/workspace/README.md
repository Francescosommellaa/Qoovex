# Workspace App

Runtime Next.js autenticato del prodotto Qoovex. Contiene Centro operativo, motore persistente exception-driven, Auth.js/NextAuth, MFA, inviti, autorizzazioni, API, servizi server, supporto auditato e Console Qoovex.

## Stato attuale verificato

`Organization` e il tenant canonico e Azienda la label prodotto. Ogni account usa zero o una sola `OrganizationMembership`. Il ruolo organizzativo e `OWNER` o `COLLABORATOR`; preset, permessi persistiti, scadenza e resource grant restano separati e derivano dal server. `Worker` non e un account. `SUPPORT_AGENT` e `PLATFORM_ADMIN` sono ruoli piattaforma separati. Gli esterni usano soltanto share link tokenizzati.

Il dominio comprende lavoratori, cantieri, documenti e versioni private, tipi/requisiti, scadenze, calendario, checklist, prove, pacchetti, condivisioni, notifiche, audit, export, retention e data-control. Prisma salva dati e metadati; Vercel Blob privato salva file. Le response non espongono storage key, token hash o URL permanenti.

`/dashboard` resta compatibile e presenta il Centro operativo. La navigazione primaria contiene soltanto destinazioni autorizzate. La ricerca metadata-only e un modale consultivo separato dalla navigazione e apribile anche con `Ctrl/Cmd+K`; `/search` non e una pagina prodotto. La card `Azioni rapide` nel footer raccoglie le principali mutazioni manuali consentite dai permessi. `/document-packages` resta la route delle Condivisioni; notifiche e account restano nella topbar.

`/operations/[processId]` mostra step, timeline, decisioni, eccezioni e artifact autorizzati. Le viste dominio espongono lo stato operativo collegato e mantengono le route CRUD utili come controllo avanzato.

## Motore operativo

Il registry server-side versionato contiene `DOCUMENT_RECEIVED@1`, `WORKER_CREATED@1`, `JOB_SITE_CREATED@1`, `CONTINUOUS_CONTROL@1` e `DOCUMENT_PACKAGE_SHARING@1`. Il lifecycle centralizzato usa idempotenza, claim atomico, lease di cinque minuti, fencing, massimo cinque tentativi, backoff 1/5/15/60 minuti, snapshot minimizzati ed effect receipt.

Lo spazio operativo contestuale aggiunge profilo e contatti azienda, lifecycle esplicito delle versioni, link documento-cantiere, assegnazioni storiche, prove classificate/revisionate, richieste, messaggi, timeline e fonti manuali guidate. File e sensibilita richiedono permessi distinti; Support resta metadata-only. La migration `20260728030000_operational_workspace_expansion` e presente ma non va dichiarata distribuita finche il wrapper, Prisma e i workflow remoti non sono verdi.

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

OCR, AI, ricerca nei file o semantica, nuovi canali, retention automatica, SLA e limiti commerciali restano fuori perimetro. La foundation Geist/Tabler/light-dark-system resta invariata.

La ricerca attiva consulta soltanto metadati autorizzati e non persiste le query. Le timeline aggregate usano `OperationalEvent` e restano separate dall'audit tecnico. La condivisione richiede preparazione, review e conferma umana; revisioni e link approvati non vengono riscritti da mutazioni successive. Ricerca nei file/semantica, condivisione automatica e tracking aggiuntivo restano fuori perimetro.

Per le fonti canoniche leggere `docs/HowToUse.md` e `docs/00_PRODUCT_AND_SCOPE.md`-`docs/08_SUPPORT_AND_DATA_CONTROL.md`.
