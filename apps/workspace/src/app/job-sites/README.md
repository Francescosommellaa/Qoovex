# Job Sites Pages

Pagine Workspace per lista, anteprima e gestione cantieri. La lista apre creazione e dettaglio rapido in Dialog; la gestione completa usa uno slug leggibile con ID stabile e mantiene compatibili gli URL legacy.

Stato corrente verificato: il cantiere usa `clientName` testuale e `JobSiteOperationalPhase`; non esistono partecipazione cliente account, cliente principale, immobili, conferma iniziale o chiusura reciproca. Questi concetti appartengono alla direzione vNext approvata e sono `conceptual_not_implemented`.

D-VNEXT-41 e D-VNEXT-42 preservano questi campi durante il rollout: nessun matching crea account da `clientName` e `COMPLETED` non viene reinterpretato come accordo reciproco.

`/job-sites` e la panoramica decisionale dei cantieri accessibili. Le fasi, la coda di attenzione e l'attivita recente derivano da record esistenti con un numero di query indipendente dal numero di righe.

`/job-sites/all` gestisce ricerca, filtri e paginazione server; `/job-sites/archive` e una superficie di consultazione senza ripristino. Il Dialog di creazione usa `/api/job-sites` e registra fase e assegnazioni con una write annidata tenant-safe.
