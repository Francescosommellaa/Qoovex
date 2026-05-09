# Sirio Architecture Design

## Purpose
Sirio e la documentazione pubblica del design system Qoovex. Non contiene business logic del prodotto, persistenza o feature operative. Il suo compito e mostrare token, primitives, components e patterns esportati da `@qoovex/ui`.

## MVC Mapping
| Clean MVC layer | Sirio mapping | Percorso rapido |
|---|---|---|
| View | Pagine e preview live costruite con `@qoovex/ui` | `apps/sirio/src/app/page.tsx` |
| Controller | Handler UI sottili per tema, anchor, stato locale demo | `apps/sirio/src/app/page.tsx` |
| Service | Nessun service business. Le sole regole sono composizione docs e catalogo componenti | estrarre in `src/app/*` solo se la pagina cresce |
| Repository | Nessun DB. La sorgente autorevole e il package UI | `packages/ui/src`, `packages/ui/styles` |
| Model | Token, props types e pattern pubblici del DS | `packages/ui/styles/tokens`, `packages/ui/src/components` |

## Service Interfaces
Sirio non deve introdurre servizi applicativi. Se una preview richiede stato, deve restare locale e dimostrativo. Se una funzione diventa riusabile, va spostata in `packages/ui` come component, hook o pattern.

Interfacce ammesse:
- `@qoovex/ui`: unico ingresso per UI pubblica, token e provider tema.
- `@phosphor-icons/react`: icone solo attraverso la primitive `Icon` quando renderizzate in UI.
- `next/image`: asset statici pubblici come logo Sirio.

## Repository Boundaries
Sirio non parla con database, API private, Clerk o servizi esterni di prodotto. Ogni contenuto visuale deve arrivare dal design system o da asset pubblici in `apps/sirio/public`.

Regola Repository Pattern: non creare repository locali finche non esiste persistenza. Se in futuro Sirio dovesse leggere documentazione remota, creare prima un `docsRepository` server-only e un service che espone DTO puliti alla view.

## DTO Contracts
I DTO di Sirio sono read model statici per la documentazione:
- gruppi token;
- voci sidebar;
- esempi componenti;
- item pattern.

Devono restare oggetti serializzabili, senza entita DB e senza dati personali.

## SOLID Rules
- SRP: Sirio compone documentazione; `packages/ui` definisce estetica e comportamento riusabile.
- OCP: nuove sezioni si aggiungono tramite dati e componenti esistenti, non modificando primitive.
- LSP: ogni esempio deve usare l'API pubblica reale del componente, non varianti private.
- ISP: props demo minime; non passare oggetti generici non documentati.
- DIP: dipendere da `@qoovex/ui`, non da file interni profondi del package.

## OWASP And Security
Sirio e pubblico. Non inserire chiavi, dati utenti, audit interni, endpoint privati o esempi con credenziali. Ogni preview deve essere client-safe e non deve chiamare servizi di produzione.

## Scalability Notes
Il collo di bottiglia principale e `page.tsx` troppo grande. Quando una sezione supera una responsabilita chiara, estrarla in moduli documentali mantenendo gli import da `@qoovex/ui`. Non creare componenti visuali locali per aggirare il design system.

## Navigation
- Entry point: `apps/sirio/src/app/page.tsx`.
- Tema e metadata: `apps/sirio/src/app/layout.tsx`.
- Stili app-only: `apps/sirio/src/app/globals.css`.
- Logo: `apps/sirio/public/logo-icon/sirio-icon.svg`.
- Design system source: `packages/ui/src/index.ts`.
