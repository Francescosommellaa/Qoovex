# 39 - Foundation marketing, Sirio e packages/ui

## Implementazione

La fase inizializza tre basi tecniche:

- `apps/web`: sito marketing pubblico provvisorio;
- `apps/sirio`: showcase tecnico del design system;
- `packages/ui`: primitive UI condivise consumate da web e Sirio.

Non sono state create ricerca reale, interviste simulate, preset documentali, preset checklist, scadenze ufficiali, pricing, testimonianze, casi studio o pagine legali definitive.

## Perche esiste `packages/ui`

Il package e stato creato perche ora ci sono due consumer reali:

- `apps/web`;
- `apps/sirio`.

Contiene componenti generici e token CSS. Non contiene logica workspace, auth, Prisma, copy normativo o regole di dominio.

## Contenuto `apps/web`

La homepage pubblica contiene sezioni provvisorie:

- hero;
- problema;
- cosa fa Qoovex;
- per chi e;
- come funziona;
- cosa non promette;
- CTA finale.

Il link al workspace usa `NEXT_PUBLIC_WORKSPACE_URL` con fallback locale documentato a `http://localhost:3001`.

La CTA "Richiedi informazioni" resta un anchor interno. Non esiste ancora un backend contatto e non e stato inventato un recapito.

## Contenuto `apps/sirio`

Sirio mostra:

- token base;
- bottoni;
- card;
- badge;
- stati generici;
- copy prudente;
- copy da evitare.

Sirio non possiede i componenti: li importa da `@qoovex/ui`.

## Token e stili

`packages/ui/styles/tokens.css` definisce token semantici minimi per colori, spacing, radius, shadow, font e larghezze layout.

`packages/ui/styles/base.css` definisce base style leggera e classi per primitive UI. Il reset e intenzionalmente non aggressivo.

## Marketing provvisorio

Il marketing attuale serve solo a rendere buildabile e navigabile il sito pubblico. Non e il posizionamento definitivo e non contiene claim validati.

## Cosa non e validato

Non sono validati:

- keyword SEO;
- materiali di ricerca;
- interviste;
- preset;
- obblighi documentali;
- checklist;
- scadenze;
- casi studio;
- pricing;
- proof commerciali.

## Regola per Codex

Codex non deve inventare ricerca, contenuti normativi, preset o claim. Il team Qoovex fornira materiali verificati e decisioni prodotto; Codex potra applicarli dopo.

## Prossima fase consigliata

Quando il team fornira materiale reale, aggiornare copy, sezioni marketing e componenti Sirio mantenendo i confini:

- contenuti e ricerca in documentazione dedicata;
- componenti generici in `packages/ui`;
- business logic del workspace dentro `apps/workspace`.
