# 10 - Legacy Refactor Plan

## Stato

Superato dal reset definitivo `27_LEGACY_RESET_AND_DB_BASELINE.md`.

## Decisione

Il progetto non mantiene piu compatibilita con il vecchio dominio tecnico o prodotto. Non sono previsti wrapper, alias o mapping di transizione.

## Regola attuale

Il codice nuovo e runtime deve usare solo naming canonico:

- `Organization`;
- `OrganizationMembership`;
- `OrganizationInvitation`;
- `organizationId`;
- ruoli `OWNER`, `ADMIN`, `SAFETY_CONSULTANT`, `SITE_MANAGER`, `WORKER`, `VIEWER`.
