---
name: Qoovex UI
description: Gli Attrezzi di Precisione - foundation neutra, riutilizzabile e prevedibile delle interfacce Qoovex.
colors:
  calce: "oklch(0.99 0 0)"
  inchiostro: "oklch(0 0 0)"
  nebbia: "oklch(0.97 0 0)"
  grafite: "oklch(0.44 0 0)"
  segnale-rosso: "oklch(0.54 0.19 23.03)"
  informazione-blu: "oklch(0.53 0.22 264.53)"
  conferma-verde: "oklch(0.51 0.15 145)"
  attenzione-ambra: "oklch(0.81 0.17 75.35)"
typography:
  display:
    fontFamily: "General Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.111
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "General Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "General Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  body:
    fontFamily: "General Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "Array, General Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.333
    letterSpacing: "0.08em"
rounded:
  sm: "0.25rem"
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  full: "9999px"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.25rem"
  6: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.inchiostro}"
    textColor: "{colors.calce}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0 0.75rem"
  button-outline:
    backgroundColor: "{colors.calce}"
    textColor: "{colors.inchiostro}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0 0.75rem"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.inchiostro}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    height: "2.25rem"
    padding: "0.375rem 0.75rem"
  badge-status:
    backgroundColor: "{colors.nebbia}"
    textColor: "{colors.grafite}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: "1.375rem"
    padding: "0 0.625rem"
  card-default:
    backgroundColor: "{colors.calce}"
    textColor: "{colors.inchiostro}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
---

# Design System: Qoovex UI

## Overview

**Creative North Star: "Gli Attrezzi di Precisione"**

Qoovex UI è una cassetta di strumenti calibrati: ogni primitiva ha uno scopo chiaro, una forma prevedibile e stati completi, così le applicazioni possono comporre esperienze diverse senza ricostruire la foundation. Calce, Inchiostro, Nebbia e Grafite mantengono il sistema neutro; i colori semantici comunicano conseguenze e stato.

La qualità è tattile con discrezione. Raggi morbidi, bordi sottili, ombre basse e micro-movimenti rendono i controlli leggibili e fisici senza trasformarli in giocattoli. Il package rimane neutro, riutilizzabile e privo di dominio; Web, Sirio e Workspace ne decidono composizione e ritmo.

**Key Characteristics:**

- Primitive accessibili costruite su Base UI e stili open-code.
- Monocromia strutturale con quattro famiglie semantiche esplicite.
- Scala da quattro pixel, controlli compatti e raggi morbidi gerarchici.
- Feedback tattile breve, focus visibile e comportamento reduced-motion.
- Tabler come grammatica iconografica e Array come accento controllato.

## Colors

La palette condivisa usa neutrali per struttura e gerarchia e colori semantici per stato, con ruoli equivalenti nei temi chiaro e scuro.

### Primary

- **Inchiostro** (`oklch(0 0 0)`): foreground, primary action, ring e selezione forte nel tema chiaro.
- **Calce** (`oklch(0.99 0 0)`): background e foreground inverso; nel tema scuro i ruoli si scambiano senza cambiare semantica.

### Secondary

- **Nebbia** (`oklch(0.97 0 0)`): muted surface, hover, controlli secondari e livelli tonali.
- **Grafite** (`oklch(0.44 0 0)`): testo secondario, placeholder, metadati e icone quiete.

### Tertiary

- **Segnale Rosso** (`oklch(0.54 0.19 23.03)`): destructive, invalid e rischio.
- **Informazione Blu** (`oklch(0.53 0.22 264.53)`): informazione contestuale.
- **Conferma Verde** (`oklch(0.51 0.15 145)`): success e conferma.
- **Attenzione Ambra** (`oklch(0.81 0.17 75.35)`): warning e attenzione, con foreground dedicato per il contrasto.

### Named Rules

**The Semantic Contract Rule.** Il nome del token descrive il significato; un consumer non sceglie un colore semantico soltanto per il suo aspetto.

**The Theme Parity Rule.** Tema chiaro e scuro possono cambiare luminanza, ma mantengono gerarchia, leggibilità e significato.

## Typography

**Display Font:** General Sans (con fallback di sistema sans-serif)
**Body Font:** General Sans (con fallback di sistema sans-serif)
**Accent Font:** Array, con General Sans come fallback

