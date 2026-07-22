# Access Admin View

Composizione app-local basata sulle primitive condivise `Card`, `Field`, `Select`, `Button`, `Avatar`, `Badge` ed `Empty` per:

- assegnazione responsabile-cantiere;
- assegnazione lavoratore-cantiere.
- associazione avanzata account-profilo per gli utenti con ruolo WORKER.

Form, liste, errori e stati vuoti ripetono la stessa gerarchia. L'associazione account-profilo resta in progressive disclosure: identifica il profilo personale usato dallo scope server-side, ma non assegna o modifica il ruolo della membership.
