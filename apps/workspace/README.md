# Workspace App

Runtime API-only di Qoovex. Conserva autenticazione, tenant `Organization`, membership, inviti, autorizzazioni e sessioni di supporto auditato.

Il dominio prodotto usa `Organization` come tenant canonico e "Azienda" come label utente. La baseline Prisma pulita usa tabelle fisiche `Organization*` e colonne `organizationId`.

Contiene route API, NextAuth, servizi, repository, regole di dominio, dashboard operativa e workspace admin core mobile-first.

La route privata `/qoovex-admin` e la relativa API `/api/platform-admin/*` formano la Console Qoovex per `SUPER_ADMIN`, visibile come Operatore Qoovex. Include gestione prudente degli account, supporto auditato e registro Prisma aggregato degli errori server; non espone credenziali, token o contenuti documentali.

Le route `/sign-in` e `/sign-up` rendono provabile il workspace con NextAuth Credentials. La root `/` manda utenti non autenticati al login e utenti autenticati alla dashboard. Se un utente autenticato non ha ancora una Organization attiva, la UI mostra il setup minimo azienda e usa `POST /api/organizations`.

La route `/invite?token=...` mantiene il token durante accesso o registrazione e delega l'accettazione all'API protetta. La route `/shared/document-packages/[token]` rende invece il viewer esterno in sola lettura; l'API `/api/shared/*` resta il confine dati e download, non il link da consegnare al destinatario.

In development locale la pagina `/sign-in` mostra `Accedi come dev` soltanto su host loopback. Il cookie firmato richiede `DEV_AUTH_SECRET` e attribuisce `SUPER_ADMIN` solo a runtime all'identita seed, senza modificare il ruolo persistito.

La route `/dashboard` e la prima esperienza prodotto reale. La dashboard legge un payload sintetico da service server-side e non espone `blobKey`, `tokenHash`, token raw o URL permanenti.

Il workspace admin core espone pagine prodotto per `/documents`, `/deadlines`, `/workers` e `/job-sites`, con dettaglio documento/lavoratore/cantiere. L'estensione admin aggiunge `/checklists`, `/evidence` e `/document-packages`, inclusa gestione voci checklist, prove e share link. La pagina `/notifications` mostra promemoria interni derivati da scadenze registrate, stati documentali, pacchetti e share link. La rifinitura UX mantiene nav completa, layout mobile-first, empty state, error/loading states e controlli statici su copy e dati sensibili. Le mutation usano endpoint API gia protetti e la UI non invia `organizationId` dal client.

Il primo modulo dominio attivo espone API server-side per `DocumentType`, `Document` e `Deadline`. I documenti sono record logici e le scadenze sono date registrate dall'utente.

Le versioni file dei documenti usano Vercel Blob privato tramite `@vercel/blob`. Prisma salva solo metadati `DocumentVersion` e `blobKey`; la route di download legge il Blob lato server e non restituisce URL permanenti. Runtime Blob richiede le variabili standard dello SDK Vercel, ad esempio `BLOB_READ_WRITE_TOKEN` oppure OIDC Vercel con `BLOB_STORE_ID` dove disponibile.

Le API Worker e JobSite gestiscono solo metadati operativi minimi, filtrati per `Organization`. Non gestiscono presenze, geolocalizzazione, dati sanitari o assegnazioni operative.

Le API Checklist ed Evidence gestiscono checklist configurabili, voci operative e prove di cantiere. Evidence `PHOTO` e `FILE` salvano file su Vercel Blob privato e metadata su Prisma; le response non espongono URL permanenti.

Le API DocumentPackage e ShareLink permettono di preparare pacchetti documentali pronti per revisione e link revocabili in sola lettura. Il token raw viene restituito solo alla creazione, il database salva solo `tokenHash`, e il viewer vede solo gli item inclusi senza URL Blob permanenti.

Le API Notifications e Reminders generano notifiche interne idempotenti da dati gia registrati. Il primo livello email consente solo anteprima e invio manuale a se stessi di digest o singola notifica, riusando Resend gia configurato e senza allegati, link download, SMS, WhatsApp o push native. Le preferenze email sono opt-in, registrano un delivery log minimale e possono essere usate da `GET /api/reminders/email-digest/run`, protetta da `CRON_SECRET` tramite header Bearer. Lo scheduler vive in GitHub Actions.

La route `/audit-log` e l'API `/api/audit-log` espongono al solo `OWNER` un audit prodotto minimizzato. Gli eventi vengono scritti dai service server-side come best-effort e non salvano contenuti file, body email, token o riferimenti privati di storage. `next.config.ts` applica header HTTP base: nosniff, referrer policy, frame deny e permissions policy restrittiva.

La route `/access` permette a `OWNER` e `ADMIN` di creare collegamenti operativi utente-lavoratore e assegnazioni cantiere. `SITE_MANAGER` e `WORKER` leggono solo risorse assegnate tramite filtri server-side; la lettura esterna resta confinata agli share link.

La route `/data-control` e le API `/api/data/*` sono owner-only e mostrano inventario dati, export metadata JSON e retention operativa. L'inventario e l'export coprono anche tipi/requisiti documento, membership e inviti, job data-control, supporto e metadata auth attribuibili. L'export usa DTO allow-list e non include file, allegati, `blobKey`, pathname, token, hash, URL Blob, body email o segreti provider. La retention non cancella automaticamente nulla e non elimina Blob.

Boundary:
- i servizi server-specifici restano in `src/shared/server`;
- le route API validano e delegano ai servizi;
- la UI specifica del prodotto resta app-local e compone le primitive generiche di `@qoovex/ui`; page header, record, filtri e gruppi azione non vengono promossi senza riuso cross-app;
- i DTO condivisi vivono in `packages/types`;
- Prisma schema, migrations e client vivono in `packages/db`;
- componenti UI generici futuri dovranno uscire verso `packages/ui` solo quando riusabili e rappresentati in Sirio;
- asset brand canonici futuri dovranno uscire verso `packages/brand`.

Regole:
- import sempre verso layer inferiori;
- ogni cartella manuale in `src` richiede `README.md`;
- nessun file generico;
- accesso DB solo nei moduli server consentiti;
- `src/proxy.ts` intercetta esclusivamente `/api/**`.
- nessun nuovo dominio food o reparto legacy;
- nessuna promessa di conformita o validita legale.

Per nominare manualmente il primo dipendente Qoovex:

```sql
UPDATE "User"
SET "platformRole" = 'SUPER_ADMIN', "authVersion" = "authVersion" + 1
WHERE "email" = 'account@qoovex.com';
```

La promozione non e esposta da alcuna API pubblica.
