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

## Sottolineatura e link

La sottolineatura comunica un collegamento nel contenuto, non un generico stato interattivo. I ruoli condivisi sono dichiarativi e valgono in tutte le app:

- `inline`: link dentro testo, help, alert e contenuti legali; la sottolineatura e sempre visibile;
- `quiet`: link testuali autonomi, azioni secondarie e footer; la sottolineatura compare in hover e focus;
- `plain`: navigazione, tab, breadcrumb, logo, card, badge e link con aspetto CTA; non viene sottolineato.

I button non usano mai la sottolineatura. Colore, spessore e offset provengono dai token condivisi; skip-ink, focus da tastiera e forced colors restano parte del contratto accessibile. I consumer usano `data-link`, mentre `data-link-scope="inline"` copre contenitori di testo controllati come descrizioni, alert e contenuti legali.

## Selezione del contenuto

Titoli, paragrafi e contenuti editoriali restano selezionabili e copiabili con un highlight neutro derivato dai token foreground, al posto del blu nativo del browser. Immagini, marchio e mockup UI dimostrativi non producono evidenziazioni testuali accidentali: le immagini applicano il comportamento condiviso, `BrandMark` e non selezionabile e i preview dichiarano `data-selection="none"`. Forced colors mantiene `Highlight` e `HighlightText` di sistema. La regola non si applica alle dashboard reali, ai dati operativi o ai campi editabili.

## Motion

La motion serve orientamento e feedback: reveal circolare del tema, navbar floating adattiva, transizioni Base UI per menu/select/tooltip/sheet, collasso sidebar, switch, tab, skeleton e spinner. Sulla home, uno scroll verso il basso oltre l'isteresi di 10 px compatta la navbar e sostituisce le destinazioni marketing con le sezioni della pagina; uno scroll verso l'alto ripristina dimensione e navigazione marketing. La navigazione tra sezioni usa una transizione deterministica di 460 ms e termina sulla linea di lettura calcolata dallo `scroll-padding-top`, senza sommare un secondo offset sul target. Nella navbar mobile la sezione corrente resta sempre visibile; precedente e successiva compaiono insieme soltanto quando lo spazio effettivo del contenitore centrale raggiunge 15 rem, senza dipendere dalla sola larghezza del viewport. `prefers-reduced-motion` disabilita le transizioni non essenziali e il cambio tema ha un fallback senza View Transition API.

La navbar marketing estesa espone `Prodotto`, `Pricing`, `Contattaci` e il menu `Risorse`. Il menu Base UI si apre con hover, click o tastiera e include Manuale utente, Community e FAQ; lo stato mobile conserva le stesse destinazioni nello Sheet. Un indicatore condiviso si sposta tra link e voci del dropdown con easing elastico `cubic-bezier(0.16, 1, 0.3, 1)`, ispirato alla continuita del cursore ma senza inseguire il puntatore. Il focus semantico resta nativo e visibile; reduced motion e forced colors mantengono fallback accessibili.

Le superfici marketing possono attivare il `MarketingCursor` condiviso: punto di precisione immediato, alone con inseguimento elastico e deformazione proporzionale alla velocita, stato interattivo, pressione e micro-label opt-in tramite `data-cursor-label`. Quando il puntatore entra nella soglia netta di 16 px attorno a una CTA primaria, il solo cursore visivo scatta nel punto di attivazione stabile dell'azione, cioe il centro del pulsante; non viene applicata alcuna attrazione progressiva alla traiettoria. Lo snap richiede che la CTA sia realmente esposta: header, menu, dialog, sheet, popover, altre azioni o superfici sovrapposte impediscono l'attivazione. Nello stesso frame il cursore eredita anche lo stato `action` o la micro-label della CTA magnetica, senza attendere un ulteriore movimento fisico del puntatore. Pulsante, area cliccabile e hit testing restano immobili. I target espliciti usano `data-cursor-magnetic="true"` e un'azione puo disattivare il comportamento con `data-cursor-magnetic="false"`. Il comportamento non sostituisce focus o semantica e viene disattivato integralmente su touch, penna, `prefers-reduced-motion`, forced colors e dispositivi senza puntatore fine; input, select, textarea e contenuti editabili mantengono il cursore nativo. La home pubblica e `/marketing` di Sirio sono i due consumer approvati; pagine legali, workspace e dashboard restano esclusi.

Non viene introdotta una libreria di animazione separata. Animazioni legate a feature escluse dello starter non fanno parte della foundation.

## Scrollbar

Web, Sirio e workspace montano lo stesso `ScrollbarController` e usano esclusivamente la scrollbar nativa ridisegnata dalla foundation. Su mouse e puntatori fini il canale resta trasparente, lo spessore occupato e 8 px e il thumb visivo e circa 4 px; colore e intensita derivano dai token foreground per light e dark.

La scrollbar principale appare durante lo scroll o quando il puntatore raggiunge gli ultimi 20 px del bordo destro o inferiore. Le scrollbar annidate appaiono durante scroll, hover o focus del relativo contenitore e tornano trasparenti dopo 900 ms di inattivita. Hover e trascinamento aumentano progressivamente il contrasto. Su touch, pointer coarse e forced colors resta il comportamento nativo del sistema. Sidebar, tabelle, menu, select e ogni nuovo contenitore overflow ereditano automaticamente il contratto.

## Adozione esterna

Codice pubblico esterno puo essere adottato soltanto con licenza compatibile, provenienza, versione o commit fissato e mantenimento degli avvisi. La CLI shadcn e ammessa per componenti approvati dopo `info`, `docs`, `view`, `--dry-run` e `--diff`; non si usa `--overwrite` sulle varianti Qoovex approvate.

Per il dropdown Risorse e stato usato come riferimento visivo [Navbar Menu su 21st.dev](https://21st.dev/@manuarora700/components/navbar-menu), pubblicato il 3 dicembre 2024 e attribuito ad [Aceternity UI](https://ui.aceternity.com/components/navbar-menu). L'implementazione Qoovex e una trasformazione di principio: il sorgente 21st e bloccato e la fonte originale dichiara All Rights Reserved, quindi non e stato copiato codice, non e stata installata la relativa registry entry e non e stata aggiunta Framer Motion. Sono stati riusati esclusivamente Base UI, Tabler e CSS gia approvati nel repository.

## Verifica

Il gate statico impedisce primitive duplicate, import root, token o classi visuali precedenti, provider tipografici rimossi e dipendenze icona non canoniche. Le superfici vanno verificate a 320, 390, 768, 1024 e 1440 px, light/dark/system, zoom 200%, tastiera, touch, focus, contrasto, reduced motion, hydration, console e overflow.
