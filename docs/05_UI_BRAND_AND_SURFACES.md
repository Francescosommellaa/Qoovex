# UI, brand and surfaces

## Stato attuale verificato

La direzione grafica e invariata. Qoovex usa shadcn `base-nova`, Base UI, Tabler Icons, Tailwind CSS v4 CSS-first, Geist/Geist Mono e tema Vercel light/dark/system. Token, font, tema, iconografia, motion e stile base non sono stati modificati. `packages/ui` aggiunge solo primitive generiche per search field/results, timeline e work queue; `apps/sirio` ne dimostra loading, empty, error, timeline lunga, ricerca multi-tipo e review.

Il Workspace usa una sola shell adattiva. La navigazione primaria contiene soltanto destinazioni autorizzate. `Cerca` e un controllo separato che apre un modale consultivo (`Ctrl/Cmd+K`) e non una pagina o una voce primaria. La card `Azioni rapide`, nel footer sopra l'account, espone le principali mutazioni manuali derivate dai permessi; desktop usa una riga compatta, sidebar collassata una colonna e mobile una griglia 2x2. Notifiche, account e tema mantengono la collocazione esistente.

`/dashboard` conserva compatibilita URL ma presenta “Centro operativo”. L'ingresso universale responsive apre i flussi controllati esistenti; `/operations/[processId]` mostra stato reale, step, timeline, decisioni, eccezioni e artifact. Le viste di dominio restano controllo avanzato.

Le nuove composizioni usano esclusivamente primitive canoniche gia presenti. Restano vincolanti focus visibile, tastiera, touch, zoom 200%, contenuti lunghi, reduced motion, forced colors, light/dark/system e nessuna capability simulata.

## Direzione approvata

La UI primaria resta exception-driven: problema, motivo, prossimo passo e attore autorizzato sono visibili nello stesso contesto. Progressi e risultati derivano dallo stato persistito; non vengono inventate percentuali o metriche.

## Specifiche non implementate

Ricerca nei file o semantica, OCR/AI, viste salvate, nuovi canali di intake e visual editor non sono attivi. La ricerca Fase 4 e consultiva e limitata ai metadati autorizzati.

## Decisioni aperte e hard stop

Ricerca nei file o semantica, viste salvate/cronologia, nuovi canali, disclosure sensibile e modifiche alle primitive o alla foundation richiedono approvazione. Non adottare Satoshi, Chillax, Phosphor o una foundation visuale parallela.

## Verifica visuale

Le superfici operative devono essere provate a 320/390/768/1024/1440, light/dark/system, zoom 200%, tastiera, touch, reduced motion, forced colors, hydration, console e overflow prima di una dichiarazione di release.
