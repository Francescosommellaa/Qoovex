# Sign-In Route

Scopo: contenitore della route pubblica `/sign-in`.

Metti qui:
- solo file necessari al flusso di accesso Clerk.

Non mettere qui:
- logica condivisa con altre route;
- UI prodotto post-login.

Regole:
- mantieni la route minimale;
- se serve riuso con sign-up, estrai nel layer corretto e non duplicare.
