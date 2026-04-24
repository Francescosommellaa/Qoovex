# GitHub Workflows

Scopo: workflow CI/CD del monorepo.

Metti qui:
- quality gates, build validation e workflow di automazione del repository.

Non mettere qui:
- workflow duplicati che fanno lo stesso controllo;
- logica che dovrebbe stare negli script del repo.

Regole:
- i workflow devono richiamare i comandi root ufficiali;
- i controlli di regola e quality devono fallire in modo esplicito.

Workflow attivi:
- `quality.yml`: quality gate completo (`pnpm check:ci`) su ogni push, PR e run manuale.
- `command-center.yml`: esecuzione manuale da GitHub Actions di task root selezionabili (lint, type-check, build-check, audit, check completo).
