# Operational Protocol

Qoovex e il sistema piu semplice per piccole imprese e subappaltatori che devono tenere pronti documenti, scadenze e prove di cantiere.

## Fonti

1. `/docs/00_PRODUCT_RESET.md`.
2. `/docs/09_DOMAIN_NAMING_AND_PERMISSIONS.md`.
3. `/docs/11_STORAGE_AND_DATABASE_DECISIONS.md`.
4. Codice reale.

## Regole

- `Organization` e il tenant tecnico canonico futuro; "Azienda" e la label prodotto.
- `apps/workspace` resta nome tecnico dell'app, non concetto prodotto principale.
- Auth, MFA, membership, inviti, audit e supporto restano confinati in `apps/workspace`.
- Query DB solo in moduli server autorizzati.
- Prisma resta il database layer vincolante.
- Blob resta lo storage vincolante per file, documenti, foto e prove.
- Non inventare normative, documenti ufficiali o scadenze.
- Non promettere conformita, certificazione o validita legale.
- Nessun reset di dominio puo cancellare dati auth o migrazioni Prisma.
- Non rinominare valori Prisma persistiti senza migrazione conservativa dedicata.