**Character:** General Sans è la voce funzionale e leggibile di titoli, testo, label, form e navigazione. Array è un utensile di precisione per ID, cifre, eyebrow, timestamp e badge brevi; la sua rarità lo rende riconoscibile.

### Hierarchy

- **Display** (600, `2.25rem`, 1.111): grandi titoli e valori focali nelle composizioni consumer.
- **Headline** (600, `1.875rem`, 1.2): titoli principali di pagina.
- **Title** (600, `1.25rem`, 1.4): card e sezioni operative.
- **Body** (400, `1rem`, 1.75): testo principale e lettura prolungata.
- **Compact / control** (500, `0.875rem`, 1.429): controlli, field label e testo operativo denso; General Sans, mai Array per default.
- **Label / metadata** (600, `0.75rem`, 1.333, tracking `0.08em`): accento Array per ID, timestamp, counter e status brevi. Il casing naturale e il default; uppercase e ammesso soltanto per eyebrow o status corti.

General Sans usa i pesi realmente caricati `400`, `500`, `600` e `700`. Array usa esclusivamente i pesi realmente esposti da Fontshare: `400`, `600` e `700`; `500` non e disponibile e non deve essere sintetizzato. `400` porta ID e timestamp, `600` label/status, `700` soltanto valori numerici focali molto brevi.

### Named Rules

**The General Sans Default Rule.** Se non esiste una ragione esplicita per usare Array, la scelta corretta è General Sans.

**The Accent Must Be Short Rule.** Array non porta paragrafi, titoli lunghi o istruzioni critiche.

**The Wrap by Default Rule.** Testo e heading vanno a capo per default. `truncate`, `line-clamp` e `nowrap` richiedono un vincolo compositivo reale e non possono rendere irrecuperabile un valore importante. Email, URL, filename e identificatori indivisibili usano `overflow-wrap: anywhere` soltanto sul valore a rischio; `word-break: break-all` non appartiene al default.

**The Numeric Stability Rule.** Le cifre restano proporzionali per copy e valori isolati. `tabular-nums` si usa soltanto per colonne, timestamp, counter o valori che cambiano in-place, dove la stabilita orizzontale migliora la lettura.

**The Stable Type Rule.** `font-size`, `font-weight`, `line-height` e tracking non vengono animati. Motion puo accompagnare container, replacement, opacity o layout senza rendere il testo dipendente dal movimento; reduced motion non cambia la gerarchia.

## Iconography

Tabler e l'unica famiglia iconografica funzionale. SVG custom restano limitati a brand, contenuto o grafici procedurali che Tabler non rappresenta; non costituiscono una seconda libreria. Le icone usano il tratto Tabler standard e `currentColor`, così colore semantico, tema e forced colors appartengono al componente e non al glyph.

### Scale

- **Compact** (`--icon-compact`, `0.875rem` / 14px): metadata, testo `xs`/`sm`, indicatori densi e controlli compatti che mantengono leggibile il tratto.
- **Default / control** (`--icon`, `1rem` / 16px): button, field, menu, navigation e testo base. E il default canonico.
- **Emphasized** (`--icon-emphasized`, `1.25rem` / 20px): status o leading icon con gerarchia maggiore, mai come ingrandimento decorativo.
- **Illustrative** (`--icon-illustrative`, `1.75rem` / 28px): empty state e marker focali dentro un container dedicato.

`12px` resta una misura interna eccezionale per glyph in controlli micro gia geometricamente vincolati; non e un ruolo globale. `24px` non e un passo canonico finche i consumer reali non gli assegnano una responsabilita distinta. Varianti illustrative da `32px` restano component-specific quando il container lo richiede. Le classi `qv-icon-*` applicano soltanto width e height e non sostituiscono le API native Tabler.

### Alignment and semantics

**The Optical Owner Rule.** Icona e testo usano normalmente `inline-flex` e `align-items: center`; un icon-only control centra il glyph nel proprio box, mentre un leading status su testo multilinea puo allinearsi alla prima line box. Un offset locale e ammesso soltanto se deriva da line-height e misura reali, regge zoom e fallback e non viene applicato a SVG annidati. Non esiste un `translate-y` universale.

