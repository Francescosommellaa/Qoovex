# 14 - API Rename Report

## Stato

Superato dal reset definitivo `27_LEGACY_RESET_AND_DB_BASELINE.md`.

## Decisione aggiornata

Le route compatibili con il vecchio tenant sono state rimosse dal piano attivo. Le uniche route tenant valide sono:

- `/api/organizations`;
- `/api/organization/*`;
- `/api/support/organizations`.

## Regola attuale

Non creare nuovi wrapper legacy. Eventuali client devono usare solo endpoint `organization`.
