# Recent Searches API

Scopo: endpoint delle ricerche recenti utente.

Metti qui:
- solo il route handler di questa risorsa;
- parsing HTTP, auth, chiamata service e response.

Non mettere qui:
- hook client;
- UI;
- logica riusabile non specifica dell'endpoint.

Regole:
- validazione input chiara;
- nessun import diretto da `@qoovex/db`;
- delega use case a `@shared/server/recent-search-service`;
- il service delega la persistenza a `@shared/server/repositories/recent-search-repository`.