**The Accessible Name Owner Rule.** Un'icona decorativa usa `aria-hidden="true"`. In un controllo icon-only il nome accessibile appartiene a button o link e il focus resta sul controllo. Soltanto un grafico standalone realmente informativo usa `role="img"` e un nome accessibile; `<title>` SVG non e il fallback generale.

**The Stable Stroke Rule.** Il tratto standard Tabler `2` e il default. Override locali sono ammessi soltanto per glyph molto piccoli o grafici procedurali verificati; non diventano un token globale. Le icone ereditano `currentColor`, inclusi ruoli semantic/status, tema scuro e forced colors.

**The Descendant Selector Rule.** I selector generici sugli SVG possono definire struttura prevedibile, per esempio `pointer-events: none`, `shrink-0` o una size di default che rispetta una classe esplicita. Non applicano motion, colore, offset o size forzata a qualunque discendente: action o grafici annidati devono poter conservare il proprio contratto.

### Motion and loading

Il movimento appartiene al significato: disclosure e chevron possono ruotare con lo stato `open`, una freccia puo mantenere continuita direzionale, copy puo sostituirsi con conferma e loading puo ruotare continuamente. Ogni pattern valuta `rest → interaction → state transition → settled → reversal/interruption`; rapid input retargetta dalla posizione corrente. Non esistono hover translation, bounce, wobble o scale generici applicati a tutti gli SVG, e la trasformazione non modifica hit area o focus geometry.

Con reduced motion, rotazione e movimento spaziale non essenziali diventano replacement o cambio istantaneo; stato, copy e ARIA restano equivalenti. Uno spinner e decorativo quando il parent possiede `aria-busy` o il live/status label: usa `aria-hidden`, non genera annunci duplicati e puo fermarsi in reduced motion senza cancellare il feedback testuale.

## Layout

La foundation parte da un'unità di `0.25rem` e definisce passi fino a `1.5rem`. I controlli base sono compatti: `2rem` per button e select, `2.25rem` per input, `2.5rem` per controlli grandi. Le primitive non impongono una griglia applicativa; forniscono gap, padding e contenitori coerenti che i consumer possono comporre.

Le shell condivise usano topbar da `3.5rem`, sidebar adattiva e breakpoint responsive derivati da Tailwind. Su mobile dialog e navigazione diventano superfici dal basso o off-canvas; target, ordine DOM e focus restano coerenti. I layout di dominio e le larghezze di pagina appartengono alle applicazioni.

**The Primitive Not Page Rule.** `@qoovex/ui` definisce comportamento e ritmo interno dei componenti, non la composizione di una pagina di prodotto.

## Elevation & Depth

La profondità è stratificata e contenuta. Bordo e superficie tonale sono il default; ombre da 2xs a sm distinguono controlli e card interattive; md e superiori sono riservate a popover, tooltip, navigazione flottante e dialog. Backdrop blur entra soltanto su superfici sovrapposte.

### Shadow Vocabulary

- **2XS / XS** (`0 1px 2px 0 hsl(0 0% 0% / 0.09)`): button, badge, card e swatch a riposo.
- **SM / Default** (`0 1px 2px 0 hsl(0 0% 0% / 0.18), 0 1px 2px -1px hsl(0 0% 0% / 0.18)`): stato interattivo leggermente sollevato.
- **MD** (`0 1px 2px 0 hsl(0 0% 0% / 0.18), 0 2px 4px -1px hsl(0 0% 0% / 0.18)`): menu, select, tooltip e navigazione.
- **XL / 2XL** (`0 1px 2px 0 hsl(0 0% 0% / 0.18), 0 8px 10px -1px hsl(0 0% 0% / 0.18)`): dialog e overlay ad alta separazione.

**The Flat at Rest Rule.** Una primitiva è leggibile tramite forma, bordo e tono prima di ricevere un'ombra.

**The Overlay Earns Depth Rule.** Ombra forte e blur sono ammessi quando un elemento occupa davvero un piano superiore.

## Shapes

Il raggio base è `0.5rem`: small `0.25rem`, medium `0.375rem`, large `0.5rem`, extra large `0.75rem`. Button, input e select usano large; card e dialog usano extra large; badge, tabs e indicatori usano pill complete. I controlli più piccoli riducono il raggio senza diventare squadrati.

