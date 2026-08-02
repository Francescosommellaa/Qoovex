# Access Admin View

Composizione app-local basata sulle primitive condivise `Card`, `Field`, `Select`, `Button`, `Avatar`, `Badge` ed `Empty` per:

- assegnazione responsabile-cantiere;
- assegnazione lavoratore-cantiere.
- associazione avanzata tra account Collaborator e profilo operativo Worker.

Form, liste, errori e stati vuoti ripetono la stessa gerarchia. L'associazione account-profilo resta in progressive disclosure: identifica il profilo personale usato dallo scope server-side, ma non assegna o modifica il ruolo della membership.

`WORKER` non e un ruolo account e `CLIENT` non e un ruolo Azienda. Inviti cliente e partecipazione per cantiere appartengono alla direzione vNext e non sono implementati in questa superficie.

Membership multiple, context switching e deleghe economiche D-VNEXT-18-23 sono concetti futuri; la vista corrente continua a gestire soltanto accessi Azienda e assegnazioni esistenti.
