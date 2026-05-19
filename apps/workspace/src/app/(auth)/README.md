# Workspace Auth Routes

Scopo: organizzazione interna delle route Clerk senza esporre `(auth)` nell'URL pubblico.

Metti qui:
- sole route di autenticazione, provider-specific e file strettamente legati a sign-in/sign-up.

Non mettere qui:
- feature prodotto;
- logica business del workspace.

Regole:
- URL pubblici restano `/sign-in` e `/sign-up`;
- il profilo richiesto per il bootstrap viene raccolto in `/sign-up`;
- niente altro routing prodotto in questa route group.
