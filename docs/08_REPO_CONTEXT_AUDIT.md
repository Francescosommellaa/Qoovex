# 08 - Repo Context Audit

## Stato

Documento storico. L'audit originario ha identificato tracce del vecchio dominio prodotto e ha portato al reset definitivo documentato in `27_LEGACY_RESET_AND_DB_BASELINE.md`.

## Decisione successiva

La compatibilita tecnica con il vecchio tenant non e piu attiva. Il repo deve usare solo:

- `Organization`;
- `OrganizationMembership`;
- `OrganizationInvitation`;
- `organizationId`;
- route `/api/organization*`;
- ruoli MVP nuovi.

## Residui ammessi

I riferimenti al vecchio dominio possono restare solo come nota storica nei report di reset/audit e nei test che impediscono regressioni.
