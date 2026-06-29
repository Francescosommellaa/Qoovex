# API Rename Report

Data: 2026-06-29.

## Route legacy trovate

- `/api/structures`
- `/api/structure/members`
- `/api/structure/invitations`
- `/api/structure/invitations/accept`
- `/api/support/structures`
- `/api/support/sessions` con input `structureCode`

Queste route derivano dal dominio tecnico legacy `Structure`.

## Route nuove create

- `/api/organizations`
- `/api/organization/members`
- `/api/organization/invitations`
- `/api/organization/invitations/accept`
- `/api/support/organizations`

`/api/support/sessions` ora accetta `organizationCode` come input principale e conserva `structureCode` come alias temporaneo.

## Compatibilita temporanee

Le route legacy restano disponibili come wrapper e chiamano i servizi Organization.

Wrapper mantenuti:

- `structure-access-service.ts`;
- `structure-invitation-service.ts`;
- `/api/structure*`;
- `/api/structures`;
- `/api/support/structures`.

Questi wrapper non devono contenere logica dominio autonoma.

## Client o test aggiornati

- Test autorizzazione aggiornati sui ruoli Organization.
- Test migration aggiornato per verificare la migration di mapping ruoli.
- Route inviti legacy aggiornate per usare `WORKER` come default temporaneo invece di valori legacy.

## Rischi

- Client esterni potrebbero ancora chiamare `/api/structure*`.
- Alcune risposte legacy possono ancora usare shape storiche se un client le consuma direttamente.
- La rimozione dei wrapper richiede conferma che web/mobile/client interni siano migrati.

## Cosa va rimosso in futuro

- Route `/api/structure*` e `/api/structures`.
- Alias TypeScript `StructureRole`, `StructureSummary`, `CreateStructureInput`.
- Wrapper `structure-access-service.ts` e `structure-invitation-service.ts`.
- Terminologia `Structure` nei README locali delle route legacy.
- Mapping fisico DB verso tabelle `"Structure*"` solo dopo una migrazione DB di rename pianificata.

## Raccomandazione operativa

La prossima fase API deve aggiornare eventuali client a `/api/organization*`, poi introdurre un periodo breve di deprecazione con log o monitoraggio prima di eliminare le route legacy.
