# (workspace)

Route group autenticato per le pagine prodotto che richiedono la shell workspace.

Metti qui:
- layout con `WorkspaceShell`;
- route prodotto autenticate.

Non mettere qui:
- route auth pubbliche;
- feature logic o widget riusabili.

Regole:
- il layout autentica, prepara il summary utente e monta la shell;
- le pagine restano sottili e compongono contenuto.
