# 27 - Legacy Reset e Baseline DB Pulita

## Decisione del proprietario

Il vecchio Qoovex non ha utenti reali o dati importanti da preservare. Il repo deve diventare coerente solo con il nuovo prodotto:

> Qoovex e il sistema piu semplice per piccole imprese e subappaltatori che devono tenere pronti documenti, scadenze e prove di cantiere.

## Sicurezza database

Env rilevati:

- `packages/db/.env`;
- `apps/workspace/.env.local`.

Gli URL puntano a host remoto `db.prisma.io` con SSL. Segreti e credenziali non devono essere riportati nei log o nei documenti.

Classificazione: database remoto, ambiente non determinabile dal repo.

Decisione operativa: non eseguire reset/drop/apply distruttivi sul database reale da questa sessione.

## Cosa e stato eliminato o convertito

- Compatibilita runtime con vecchi wrapper tenant.
- Alias nei tipi condivisi.
- Mapping Prisma di compatibilita tenant.
- Migration storiche legacy sostituite da baseline pulita.
- Documenti prodotto legacy eliminati dal repo.

## Nuova baseline Prisma

La baseline pulita vive in:

`packages/db/prisma/migrations/20260701000000_clean_organization_baseline/migration.sql`

Lo schema usa:

- `Organization`;
- `OrganizationMembership`;
- `OrganizationInvitation`;
- `organizationId`;
- ruoli `OWNER`, `ADMIN`, `SAFETY_CONSULTANT`, `SITE_MANAGER`, `WORKER`, `VIEWER`.

I mapping Auth.js standard restano per compatibilita con NextAuth/Auth.js:

- `accounts`;
- `sessions`;
- `verification_tokens`.

## Route legacy rimosse

Sono state rimosse dal runtime le route compatibili con il vecchio tenant. Restano solo route canoniche `organization` e route dominio MVP.

## Documenti legacy rimossi

- `docs/ProductContext.md`;
- `docs/event-operations.md`.

Non sono stati spostati in cartelle legacy.

## Residui ammessi

Riferimenti al vecchio dominio possono restare solo:

- in questo report;
- nei report storici segnati come superati;
- nei test di guardrail che verificano l'assenza di naming legacy da schema e baseline.

Non devono restare nel codice runtime attivo.

## Applicazione manuale su DB locale/dev

Eseguire solo dopo aver configurato un database locale/dev o dopo backup approvato:

```bash
pnpm --filter @qoovex/db exec prisma migrate reset
```

Non eseguire su production o su database remoto non classificato.

## Rischi

- Il DB remoto configurato potrebbe essere staging o production: non e stato toccato.
- Eventuali client esterni che chiamavano vecchie route tenant devono usare le route `organization`.
- I dati esistenti in un DB vecchio non sono migrati: la strategia scelta e reset pulito.

## Conferma

Il repo deve proseguire solo con il nuovo dominio Qoovex: documenti, scadenze e prove di cantiere per piccole imprese e subappaltatori.
