# 12 - Organization Migration Plan

## Stato

Superato dal reset definitivo `27_LEGACY_RESET_AND_DB_BASELINE.md`.

## Decisione aggiornata

La migrazione conservativa non e piu la strategia attiva. Il proprietario del progetto ha deciso che il database puo essere resettato e che la baseline Prisma deve essere pulita.

## Risultato atteso

- Tabelle fisiche `Organization*`.
- Colonne `organizationId`.
- Nessun mapping di compatibilita tenant.
- Nessuna route legacy.
- Nessun alias legacy nei tipi condivisi.

## Sicurezza DB

Il reset/apply reale va eseguito solo su database locale/dev confermato o dopo backup approvato. Gli env locali rilevati puntano a host remoto `db.prisma.io`, quindi il reset non deve essere applicato automaticamente.
