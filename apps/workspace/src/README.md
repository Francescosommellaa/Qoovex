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
- ogni nuova cartella sorgente richiede il suo `README.md`.
