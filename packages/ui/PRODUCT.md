# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

`@qoovex/ui` è destinato ai team e agli agenti che costruiscono le superfici frontend Qoovex.

I suoi utenti principali sono sviluppatori, designer di sistema e manutentori che hanno bisogno di primitive accessibili, coerenti e riutilizzabili senza ricostruire localmente gli stessi controlli in Web, Sirio o Workspace.

Gli utenti finali di Qoovex beneficiano della libreria attraverso le applicazioni che la consumano, ma non interagiscono con questo package come prodotto autonomo.

## Product Purpose

Il package è la singola fonte di verità del design system Qoovex implementato. Fornisce fondazioni, stili, componenti presentazionali, hook e utility condivisi che consentono alle applicazioni di mantenere comportamento, accessibilità e identità coerenti.

Il successo significa che una primitiva comune viene implementata una volta, importata tramite un contratto esplicito, verificata in Sirio e composta localmente dalle applicazioni senza duplicazioni o dipendenze dal dominio.

## Positioning

`@qoovex/ui` non è un kit generico né un deposito di componenti applicativi. È una foundation open-code specifica per Qoovex, costruita su shadcn `base-nova` e Base UI e adattata ai requisiti reali del prodotto.

Il package possiede le primitive condivise; le applicazioni possiedono layout, copy, workflow e composizioni di dominio. Questo confine mantiene il sistema riutilizzabile senza appiattire le differenze tra sito pubblico, catalogo e Workspace.

## Operating Context

Web, Sirio e Workspace consumano il package tramite subpath export espliciti. Sirio rende le primitive osservabili in un ambiente di prova, mentre le applicazioni le inseriscono nei propri flussi e layout.

Una modifica condivisa può incidere su più superfici e deve quindi essere piccola, compatibile, accessibile e verificata in proporzione al rischio. Il package non è un'applicazione eseguibile autonoma e non deve dipendere da routing, autenticazione, database o servizi di un consumer.

## Capabilities and Constraints

- Il package contiene primitive presentazionali, stili e token, supporto tema, icone, hook e utility realmente condivisibili.
- Gli import pubblici passano dai subpath export dichiarati; i consumer non dipendono da file interni non esportati.
- Le azioni usano controlli semantici appropriati e la navigazione usa link; un componente condiviso non deve cancellare questa distinzione.
- Dipendenze da app, Prisma, Auth.js, modelli di dominio o servizi di prodotto non appartengono al package.
- Componenti specifici di un workflow restano locali finché non esiste una comprovata esigenza condivisa e un'API stabile.
- Base UI, Tabler Icons e le primitive già adottate sono la foundation da estendere; una nuova libreria concorrente richiede una decisione esplicita.
- Le verifiche automatiche della foundation e del contrasto semantico sono guardrail necessari, non sostituti di test di interazione e revisione visuale.

## Brand Commitments

La foundation visuale condivisa usa General Sans per quasi tutta la tipografia e Array soltanto come `font-accent` controllato. Tabler è la famiglia di icone canonica. Tema chiaro, scuro e di sistema, token OKLCH e colori semantici devono rimanere coerenti tra i consumer.

I componenti devono risultare rassicuranti, calmi, accessibili, umani e operativi: stratificati ma contenuti, tattili con discrezione, morbidi, chiari e prevedibili. Evitano sia la freddezza enterprise sia un tono giocoso incompatibile con cantieri, documenti e responsabilità.

## Evidence on Hand

- Contratto, ownership e regole di consumo: `README.md`.
- API pubblica e dipendenze: `package.json`.
- Implementazione corrente: `src/components`, `src/hooks`, `src/lib` e `src/styles`.
- Guardrail automatici: `scripts/verify-foundation.mjs` e `scripts/verify-semantic-contrast.mjs`.
- Prova eseguibile delle primitive: `../../apps/sirio`.
- Contratto visuale e tipografico: `../../docs/05_UI_BRAND_AND_SURFACES.md`.

## Product Principles

1. **Condividere primitive, non dominio:** il package risolve problemi di interfaccia comuni senza conoscere Aziende, cantieri o permessi.
2. **Accessibilità nel contratto:** semantica, tastiera, focus e stati non sono rifiniture opzionali del consumer.
3. **API esplicite e prevedibili:** export, varianti e comportamento devono essere facili da scoprire e difficili da usare male.
4. **Una sola implementazione canonica:** le applicazioni compongono il sistema senza duplicare componenti condivisi.
5. **Provare prima di promuovere:** modifiche e nuove primitive vengono dimostrate in Sirio e verificate sui consumer rilevanti.

## Accessibility & Inclusion

Le primitive condivise devono sostenere navigazione da tastiera, focus visibile, semantica corretta, nomi accessibili, contrasto, forced colors, riduzione del movimento, target adeguati e contenuti o viewport variabili.

Le API non devono richiedere ai consumer di conoscere dettagli nascosti per ottenere il comportamento accessibile di base. Nessuna dichiarazione formale di conformità può basarsi sulla sola presenza della libreria: ogni composizione finale richiede verifica nel proprio contesto.
