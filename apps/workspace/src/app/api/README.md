# Workspace API Routes

Scopo: route handler server-side dell'app workspace.

Metti qui:
- `route.ts` per endpoint HTTP dell'app;
- validazione input, autenticazione, delega a funzioni del layer corretto.

Non mettere qui:
- logica business corposa;
- utility pure riusabili o query duplicate sparse.

Regole:
- un endpoint per cartella;
- nome cartella coerente con la risorsa o il caso d'uso;
- ordine file secondo `docs/CodePatterns.md`.
