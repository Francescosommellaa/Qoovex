# Name Step Route

Scopo: raccogliere nome e cognome post-account prima dell'ingresso nel workspace.

Metti qui:
- UI e logica per l'upgrade del profilo Clerk gia creato;
- sincronizzazione controllata del profilo verso il database prima della dashboard.

Non mettere qui:
- logica di dominio non legata ad auth;
- componenti shared da riusare altrove.

Regole:
- la pagina deve essere sicura da refresh;
- non chiedere username nel flusso email/password: lo username e obbligatorio in signup;
- chiedere nome/cognome come step separato dopo sessione Clerk creata;
- dopo update nome/cognome, eseguire bootstrap utente nel DB.
