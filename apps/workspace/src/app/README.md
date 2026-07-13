# Workspace App Router

Il workspace espone route API e la prima dashboard operativa.

Route frontend attive:

- `/`: redirect a `/sign-in` se manca sessione, altrimenti a `/dashboard`;
- `/sign-in`: accesso Credentials NextAuth;
- `/sign-up`: registrazione Credentials con verifica email;
- `/invite?token=...`: ingresso destinatario per validare e accettare un invito Azienda;
- `/shared/document-packages/[token]`: viewer pubblico in sola lettura per un pacchetto condiviso;
- `/dashboard`: dashboard interna mobile-first per stato documentale, scadenze, cantieri, lavoratori, prove e pacchetti.
- `/notifications`: notifiche interne e promemoria derivati da dati registrati;
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
- `/access`: gestione collegamenti operativi e assegnazioni risorsa per OWNER/ADMIN;
- `/audit-log`: audit prodotto owner-only;
- `/data-control`: inventario dati, export metadata e retention operativa owner-only.

Regole:

- `page.tsx` compone e delega;
- business logic e query restano nei service server-side;
- nessuna route frontend deve promettere conformita, certificazione o validita legale.
