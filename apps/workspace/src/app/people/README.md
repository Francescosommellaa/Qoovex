# Area Persone

Superfici canoniche:

- `/people`: panoramica server-rendered con attenzione su lavoratori, accessi e assegnazioni;
- `/workers`: profili operativi;
- `/people/access`: account, membership, ruoli, inviti e configurazioni incomplete;
- `/people/assignments`: responsabili e lavoratori organizzati per cantiere.

Le vecchie route `/settings/people`, `/settings/people/invite` e `/access` reindirizzano alle nuove superfici preservando il contratto utile. Non esiste un modello `Person` e l'area non implementa funzioni HR, paghe, presenze, dati sanitari o qualifiche automatiche.

Accesso: `OWNER` gestisce l'area; `COLLABORATOR` vede e usa soltanto le superfici abilitate dai permessi persistiti e dallo scope. `SITE_MANAGER` e `LIMITED_UPLOAD` sono preset, non ruoli membership. `Worker` resta un profilo operativo separato dall'account.
