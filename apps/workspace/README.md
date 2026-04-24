# Workspace App

Scopo: web app principale di Qoovex workspace.

Metti qui:
- prodotto operativo: ricette, menu, shopping list, work plan, explore, settings, onboarding;
- routing, bootstrapping auth e composizione dei layer FSD.

Non mettere qui:
- marketing site;
- codice shared che puo` vivere in `packages/*`.

Regole:
- FSD rigorosa in `src`;
- importa sempre verso il basso;
- ogni cartella manuale di `src` deve avere il suo `README.md`.

Ordine file: segui `docs/CodePatterns.md`.
