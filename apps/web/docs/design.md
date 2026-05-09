# Web Architecture Design

## Purpose
`apps/web` e il sito marketing pubblico Qoovex. Deve comunicare prodotto, pricing, risorse, legal e contatto usando il design system, senza duplicare logica workspace o creare componenti visuali fuori da `@qoovex/ui`.

## MVC Mapping
| Clean MVC layer | Web mapping | Percorso rapido |
|---|---|---|
| View | Route marketing, sezioni e shell pubblica | `apps/web/src/app`, `apps/web/src/shared/components` |
| Controller | Page component sottili che scelgono contenuto e layout | `apps/web/src/app/(marketing)/*/page.tsx` |
| Service | Orchestrazione marketing senza side effect; futuri submit form vanno in service dedicati | `apps/web/src/app/(marketing)/*/content` |
| Repository | Oggi nessun DB. I content module sono sorgenti statiche | `apps/web/src/app/(marketing)/*/content` |
| Model | DTO marketing serializzabili per sezioni e CTA | file `*-content.ts` |

## Service Interfaces
Interfacce pubbliche ammesse:
- `@qoovex/ui`: componenti, primitives, patterns, theme provider.
- `apps/web/src/shared/components`: shell, topbar, footer specifici del sito.
- `apps/web/src/shared/sections`: sezioni condivise marketing che assemblano pattern DS.
- `apps/web/src/app/(marketing)/*/content`: DTO statici per copy, CTA, liste e metadata pagina.

Se viene aggiunto un form reale, la page deve chiamare un controller thin o server action che delega a un service, per esempio `contactService.submit(dto)`. Il service valida e chiama repository/adapters. La page non deve parlare direttamente con provider email, CRM o database.

## Repository Boundaries
Repository Pattern attuale:
- content statico come repository read-only, senza side effect;
- nessuna persistenza nel sito marketing.

Repository Pattern futuro:
- `contactRepository`: invio lead o ticket;
- `newsletterRepository`: iscrizioni;
- `cmsRepository`: lettura contenuti da CMS.

Ogni repository deve restituire DTO pubblici e nascondere SDK esterni.

## DTO Contracts
I DTO marketing devono essere plain object:
- label, title, description, href, items;
- nessuna entita DB;
- nessun oggetto SDK;
- nessuna funzione nel dato passato alla view, tranne callback UI locali motivate.

Le route usano DTO gia pronti e li passano a pattern/componenti DS.

## SOLID Rules
- SRP: route decide la composizione; content module contiene copy; DS contiene UI.
- OCP: nuove pagine marketing aggiungono content e sezioni, senza modificare componenti globali.
- LSP: ogni sezione shared deve accettare DTO coerenti e non richiedere campi nascosti.
- ISP: props piccole e specifiche per ogni sezione.
- DIP: le pagine dipendono da service/repository astratti o content module, non da provider esterni.

## OWASP And Security
Il sito e pubblico. Non inserire secret, token tracking privati, dati personali o chiamate server con input non validato. Ogni form futuro deve validare input lato server, rate limitare se necessario e non riflettere errori provider non sanitizzati.

## Scalability Notes
Rischi principali:
- page component che diventano controller grassi;
- duplicazione tra pagine marketing;
- copy e layout mescolati;
- integrazioni esterne chiamate direttamente dalle route.

Per scalare, introdurre service e repository solo quando esiste una vera regola o integrazione. Non creare astrazioni vuote.

## Navigation
- Entry point root: `apps/web/src/app/page.tsx`.
- Marketing pages: `apps/web/src/app/(marketing)`.
- Shared shell: `apps/web/src/shared/components/site-shell.tsx`.
- Topbar/footer: `apps/web/src/shared/components/site-topbar.tsx`, `apps/web/src/shared/components/site-footer.tsx`.
- Content DTO: `apps/web/src/app/(marketing)/*/content`.
- Design system source: `packages/ui/src/index.ts`.
