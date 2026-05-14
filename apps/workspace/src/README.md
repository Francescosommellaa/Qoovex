# Workspace Source

Scopo: sorgente della web app con architettura FSD rigorosa.

Metti qui:
- `app/` per entrypoint Next;
- `shared/`, `entities/`, `features/`, `widgets/`, `views/` per il codice prodotto.

Non mettere qui:
- cartelle generiche senza ruolo architetturale;
- shared code cross-app che appartiene ai `packages`.

Regole:
- l'ordine dei layer e`: `shared -> entities -> features -> widgets -> views -> app`;
- nessun import verso l'alto;
- ogni nuova cartella sorgente richiede il suo `README.md`;
- le route in `app/` devono comporre layer inferiori e delegare logica lunga;
- `shared` non importa da altri layer workspace;
- `entities` importa solo da `shared`, package e dalla stessa entita`;
- `features` importa da `entities` e `shared`;
- `widgets` importa da `features`, `entities` e `shared`;
- `views` importa da `widgets`, `features`, `entities` e `shared`;
- `app` puo` importare da tutti i layer inferiori.
