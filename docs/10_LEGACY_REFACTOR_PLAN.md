# Legacy Refactor Plan

## Obiettivo

Rimuovere progressivamente il vecchio dominio food senza rompere auth, MFA, audit, membership, inviti e supporto.

Questa bonifica deve essere controllata: prima documenti e copy, poi tipi e policy, infine Prisma e route pubbliche.

## Aree legacy da bonificare

| Area | Priorita | Rischio | File principali | Azione |
| --- | --- | --- | --- | --- |
| Documenti prodotto legacy | alta | basso | `/docs/ProductContext.md`, `/docs/event-operations.md` | mantenere marcati legacy, poi archiviare o eliminare |
| README e docs operative | alta | basso | `/docs/OperationalProtocol.md`, `/docs/HowToUse.md`, `/apps/workspace/README.md` | riscrivere con nuovo dominio |
| Copy email e fallback nomi | alta | basso | `transactional-email-service.ts`, `auth-credentials-service.ts`, `workspace-user-sync.ts`, `username-service.ts` | rendere neutro |
| Tipi condivisi legacy | completata | medio | `packages/types/src/index.ts` | ruoli e permessi Organization attivi, alias legacy deprecati |
| Policy autorizzazione runtime | completata | alto | `authorization-policy.ts`, test correlati | migrata a ruoli e permessi Organization |
| Servizi structure | parziale | alto | `structure-access-service.ts`, `structure-invitation-service.ts` | wrapper legacy verso servizi Organization |
| Route API structure | parziale | alto | `/api/structure*`, `/api/structures` | compatibilita temporanea, nuove route `/api/organization*` create |
| Prisma schema e migrations | parziale | alto | `packages/db/prisma/schema.prisma`, migrations | client Prisma migrato a Organization con mapping fisico legacy |

## Cosa puo essere rinominato subito

- Copy visibile e testi email.
- Fallback username e nomi generici.
- Documentazione locale.
- Commenti che citano il vecchio dominio.
- Nuovi tipi canonici non collegati alla persistenza.

## Cosa deve essere rimandato

- Rinomina fisica delle tabelle `Structure`, `StructureMembership`, `StructureInvitation` e delle colonne `structureId`.
- Rinomina route `/api/structure*`.

## Cosa richiede migrazione Prisma

- Rinomina fisica `Structure` -> `Organization`.
- Rinomina fisica `StructureMembership` -> `OrganizationMembership`.
- Rinomina fisica `StructureInvitation` -> `OrganizationInvitation`.
- Rinomina fisica colonne `structureId` -> `organizationId`.
- Indici e foreign key collegati.
- Mapping dati esistenti.

## Mapping da validare prima della migrazione

- Mapping applicato nella migration conservativa: `ADMIN` -> `OWNER`, `HEAD_CHEF` -> `OWNER`, `HEAD_OF_HALL` -> `ADMIN`, `KITCHEN_CREW` -> `WORKER`.
- Se non esistono dati reali di produzione, si puo valutare reset controllato del tenant legacy.
- Se esistono dati reali, serve tabella di mapping approvata dal proprietario.

## Cosa richiede ricerca o conferma

- Ruoli effettivi da vendere nel prodotto.
- Chi puo invitare consulenti, worker e viewer.
- Se `VIEWER` deve essere utente autenticato o solo share link.
- Dati minimi per Organization e Worker.
- Durata e revoca degli share link.
- Quali audit log esporre al cliente.

## Ordine consigliato

1. Documentare naming, ruoli e storage.
2. Bonificare copy e docs legacy.
3. Completato: tipi canonici runtime in `packages/types`.
4. Completato: migrazione Prisma conservativa con mapping dati.
5. Completato: schema e client Prisma migrati con mapping fisico legacy.
6. Completato: policy server-side, inviti e membership su Organization.
7. Completato: route `organization*` con compatibilita legacy.
8. Prossimo: rimuovere wrapper legacy quando i client sono migrati.
9. Solo dopo aggiungere modelli documenti, cantieri, lavoratori e Blob metadata.

## Criteri di completamento

- Nessun nuovo codice usa concetti food.
- Le occorrenze legacy residue sono isolate in compatibilita DB, file legacy marcati o piano di refactor.
- Type-check e test workspace passano.
- Prisma validate passa dopo ogni modifica schema.
