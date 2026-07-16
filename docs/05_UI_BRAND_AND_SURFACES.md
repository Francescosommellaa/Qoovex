# UI, brand and surfaces

## Decisione canonica

Qoovex adotta il design system derivato dallo starter pubblico [Kiranism/next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter), fissato al commit `0edc5cf631ac7a8280112fd2bcb80312597bafdf`.

La foundation usa shadcn `base-nova`, Base UI, Tabler Icons, Tailwind CSS v4 CSS-first, Geist/Geist Mono e il tema Vercel con palette OKLCH light/dark/system. Provenienza e avvisi MIT sono conservati in `packages/ui/THIRD_PARTY_NOTICES.md`.

## Stato promosso

`packages/ui` e l'unica sorgente di verita per token, base CSS, primitive, provider tema, controllo tema, navigazione floating, marchio slottabile, utility e hook condivisi. Sirio, marketing e workspace consumano la stessa implementazione; non esiste una foundation app-local o un layer di compatibilita precedente.

- `apps/sirio`: catalogo e prova integrata su `/`, `/marketing` e `/dashboard`.
- `apps/web`: sito pubblico, cookie banner e pagine legali.
- `apps/workspace`: prodotto, auth, MFA e console, senza modifiche ai contratti funzionali.
- `packages/brand-resources`: esclusivamente SVG proprietari.

Le composizioni di prodotto e la logica di dominio restano nelle app. Componenti, hook e comportamenti realmente condivisi vivono soltanto nel package UI.

## Contratto pubblico

- import espliciti `@qoovex/ui/components/*`, `@qoovex/ui/hooks/*` e `@qoovex/ui/lib/*`;
- nessun barrel root `@qoovex/ui`;
- ogni app importa una sola volta `@qoovex/ui/styles/base.css` e dichiara le proprie sorgenti Tailwind;
- CSS app-local solo per layout e composizioni specifiche;
- `Button` e action-only; la navigazione usa link nativi o Next `Link` con `buttonVariants`;
- package imports interni `#components`, `#hooks` e `#lib` per evitare alias fragili.

## Contratto visivo

- Geist per testo e interfaccia; Geist Mono per dati e riferimenti.
- Token semantici OKLCH per background, superficie, bordo, testo, brand, chart, sidebar e stati `info`, `success`, `warning`, `destructive`.
- Light, dark e system con persistenza, prevenzione del flash e reveal circolare del tema.
- Tabler per le icone funzionali; marchi proprietari da `@qoovex/brand-resources`.
- Focus visibile, tastiera e touch, forced colors, zoom 200% e contenuti lunghi come requisiti di base.
- Copy prudente su stato documentale, elementi presenti, mancanti o da verificare. Nessuna promessa di conformita, certificazione o validita legale.

## Motion

La motion serve orientamento e feedback: reveal circolare del tema, navbar floating che si compatta con lo scroll e aggiorna i tag di sezione, transizioni Base UI per menu/select/tooltip/sheet, collasso sidebar, switch, tab, skeleton e spinner. `prefers-reduced-motion` disabilita le transizioni non essenziali e il cambio tema ha un fallback senza View Transition API.

Non viene introdotta una libreria di animazione separata. Animazioni legate a feature escluse dello starter non fanno parte della foundation.

## Adozione esterna

Codice pubblico esterno puo essere adottato soltanto con licenza compatibile, provenienza, versione o commit fissato e mantenimento degli avvisi. La CLI shadcn e ammessa per componenti approvati dopo `info`, `docs`, `view`, `--dry-run` e `--diff`; non si usa `--overwrite` sulle varianti Qoovex approvate.

## Verifica

Il gate statico impedisce primitive duplicate, import root, token o classi visuali precedenti, provider tipografici rimossi e dipendenze icona non canoniche. Le superfici vanno verificate a 320, 390, 768, 1024 e 1440 px, light/dark/system, zoom 200%, tastiera, touch, focus, contrasto, reduced motion, hydration, console e overflow.
