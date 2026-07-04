# Workspace Admin UX Refinement

Data: 2026-07-02.

## Cosa e stato rifinito

Questa sottofase rifinisce l'admin MVP esistente senza aggiungere moduli prodotto, API, provider, Prisma o package condivisi.

Le modifiche sono limitate a:

- navigazione workspace;
- responsive mobile-first;
- coerenza di card, form, bottoni e stati;
- test statici di copy, sicurezza e routing;
- documentazione finale dell'admin MVP.

## Route controllate

- `/dashboard`
- `/documents`
- `/documents/[documentId]`
- `/deadlines`
- `/workers`
- `/workers/[workerId]`
- `/job-sites`
- `/job-sites/[jobSiteId]`
- `/checklists`
- `/checklists/[checklistId]`
- `/evidence`
- `/document-packages`
- `/document-packages/[packageId]`

## Navigazione

La shell admin mantiene link attivi a:

- Dashboard;
- Documenti;
- Scadenze;
- Lavoratori;
- Cantieri;
- Checklist;
- Prove;
- Pacchetti.

La navigazione resta orizzontale e scrollabile su mobile, con stato corrente tramite `aria-current`.

## Miglioramenti mobile

- La navigazione usa elementi touch-friendly e scroll stabile.
- Le azioni usano bottoni allineati e con area minima coerente.
- I form restano in colonna su mobile.
- Card e campi hanno `min-width: 0` dove serve per evitare overflow.
- I titoli pagina non scalano piu direttamente con la larghezza viewport.

## Miglioramenti desktop

- Le griglie esistenti restano a due colonne solo sopra breakpoint desktop/tablet.
- Header e pannelli mantengono lo stesso ritmo visivo della dashboard e delle pagine admin core.
- I form annidati nelle azioni restano leggibili senza comprimere i controlli.

## Empty, error e loading states

I test statici verificano gli empty state principali per:

- documenti;
- scadenze;
- lavoratori;
- cantieri;
- checklist;
- prove;
- pacchetti.

I form e le azioni principali mantengono:

- stato `pending`;
- submit disabilitato durante invio;
- messaggio errore leggibile;
- refresh o navigazione dopo successo.

## Accessibilita

La UI usa:

- link reali per navigazione;
- bottoni reali per azioni;
- label visibili nei form principali;
- input file accessibile per upload documento/evidence;
- focus visibile su campi e bottoni;
- stato disabilitato chiaro.

## Sicurezza UI

I test statici coprono l'assenza di:

- `blobKey`;
- `tokenHash`;
- `downloadUrl`;
- token raw persistente;
- copy vietato nel codice UI attivo.

Il valore copiabile dello share link resta confinato al form di creazione immediata. La lista share link non contiene il valore copiabile.

## Escluso

- Nessuna nuova API.
- Nessuna modifica Prisma.
- Nessuna migration o seed.
- Nessun viewer UI pubblico completo.
- Nessuna nuova feature backend.
- Nessun design system condiviso.
- Nessun nuovo provider storage.

## Rischi aperti

- La verifica browser dipende dalla disponibilita del dev server e del runtime locale.
- I ruoli SITE_MANAGER e WORKER restano senza admin completo finche non esistono filtri per risorsa.
- Servono test browser veri per coprire interazioni complete con dati reali, upload Blob e share link end-to-end.

## Prossima fase consigliata

Eseguire prova manuale guidata con un account OWNER/ADMIN su database dev allineato alla baseline, creando un flusso completo: cantiere, lavoratore, documento, versione file, checklist, evidence, pacchetto e share link.
