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
- importa sempre verso il basso: `shared -> entities -> features -> widgets -> views -> app`;
- ogni cartella manuale di `src` deve avere il suo `README.md`;
- nessun file generico (`helpers.ts`, `utils.ts`, `misc.ts`, `temp.ts`);
- `app/(auth)/ui` e` una eccezione route-local: resta dentro il route group auth e non diventa API condivisa;
- non costruire pagine, shell prodotto o feature finche` le fondamenta non sono stabili.

Guardrail:
- `pnpm check:repo` esegue il guard locale su README, import FSD, naming e confine Clerk;
- `pnpm check:fast` combina guard repo, lint e type-check.

Ordine file: segui il Brain canonico `00_System/code-patterns.md`.
