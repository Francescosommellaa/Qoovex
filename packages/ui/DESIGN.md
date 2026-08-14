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
    fontWeight: 500
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
- **Body** (400, `1rem`, 1.75): testo principale; i controlli compatti scalano a `0.875rem`.
- **Label** (500, `0.75rem`, tracking `0.08em`): accento Array per metadati corti e status.

### Named Rules

**The General Sans Default Rule.** Se non esiste una ragione esplicita per usare Array, la scelta corretta è General Sans.

**The Accent Must Be Short Rule.** Array non porta paragrafi, titoli lunghi o istruzioni critiche.

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

### Buttons

- **Shape:** raggio `0.5rem`, altezza base `2rem`, peso medio e gap interno `0.375rem`.
- **Primary:** background Inchiostro, testo Calce e ombra 2xs.
- **Hover / Focus:** tono al novanta per cento, scala `1.015`, active `0.97`, bordo ring e ring esterno sottile.
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
- **Focus:** bordo ring e ring al trenta per cento; il focus globale mantiene outline da due pixel.
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
