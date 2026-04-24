# Shared Layer

Scopo: fondamenta riusabili dell'app workspace.

Metti qui:
- api client/server shared, config, server actions comuni, utility pure e UI base app-local;
- codice che non appartiene a una singola entita` o feature ma resta interno alla workspace app.

Non mettere qui:
- dominio specifico di una singola entita`;
- feature complete;
- shared code cross-app che deve vivere in `packages`.

Regole:
- `shared` e` il layer piu` basso dell'app;
- sottocartelle separate per responsabilita`;
- niente file generici senza contesto.
