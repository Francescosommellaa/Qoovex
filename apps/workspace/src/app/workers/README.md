# Workers pages

`/workers` e la rubrica operativa della sezione Persone. Usa ricerca, filtri e paginazione server-side, mostra attenzione documentale, cantieri, stato accesso e prossima azione senza caricare l'intero dataset nel client.

`Worker` resta un profilo operativo separato da `User` e `OrganizationMembership`. `roleLabel` descrive esclusivamente la mansione: non concede permessi e non certifica qualifiche. OWNER e ADMIN possono avviare il flusso guidato in quattro passaggi: dati, accesso, cantieri, riepilogo. Il percorso consente sia solo profilo sia invito WORKER; in quest'ultimo caso il ruolo e bloccato e l'invito conserva `workerId`.

SITE_MANAGER vede solo lavoratori assegnati ai propri cantieri e riceve DTO con contatti e note oscurati. WORKER vede `Il mio profilo` tramite lo scope di `WorkerUserLink`. `/workers/new` resta compatibile e apre lo stesso flusso guidato.
