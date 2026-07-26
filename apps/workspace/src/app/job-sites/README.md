# Job Sites Pages

Pagine Workspace per lista, anteprima e gestione cantieri. La lista apre creazione e dettaglio rapido in Dialog; la gestione completa usa uno slug leggibile con ID stabile e mantiene compatibili gli URL legacy.

`/job-sites` e la panoramica decisionale dei cantieri accessibili. Le fasi, la coda di attenzione e l'attivita recente derivano da record esistenti con un numero di query indipendente dal numero di righe.

`/job-sites/all` gestisce ricerca, filtri e paginazione server; `/job-sites/archive` e una superficie di consultazione senza ripristino. Il Dialog di creazione usa `/api/job-sites` e registra fase e assegnazioni con una write annidata tenant-safe.
