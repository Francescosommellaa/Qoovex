# Area Persone

Superfici canoniche:

- `/people`: panoramica server-rendered con attenzione su lavoratori, accessi e assegnazioni;
- `/workers`: profili operativi;
- `/people/access`: account, membership, ruoli, inviti e configurazioni incomplete;
- `/people/assignments`: responsabili e lavoratori organizzati per cantiere.

Le vecchie route `/settings/people`, `/settings/people/invite` e `/access` reindirizzano alle nuove superfici preservando il contratto utile. Non esiste un modello `Person` e l'area non implementa funzioni HR, paghe, presenze, dati sanitari o qualifiche automatiche.

Ruoli: OWNER e ADMIN vedono tutte le superfici; SAFETY_CONSULTANT vede panoramica, lavoratori e assegnazioni in sola lettura; SITE_MANAGER vede solo i lavoratori nel proprio scope; WORKER entra da `Il mio profilo`.
