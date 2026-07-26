# Workspace App

Runtime Next.js del prodotto Qoovex. Contiene pagine, Auth.js/NextAuth, MFA, inviti, autorizzazioni, API, servizi server, supporto auditato e Console Qoovex.

## Stato attuale verificato

`Organization` e il tenant canonico e Azienda la label prodotto. Ogni account usa zero o una sola `OrganizationMembership`; ruolo e resource scope derivano dal server. SITE_MANAGER e WORKER restano limitati alle assegnazioni. Gli esterni usano soltanto share link tokenizzati.

Il dominio attivo comprende lavoratori, cantieri, documenti e versioni private, tipi/requisiti, scadenze, calendario, checklist, prove, pacchetti, condivisioni, notifiche, audit, export, retention e data-control. Prisma salva dati e metadati; Vercel Blob privato salva file. Le response non espongono storage key, token hash o URL permanenti.

`/dashboard` e la coda `Da fare` situation-centric. La shell role-aware contiene gruppi Documenti, Persone e Cantieri, Calendario, Preferiti, Azioni rapide, notifiche e impostazioni. Ricerca e Analisi sono disabilitate e non funzionalita attive.

Le route principali includono viste e dettagli di documenti, lavoratori e cantieri, calendario/scadenze, checklist, prove, pacchetti, notifiche, audit e data-control. I Dialog contestuali riusano route, endpoint e permessi esistenti. URL leggibili e redirect legacy restano contratti runtime.

Auth e MFA proteggono le pagine e API; il dev-auth resta limitato a development loopback. Supporto richiede MFA, motivo, durata, notifica e audit. Email, scheduled runner e Playwright usano i guardrail descritti nei documenti canonici.

## Direzione approvata

Il workspace ospitera in futuro l'orchestrazione exception-driven: processi persistenti, runner, decisioni, eccezioni, timeline e read model del centro operativo. Il dominio esistente rimarra fonte e output; le viste complete diventeranno controllo avanzato o configurazione.

Questa direzione non e implementata. Non esistono ancora entita processo, timeline operativa, ingresso/ricerca universali, OCR o AI documentale. I flussi e le route attuali non vengono rimossi da questa sola decisione documentale.

## Confini

- route handler: parsing HTTP, auth, delega al servizio e risposta;
- `src/shared/server`: accesso, servizi, repository e provider server-only;
- `src/views` e `src/app`: composizioni e superfici prodotto;
- primitive e foundation da `@qoovex/ui` tramite subpath espliciti;
- DTO condivisi in `packages/types`;
- Prisma, migration e client in `packages/db`;
- nessun `organizationId`, ruolo o permesso proveniente dal client e autorevole;
- nessuna promessa di conformita, certificazione o validita legale.

Per le fonti canoniche leggere `docs/HowToUse.md` e `docs/00_PRODUCT_AND_SCOPE.md`–`docs/08_SUPPORT_AND_DATA_CONTROL.md`.
