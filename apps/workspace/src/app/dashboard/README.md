# Dashboard Route

Scopo: route top-level della dashboard dopo login.

Metti qui:
- `page.tsx` e asset strettamente legati all'entrypoint dashboard.

Non mettere qui:
- view complete riusabili altrove: quelle vanno in `@views/dashboard`;
- widget generici o feature riusabili.

Regole:
- `page.tsx` compone layer inferiori;
- niente stile inline o query duplicate permanenti una volta che la route evolve.
