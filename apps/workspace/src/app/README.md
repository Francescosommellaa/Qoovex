# Workspace App Router

Il workspace espone route API e la prima dashboard operativa.

Route frontend attive:

- `/`: redirect a `/dashboard`;
- `/dashboard`: dashboard interna mobile-first per stato documentale, scadenze, cantieri, lavoratori, prove e pacchetti.
- `/documents`: lista e creazione documenti logici;
- `/documents/[documentId]`: dettaglio documento, versioni file e upload protetto;
- `/deadlines`: lista e gestione scadenze registrate;
- `/workers`: lista e creazione lavoratori;
- `/workers/[workerId]`: dettaglio lavoratore;
- `/job-sites`: lista e creazione cantieri;
- `/job-sites/[jobSiteId]`: dettaglio cantiere.
- `/checklists`: lista e creazione checklist configurabili;
- `/checklists/[checklistId]`: dettaglio checklist e gestione voci;
- `/evidence`: lista e creazione prove operative;
- `/document-packages`: lista e creazione pacchetti documentali;
- `/document-packages/[packageId]`: dettaglio pacchetto, item e share link.

Regole:

- `page.tsx` compone e delega;
- business logic e query restano nei service server-side;
- nessuna route frontend deve promettere conformita, certificazione o validita legale.
