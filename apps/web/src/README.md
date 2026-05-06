# Web Source

Scopo: sorgente del sito marketing Qoovex (`apps/web`).

Struttura:
- `app/` — routing Next.js App Router, layout e pagine marketing
- `shared/` — componenti, sezioni e animazioni riusabili internamente ad `apps/web`

Regole:
- usa `app/` per routing, layout e pagine
- usa `shared/` per componenti e sezioni riusabili dentro `apps/web`
- il codice condiviso tra più app va in `packages/*`, non qui
- ogni sottocartella creata manualmente deve avere il suo `README.md`
- nessuna business logic del workspace in questa app