I bordi restano a un pixel e usano ruoli semantici. Le icone Tabler hanno tratto coerente e misura tipica `1rem`; icone più grandi compaiono soltanto in stati vuoti, alert o marcatori focali.

## Components

### Interaction state language

Le primitive espongono una grammatica comune senza duplicare stato in React: gli alias `qv-disabled`, `qv-readonly`, `qv-selected`, `qv-checked`, `qv-indeterminate`, `qv-open`, `qv-invalid` e `qv-loading` selezionano gli attributi nativi, ARIA e Base UI reali. Gli alias non contengono presentazione globale; colore, bordo, opacity e trasformazioni restano responsabilita del componente che conosce la propria semantica.

Gli strati si compongono nell'ordine `rest → persistent → validation/system → availability`. Focus-visible si aggiunge sempre allo stato composto quando la primitiva e focusabile; non sostituisce selected, checked, invalid o readonly. Hover e pressed sono feedback transient vincolati alla capability di input e alla disponibilita: disabled li sopprime, mentre readonly mantiene focus e selezione nativi quando previsti. Loading blocca una nuova activation dove necessario senza nascondere lo stato sottostante. `data-pressed` non ha un alias globale: sul Toggle e selezione persistente, altrove conserva la semantica specifica della primitiva.

### Focus language

Il focus Qoovex e immediato, additivo e geometricamente stabile. La baseline usa un outline opaco da `2px`, offset `2px` e colore `ring`; non viene animata e non dipende da Motion. In forced colors usa `Highlight`. Ring Tailwind locali non si sommano all’outline canonico durante `:focus-visible`, mentre bordo, background e semantica di selected, checked, invalid, readonly, destructive e open restano visibili.

Il focus appartiene al child direttamente focusabile salvo che un field composite dichiari esplicitamente `data-focus-owner="composite"` e il child deleghi con `data-focus-target="composite"`. La delega non ingloba automaticamente toolbar o action interne. Base UI mantiene focus transfer, trap, Escape e restoration degli overlay; `initialFocus` e `finalFocus` si configurano solo quando i default non rappresentano la destinazione logica. Gli scrollport reali riservano lo spazio di topbar e sticky surface con scroll padding/margin quando necessario.

### Pointer + touch language

Dimensione visuale, hit area interattiva e spazio tra target sono tre contratti distinti. Su capability coarse o hardware ibrido ogni controllo touch appropriato raggiunge `44px` effettivi; i link inline nel testo restano l'eccezione. Un controllo compatto puo mantenere la propria misura visiva soltanto dentro una cella allocata da almeno `44px`: l'espansione invisibile non attraversa sibling target, clipping o focus geometry. Dove la cella non esiste aumentano spacing o box reale, mai due hit area sovrapposte.

Hover e un enhancement del pointer primario con `(hover: hover) and (pointer: fine)`; `any-pointer: coarse` amplia i target per un device aggiuntivo senza cancellare l'hover fine. Nessun comportamento deriva da viewport, user-agent o da una modalita globale basata sull'ultimo evento. Pointer Events distinguono mouse, touch e pen soltanto quando una differenza reale lo richiede. Il press parte al pointer down, si risolve con release inside oppure torna a settled dopo release outside, `pointercancel` o perdita della capture, senza stato sticky. Base UI/native possiedono activation, tastiera e ARIA.

Motion puo governare hover/tap/cancel e interruption quando il controllo dichiarativo migliora il risultato, ma trasforma un child visuale e non il box della hit area. Reduced motion conserva feedback immediato non spaziale. La foundation non applica `touch-action: none`; gesture pan/drag future devono dichiarare l'asse di scroll preservato e non bloccare zoom o scrolling per polish.

### Motion language

Qoovex deve risultare viva ma calma: causa, risposta, transizione e stato finale formano un gesto unico, professionale e interrompibile. La scala semantica condivisa distingue risposta istantanea, feedback locale, continuita di stato e transizione di superficie; `styles/tokens.css` resta la sola fonte numerica per durate ed easing.

