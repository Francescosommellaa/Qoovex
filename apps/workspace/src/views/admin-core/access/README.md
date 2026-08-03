# Access Admin View

Composizione app-local basata sulle primitive condivise `Card`, `Field`, `Select`, `Button`, `Avatar`, `Badge` ed `Empty` per:

- assegnazione responsabile-cantiere;
- assegnazione lavoratore-cantiere.
- associazione avanzata tra account Collaborator e profilo operativo Worker.

Form, liste, errori e stati vuoti ripetono la stessa gerarchia. L'associazione account-profilo resta in progressive disclosure: identifica il profilo personale usato dallo scope server-side, ma non assegna o modifica il ruolo della membership.

`WORKER` non è un ruolo account e `CLIENT` non è un ruolo Azienda. Inviti cliente e partecipazione sono gestiti nel dettaglio vNext del singolo cantiere, non in questa superficie amministrativa Azienda.

Membership multiple e context switching D-VNEXT-18/20 sono implementati. Le deleghe economiche D-VNEXT-23 sono `JobSiteAuthorityGrant` job-site-scoped e non modificano membership, preset o scope amministrativi.
