# Workspace API Routes

Scopo: route handler server-side dell'app workspace.

Metti qui:
- `route.ts` per endpoint HTTP dell'app;
- validazione input, autenticazione, delega a funzioni del layer corretto.

Non mettere qui:
- logica business corposa;
- utility pure riusabili o query duplicate sparse.

Regole:
- un endpoint per cartella;
- nome cartella coerente con la risorsa o il caso d'uso;
- ordine file secondo `docs/CodePatterns.md`.

Endpoint dominio MVP attivi:
- `dashboard`: payload sintetico per la dashboard operativa interna;
- `document-types`: tipi documento configurabili, senza preset normativi;
- `documents`: documenti logici e versioni file con Blob privato;
- `deadlines`: scadenze registrate dall'utente o collegate a documenti;
- `workers`: lavoratori con metadati operativi minimi;
- `job-sites`: cantieri senza geolocalizzazione o presenze;
- `checklists`: checklist operative configurabili e voci completabili;
- `evidence`: note, foto e file operativi con Blob privato e download autorizzato;
- `document-packages`: pacchetti documentali, item inclusi e share link revocabili;
- `shared/document-packages`: accesso viewer tokenizzato e limitato al singolo pacchetto.