Base UI possiede comportamento, semantica e state machine; CSS/Tailwind possiedono styling statico e transizioni visuali banali; `motion/react` e first-class per feedback interattivo, state transition, continuita spaziale, presence, layout, gesture, indicator movement, interruption e reversal quando il controllo dichiarativo migliora percepibilmente precisione o fluidita. Non esistono Spring, bounce o overshoot globali. Rapid input e inversione retargettano dalla posizione corrente. Reduced motion rimuove movimento spaziale non essenziale senza cancellare feedback statici, opacity o colore utili alla comprensione. Hover non e mai essenziale e viene applicato soltanto a pointer fine con hover disponibile.

Ogni componente interattivo valuta elementi animati, lifecycle completo, rapid input, eventuale layout continuity, reduced motion, input modality e costo runtime/bundle. Lo `Switch` e il benchmark interno: stato Base UI reale, integrazione Motion tramite `render`, variants state-driven, `whileTap` e transizioni feedback/state separate. `@qoovex/ui/lib/motion` mantiene CSS come unica fonte numerica per durate ed easing; Motion non e evitato per minimizzare gli import e non viene usato senza beneficio UX dichiarabile.

### Buttons

- **Shape:** raggio `0.5rem`, altezza base `2rem`, peso medio e gap interno `0.375rem`.
- **Primary:** background Inchiostro, testo Calce e ombra 2xs.
- **Hover / Focus:** tono al novanta per cento e scala lieve per il feedback pointer; focus usa l’outline condiviso immediato.
- **Outline / Secondary / Ghost / Destructive / Link:** mantengono lo stesso ritmo e cambiano soltanto gerarchia, superficie e semantica.

### Chips

- **Style:** badge in Array, pill, altezze da `1.125rem` a `1.625rem`, padding orizzontale misurato.
- **State:** default, secondary, outline, semantic, ghost e glass; active comprime a `0.97` soltanto se interattivo.

### Cards / Containers

- **Corner Style:** `0.75rem`.
- **Background:** card, trasparente o muted al quaranta per cento secondo variant.
- **Shadow Strategy:** 2xs a riposo; xs e traslazione `-0.125rem` soltanto per interactive.
- **Border:** neutro e sempre presente su default/interactive.
- **Internal Padding:** `1.5rem` default, `1rem` small.

### Inputs / Fields

- **Style:** altezza `2.25rem`, raggio `0.5rem`, bordo input, background trasparente e testo almeno `1rem` su mobile.
- **Focus:** bordo semantico opzionale più outline condiviso opaco da due pixel, senza ring sovrapposti.
- **Error / Disabled:** bordo e ring Segnale Rosso per invalid; fondo attenuato, cursore e opacità per disabled.

### Navigation

Tabs e navigazioni usano pill, testo `0.75rem`, indicatore scorrevole e stato attivo Inchiostro/Calce. Sidebar e topbar restano strutturali: la prima gestisce responsive e collapse, la seconda mantiene una fascia alta `3.5rem` con bordo e blur controllato.

### Dialog

Su mobile il dialog è una sheet dal basso con raggio superiore `1rem`; da small viewport è centrato, largo secondo variant e arrotondato a `0.75rem`. Overlay nero al cinquanta per cento, blur minimo e animazione breve separano il piano senza nascondere il contesto.

## Do's and Don'ts

### Do:

- **Do** importare primitive tramite i subpath pubblici e comporle nelle applicazioni.
- **Do** mantenere semantica, tastiera, focus, forced colors e reduced motion nel contratto del componente.
- **Do** provare nuove primitive e varianti in Sirio prima di promuoverle.
- **Do** usare Tabler e General Sans come default; Array soltanto per accenti brevi.
- **Do** mantenere micro-interazioni brevi, interrompibili e coerenti con lo stato.

### Don't:

- **Don't** introdurre logica di dominio, Prisma, autenticazione o import da applicazioni nel package.
- **Don't** creare una variante quando una composizione del componente esistente risolve il problema.
- **Don't** usare colore semantico senza una corrispondente semantica di stato.
- **Don't** affidare focus, errore o selezione soltanto al colore.
- **Don't** rendere i componenti freddi, rigidi o giocosi: devono essere morbidi, chiari e prevedibili.
