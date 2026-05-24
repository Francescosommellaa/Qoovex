# Workspace Architecture Design

## Purpose
`apps/workspace` e l'app operativa Qoovex per ricette, menu, piano di lavoro, ricerca, auth e dashboard. Qui Clean MVC deve essere applicato con confini piu rigidi per proteggere business logic, sicurezza e persistenza.

## MVC Mapping
| Clean MVC layer | Workspace mapping | Percorso rapido |
|---|---|---|
| View | App Router pages, FSD views, widgets e UI composition | `apps/workspace/src/app`, `src/views`, `src/widgets` |
| Controller | Route handler, server action e page server component sottili | `src/app/api`, `src/shared/actions` |
| Service | Use case applicativi, validazioni, orchestrazione auth/DB | `src/shared/server`, futuri `src/features/*/model` |
| Repository | Accesso a Prisma/DB e provider esterni nascosto dietro funzioni server-only | oggi `src/shared/server`, target `src/shared/server/repositories` |
| Model | Prisma schema, entity model FSD, DTO e value object | `packages/db/prisma`, `src/entities`, `src/shared/lib` |

## Service Interfaces
Interfacce attuali:
- `bootstrapUser()` in `src/shared/actions/bootstrap-user.ts`: controller/action per ottenere o creare l'utente corrente nel DB applicativo.
- `syncWorkspaceUser()` in `src/shared/server/workspace-user-sync.ts`: service server-only per allineare sessione NextAuth e riga `User` Prisma.
- Config auth in `src/shared/server/auth/` (`auth.config.ts` Edge, `config.ts` server con Prisma adapter e provider Resend/Google).
- API recent searches in `src/app/api/recent-searches/route.ts`: controller HTTP.
- Handler NextAuth in `src/app/api/auth/[...nextauth]/route.ts`: controller HTTP sessioni e callback provider.

Regola: controller e route handler devono contenere parsing input, auth, chiamata service e risposta. Business rules, query DB e provider SDK devono stare in service/repository server-only.

## Repository Boundaries
Repository Pattern attivo:
- `@qoovex/db` puo essere importato solo da `apps/workspace/src/shared/server/repositories`;
- `user-repository` gestisce lookup, upsert e delete user;
- `recent-search-repository` gestisce CRUD e pruning dati recent searches;
- service e controller dipendono dai repository, mai da Prisma direttamente;
- controller/page/server action non importano `@qoovex/db`.

Per nuovi aggregati con persistenza, creare prima il repository server-only e poi il service. Esempi futuri: `recipeRepository`, `menuRepository`, `workPlanRepository`.

## DTO Contracts
DTO obbligatori tra controller e service:
- request DTO: input gia validato e normalizzato;
- response DTO: dati minimi per la view o risposta JSON;
- error DTO: codice stabile, messaggio sicuro, nessun dettaglio provider.

Non esporre entita Prisma complete alla view. Se serve un campo in UI, aggiungerlo esplicitamente al DTO e al `select` del repository.

## SOLID Rules
- SRP: route handler gestisce HTTP; service gestisce use case; repository gestisce dati.
- OCP: nuove feature aggiungono service/repository dedicati senza modificare controller esistenti non correlati.
- LSP: repository e service devono restituire contratti coerenti anche se cambia provider o ORM.
- ISP: evitare service "god object"; interfacce piccole per recipe, menu, user, search.
- DIP: controller dipende da funzioni service; service dipende da astrazioni repository, non da UI o route.

## OWASP And Security
Regole minime:
- validare ogni body JSON prima di usarlo;
- non restituire errori raw di Prisma, NextAuth, Resend o provider esterni;
- verificare auth e ownership prima di leggere o mutare dati;
- usare `select` espliciti per evitare data leakage;
- tenere `AUTH_SECRET` e secret provider solo server-side;
- non loggare token, email payload completi o dati personali non necessari.

## Scalability Notes
Colli di bottiglia principali:
- route API con query multiple e pruning sincrono, come recent searches;
- service auth che esegue sync utente a ogni chiamata se usato in modo indiscriminato;
- nuovi eventi webhook che potrebbero finire nel dispatcher senza service dedicato;
- FSD layer rispettato solo se gli import restano diretti verso il basso.

Azioni consigliate:
- introdurre DTO schema condivisi per input route;
- aggiungere test unitari sui service senza DB reale.

## Navigation
- Entry point app: `apps/workspace/src/app`.
- API controllers: `apps/workspace/src/app/api`.
- Server actions: `apps/workspace/src/shared/actions`.
- Server services/adapters: `apps/workspace/src/shared/server`.
- Auth services: `apps/workspace/src/shared/server/auth`.
- Repository DB: `apps/workspace/src/shared/server/repositories`.
- Utility pure: `apps/workspace/src/shared/lib`.
- Feature layer: `apps/workspace/src/features`.
- Entity layer: `apps/workspace/src/entities`.
- Views/widgets: `apps/workspace/src/views`, `apps/workspace/src/widgets`.
- Database package: `packages/db`.
