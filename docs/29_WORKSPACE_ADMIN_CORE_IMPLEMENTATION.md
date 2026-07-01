# 29 - Workspace Admin Core Implementation

## Cosa e stato implementato

Questa sottofase rende utilizzabile il cuore operativo del workspace:

- shell admin mobile-first;
- documenti e dettaglio documento;
- versioni documento con upload/download tramite endpoint gia protetti;
- scadenze registrate;
- lavoratori;
- cantieri.

Non sono state introdotte nuove API di dominio, nuove migration Prisma o nuovi provider storage.

## Route pagina create

- `/documents`
- `/documents/[documentId]`
- `/deadlines`
- `/workers`
- `/workers/[workerId]`
- `/job-sites`
- `/job-sites/[jobSiteId]`

La route `/dashboard` resta attiva e ora vive dentro la shell workspace.

## Componenti creati

Componenti app-local:

- `WorkspaceShell`
- `WorkspaceNavigation`
- `WorkspacePageHeader`
- `WorkspacePanel`
- `WorkspaceEmptyState`
- `WorkspaceStatusBadge`
- view e form specifici per documenti, scadenze, lavoratori e cantieri.

Questi componenti restano in `apps/workspace` perche sono specifici del prodotto. Non e stato creato `packages/ui`.

## Form creati

- form documento logico;
- form upload versione documento;
- form scadenza;
- form lavoratore;
- form cantiere.

I form sono brevi, usano label esplicite, stato loading, errori leggibili e chiamano endpoint server-side gia protetti.

## API usate

- `/api/documents`
- `/api/documents/[documentId]`
- `/api/documents/[documentId]/versions`
- `/api/documents/[documentId]/versions/[versionId]`
- `/api/documents/[documentId]/versions/[versionId]/download`
- `/api/deadlines`
- `/api/deadlines/[deadlineId]`
- `/api/workers`
- `/api/workers/[workerId]`
- `/api/job-sites`
- `/api/job-sites/[jobSiteId]`

Le letture iniziali delle pagine usano service server-side esistenti e dati filtrati per `organizationId`.

## Permessi rispettati

- `OWNER` e `ADMIN`: azioni di gestione complete per questa sottofase.
- `SAFETY_CONSULTANT`: lettura e aggiornamento documenti dove il service lo consente; niente gestione scadenze, lavoratori o cantieri.
- `SITE_MANAGER`, `WORKER`, `VIEWER`: niente workspace admin completo finche mancano filtri sicuri per risorsa.

La sicurezza resta server-side. La UI nasconde le azioni non coerenti con il ruolo quando il ruolo e noto, ma non sostituisce le policy dei service.

## Mobile-first decisions

- navigazione orizzontale compatta su mobile;
- layout single-column di default;
- form e CTA con target grandi;
- liste a card operative invece di tabelle dense;
- griglie solo da tablet/desktop;
- niente decorazioni pesanti.

## Cosa resta escluso

- UI checklist;
- UI evidence/prove;
- UI pacchetti documentali;
- UI share link/viewer;
- template normativi;
- OCR, AI, firma digitale, geolocalizzazione, presenze;
- design system condiviso.

## Rischi privacy

- Le liste lavoratori mostrano dati minimi, ma email e telefono restano dati personali: evitare esposizione a ruoli non autorizzati.
- Le note operative non devono contenere dati sanitari o informazioni non necessarie.
- I download file passano da endpoint server-side e non devono essere trasformati in link pubblici.

## Limiti noti

- Non esiste ancora un'infrastruttura di UI test browser nel repo.
- I form usano endpoint esistenti e non implementano salvataggio ottimistico.
- I link disabilitati a checklist, prove e pacchetti indicano aree fuori scope per la sottofase 11.1.

## Passaggio a 11.2

La sottofase successiva puo costruire UI per checklist, evidence, pacchetti documentali e share link partendo dalla shell admin introdotta qui.
