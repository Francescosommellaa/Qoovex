# Complete Profile Route

Scopo: completare i dati minimi post-OAuth necessari al bootstrap utente.

Metti qui:
- UI e logica strettamente legate alla finalizzazione profilo dopo callback SSO.

Non mettere qui:
- logica di dominio non legata ad auth;
- componenti shared da riusare altrove.

Regole:
- la pagina deve essere sicura da refresh;
- se username esiste, redirect immediato al workspace;
- dopo update username, eseguire bootstrap utente nel DB.
