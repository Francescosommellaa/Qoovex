# Organization Migration Plan

Data: 2026-06-29.

## Obiettivo

Migrare il cuore tecnico da `Structure*` a `Organization*` senza rinominare fisicamente tabelle e colonne storiche in questa fase.

Qoovex resta:

> Il sistema piu semplice per piccole imprese e subappaltatori che devono tenere pronti documenti, scadenze e prove di cantiere.

## Stato attuale prima della migrazione

Il repo usava:

- `Structure`;
- `StructureMembership`;
- `StructureInvitation`;
- `StructureRole`;
- valori ruolo `ADMIN`, `HEAD_OF_HALL`, `HEAD_CHEF`, `KITCHEN_CREW`;
- route `/api/structures` e `/api/structure/*`;
- policy basata su permessi `structure:*`, `hall:*`, `kitchen:*`, `crew:*`.

Questi nomi derivano dal vecchio dominio e non devono guidare nuove decisioni.

## Modelli Prisma coinvolti

Modelli migrati nel client Prisma:

- `Organization` mappato sulla tabella fisica `"Structure"`;
- `OrganizationMembership` mappato sulla tabella fisica `"StructureMembership"`;
- `OrganizationInvitation` mappato sulla tabella fisica `"StructureInvitation"`;
- `SupportSession.organizationId` mappato sulla colonna fisica `"structureId"`;
- `SupportAuditEvent.organizationId` mappato sulla colonna fisica `"structureId"`.

Le tabelle fisiche non sono state rinominate. Questo evita una migrazione distruttiva e mantiene compatibilita con la baseline storica.

## Enum coinvolti

Il vecchio enum DB `StructureRole` viene sostituito da `OrganizationRole`.

Valori runtime finali:

- `OWNER`;
- `ADMIN`;
- `SAFETY_CONSULTANT`;
- `SITE_MANAGER`;
- `WORKER`;
- `VIEWER`.

Mapping dati applicato dalla migration:

| Valore legacy | Valore nuovo |
| --- | --- |
| `ADMIN` | `OWNER` |
| `HEAD_CHEF` | `OWNER` |
| `HEAD_OF_HALL` | `ADMIN` |
| `KITCHEN_CREW` | `WORKER` |

`ADMIN -> OWNER` preserva il ruolo proprietario creato dalla baseline precedente.

## Route coinvolte

Nuove route principali:

- `/api/organizations`;
- `/api/organization/members`;
- `/api/organization/invitations`;
- `/api/organization/invitations/accept`;
- `/api/support/organizations`.

Route legacy mantenute come compatibilita:

- `/api/structures`;
- `/api/structure/members`;
- `/api/structure/invitations`;
- `/api/structure/invitations/accept`;
- `/api/support/structures`.

Le route legacy devono essere considerate deprecate e puntano ai servizi Organization.

## Servizi coinvolti

Servizi Organization attivi:

- `organization-access-service.ts`;
- `organization-invitation-service.ts`;
- `authorization-policy.ts`;
- `access-context-service.ts`;
- `support-access-service.ts`.

Wrapper legacy temporanei:

- `structure-access-service.ts`;
- `structure-invitation-service.ts`;
- route `/api/structure*`.

## Strategia conservativa

- Non modificare migrazioni storiche.
- Non cancellare dati.
- Non rinominare tabelle fisiche in questa fase.
- Usare mapping Prisma `@@map` e `@map`.
- Convertire i valori ruolo con una migration dedicata.
- Mantenere wrapper API legacy mentre i client migrano alle route Organization.

## Migrato in questa sessione

- Tipi runtime principali in `packages/types` allineati a `Organization`.
- Prisma schema usa modelli `Organization*` con mapping su tabelle fisiche legacy.
- Migration nuova per convertire i ruoli persistiti.
- Policy server-side riscritta con permessi canonici.
- Servizi membership, inviti e supporto portati a Organization.
- Route Organization aggiunte.
- Route Structure mantenute come wrapper deprecati.

## Temporaneamente legacy

- Nomi fisici DB `"Structure"`, `"StructureMembership"`, `"StructureInvitation"` e colonne `"structureId"`.
- Baseline migration storica con `StructureRole`.
- Route legacy `/api/structure*` e `/api/structures`.
- Alias TypeScript `StructureRole`, `StructureSummary`, `CreateStructureInput`.

## Rischi residui

- La migration enum va verificata su un database reale prima del deploy.
- Eventuali client esterni che leggono shape `structure` devono migrare a `organization`.
- Le route legacy vanno rimosse solo dopo conferma che non sono piu usate.
- `SITE_MANAGER`, `WORKER` e `VIEWER` richiedono filtri per risorsa quando i moduli dominio saranno implementati.

## Prossime azioni

1. Applicare migration e Prisma generate in ambiente controllato.
2. Aggiornare eventuali client che usano `/api/structure*`.
3. Rimuovere wrapper legacy in una fase dedicata.
4. Solo dopo introdurre modelli MVP Worker, JobSite, Document, Evidence, Checklist e DocumentPackage.
