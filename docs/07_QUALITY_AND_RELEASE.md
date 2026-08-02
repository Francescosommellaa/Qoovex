# 07 — Qualità e release

## Acceptance foundation-only

- schema, tipi, route, navigazione, servizi, audit, notifiche e data-control non contengono contratti legacy;
- route eliminate sono 404 senza redirect;
- auth, MFA, Azienda, accessi, Worker, assegnazioni, JobSite minimo, file/prove private, audit, supporto e tenant isolation restano coperti;
- nessuna capability vNext è implementata o simulata;
- Web e Sirio non presentano il prodotto precedente come attivo.

## Gate

Richiesti: Prisma format/validate/generate/status/diff/verify, migration fresh e upgrade, type-check, unit/integration, build Workspace/Web/Sirio, audit dipendenze, route manifest, `pnpm check:fast`, `pnpm check`, `git diff --check`; `pnpm check:ci` solo con ambiente E2E locale attestato.

## Release hard stop

Preview e Production non ricevono la migration in questo task. Nessun commit finale, push, PR o deploy senza autorizzazione separata.
