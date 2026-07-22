# Workers Pages

Pagine workspace per lista e dettaglio lavoratori. La lista mantiene una singola lettura tenant-scoped e apre creazione e riepilogo in Dialog; `/workers/new` reindirizza allo stesso modale, mentre `/workers/[nome-normalizzato]--[workerId]` resta la gestione completa. Gli URL legacy `/workers/[workerId]` continuano a funzionare.

Usano `/api/workers` per mutation client-side e service server-side per letture filtrate per azienda. L'invito opzionale dalla scheda lavoratore riusa `/api/organization/invitations` ma propone soltanto il ruolo WORKER; gli altri ruoli vengono invitati da `Utenti e inviti`. Il responsabile cantiere vede nella sidebar soltanto `Lavoratori` e la lista resta limitata ai cantieri assegnati.
