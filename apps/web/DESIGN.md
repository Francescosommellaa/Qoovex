---
name: Qoovex Web
description: Il Cantiere in Chiaro - esperienza pubblica aperta, narrativa e persuasiva.
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
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "General Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.1
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
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "Array, General Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
  2xl: "1rem"
  full: "9999px"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.25rem"
  6: "1.5rem"
  section-mobile: "4rem"
  section-desktop: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.inchiostro}"
    textColor: "{colors.calce}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    height: "2.5rem"
    padding: "0.5rem 0.875rem"
  button-outline:
    backgroundColor: "{colors.calce}"
    textColor: "{colors.inchiostro}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    height: "2.5rem"
    padding: "0.5rem 0.875rem"
  marketing-card:
    backgroundColor: "{colors.calce}"
    textColor: "{colors.inchiostro}"
    rounded: "{rounded.2xl}"
    padding: "1.5rem"
---

# Design System: Qoovex Web

## Overview

**Creative North Star: "Il Cantiere in Chiaro"**

Qoovex Web tratta la trasparenza come una condizione spaziale: contenuti ariosi, gerarchie nette e prove di prodotto incorniciate con precisione permettono di vedere il lavoro senza rumore. La monocromia Calce/Inchiostro mantiene il racconto calmo e credibile; Nebbia e Grafite costruiscono il ritmo, mentre il colore semantico appare soltanto quando aggiunge significato.

La superficie pubblica è più aperta, narrativa e persuasiva delle altre superfici Qoovex, ma resta umana e operativa. Griglie sottili, bento asimmetrici, cornici di prodotto e movimento misurato mostrano il sistema in azione senza trasformarlo in spettacolo o promettere ciò che non è verificato.

**Key Characteristics:**

- Monocromia dominante con colore semantico raro e motivato.
- Contenitori ampi, ritmo verticale generoso e composizioni asimmetriche leggibili.
- Interfacce e prove incorniciate come parte del racconto, non come decorazione.
- Movimento sobrio, progressivo e sempre compatibile con reduced motion.
- Un tono rassicurante e concreto, mai freddo da software enterprise e mai giocoso.

## Colors

La palette usa Calce e Inchiostro come contrasto principale, Nebbia e Grafite per gerarchia e profondità, e quattro colori semantici riservati a stati reali.

### Primary

- **Inchiostro** (`oklch(0 0 0)`): testo principale, CTA primaria, marchio e dettagli che richiedono la massima autorità.
- **Calce** (`oklch(0.99 0 0)`): fondo pubblico e spazio negativo; in tema scuro il rapporto si inverte attraverso i token condivisi.

### Secondary

- **Nebbia** (`oklch(0.97 0 0)`): fasce alternate, hover discreti, superfici informative e separazione tonale.
- **Grafite** (`oklch(0.44 0 0)`): descrizioni, metadati e contenuti secondari che devono restare leggibili senza competere con il messaggio.

### Tertiary

- **Segnale Rosso** (`oklch(0.54 0.19 23.03)`): errori, rischio e azioni distruttive.
- **Informazione Blu** (`oklch(0.53 0.22 264.53)`): informazione contestuale verificabile.
- **Conferma Verde** (`oklch(0.51 0.15 145)`): conferme, condivisioni completate ed esiti positivi.
- **Attenzione Ambra** (`oklch(0.81 0.17 75.35)`): attese, richieste aperte e stati che richiedono attenzione.

### Named Rules

**The Monochrome First Rule.** Una sezione deve funzionare in Calce, Inchiostro, Nebbia e Grafite prima di ricevere un colore semantico.

**The Meaning Before Color Rule.** Rosso, blu, verde e ambra descrivono stato o conseguenza; non sono accenti decorativi di marketing.

## Typography

**Display Font:** General Sans (con fallback di sistema sans-serif)
**Body Font:** General Sans (con fallback di sistema sans-serif)
**Accent Font:** Array, con General Sans come fallback

**Character:** General Sans rende il racconto contemporaneo, diretto e leggibile. Array aggiunge una traccia tecnica ed editoriale soltanto a segnali brevi: eyebrow, identificatori, step, badge, cifre e metadati focali.

### Hierarchy

- **Display** (600, `clamp(2.25rem, 5vw, 3.75rem)`, 1.05): hero e messaggio principale, con righe brevi e bilanciate.
- **Headline** (600, `clamp(1.875rem, 4vw, 2.25rem)`, 1.1): titoli di sezione e CTA band.
- **Title** (600, `1.25rem`, 1.4): card narrative e prove di prodotto.
- **Body** (400, `1rem`, 1.7): spiegazioni e contenuto editoriale; le righe lunghe restano entro circa 65–75 caratteri.
- **Label** (600, `0.75rem`, tracking `0.08em`): Array per step, stati e micro-metadati; non per paragrafi o titoli lunghi.

### Named Rules

**The Array Is a Signature Rule.** Array firma dettagli brevi; General Sans continua a portare quasi tutta la voce del prodotto.

**The Short Display Rule.** I titoli principali usano scala e spazio, non peso eccessivo o blocchi di testo troppo lunghi.

## Layout

Il sito usa contenitori centrati fino a `80rem`, gutter da `1rem` su mobile e `1.5rem` da small viewport. Le sezioni respirano con `4rem` verticali su mobile e fino a `6rem` su desktop. La griglia parte da una colonna, passa a due o tre colonne quando il contenuto lo consente e usa asimmetria controllata per hero, confronti e bento.

La navigazione flottante occupa una fascia superiore compatta e lascia il contenuto iniziare con spazio sufficiente. Le cornici di prodotto hanno larghezza limitata e non invadono la lettura. Sotto `768px`, bento e confronti collassano in una sequenza lineare; CTA e navigazione restano leggibili e raggiungibili senza dipendere dall'hover.

**The One Reading Path Rule.** Anche nelle composizioni asimmetriche, titolo, prova e prossimo passo devono mantenere un ordine di lettura evidente.

## Elevation & Depth

La profondità è stratificata e contenuta. Bordi sottili e cambi tonali definiscono le superfici a riposo; ombre basse accompagnano card e controlli interattivi; ombre più evidenti sono riservate alla navigazione flottante, alle cornici di prodotto e agli overlay. Blur e glow restano neutrali e servono a separare piani, non a creare un mondo cromatico alternativo.

### Shadow Vocabulary

- **Hairline** (`0 1px 2px 0 hsl(0 0% 0% / 0.09)`): controlli, badge e card ferme.
- **Interactive** (`0 1px 2px 0 hsl(0 0% 0% / 0.18), 0 2px 4px -1px hsl(0 0% 0% / 0.18)`): hover e navigazione compatta.
- **Product Frame** (`0 1px 2px 0 hsl(0 0% 0% / 0.18), 0 4px 6px -1px hsl(0 0% 0% / 0.18)`): dimostrazioni e finestre applicative.

**The Layer Before Shadow Rule.** Prima si separano i piani con tono e bordo; l'ombra entra soltanto quando deve chiarire gerarchia o interazione.

## Shapes

Il sistema eredita la curvature condivisa: `0.625rem` per controlli, `0.875rem` per card condivise, `1rem` per bento e cornici narrative, pill complete per badge e navigazione compatta. Ogni coppia di bordi arrotondati nidificati e concentrici rispetta `R esterno = R interno + padding reale`; un discendente lontano dagli angoli non costituisce una coppia. I bordi sono sottili e neutrali; la geometria esagonale del marchio è una firma, non una sagoma da ripetere su ogni componente.

Gli elementi interattivi possono comprimersi leggermente in active state. Rotazioni e sovrapposizioni sono ammesse soltanto nelle dimostrazioni narrative, con intensità bassa e senza compromettere l'ordine di lettura.

## Components

### Buttons

- **Shape:** rettangoli morbidi (`0.625rem`) con altezza default `2.5rem` e target chiaro.
- **Primary:** Inchiostro su Calce inversa, peso medio e una sola azione dominante per gruppo.
- **Hover / Focus:** il Button condiviso usa espansione centrata e squash anisotropo Motion; il focus resta immediato e indipendente.
- **Outline / Ghost:** separano azioni secondarie e utility senza competere con la CTA primaria. Link e CTA di navigazione restano anchor e usano il modulo Link separato.

### Chips

- **Style:** pill compatte in Array o General Sans breve, fondo tonale e bordo semantico leggero.
- **State:** il colore indica stato documentato; hover e active appaiono soltanto quando il chip è realmente interattivo.

### Cards / Containers

- **Corner Style:** card condivise a `0.875rem`; bento e cornici marketing a `1rem`.
- **Background:** Calce o Nebbia, con alternanza di sezione ottenuta per tono.
- **Shadow Strategy:** hairline a riposo; sollevamento minimo sulle card interattive.
- **Border:** una linea neutra è la separazione primaria.
- **Internal Padding:** `1.5rem` come default, fino a `2rem` nei blocchi narrativi ampi.

### Inputs / Fields

- **Style:** altezza `2.25rem`, fondo trasparente, bordo Nebbia compatta e raggio default `0.625rem`.
- **Focus:** bordo Inchiostro e ring sottile; placeholder e helper restano Grafite.
- **Error / Disabled:** Segnale Rosso per errore; opacità e fondo tonale per disabled senza rimuovere l'etichetta.

### Navigation

La barra pubblica è flottante, traslucida e responsive: `3.5rem` in stato aperto e `3rem` in stato compatto, con raggio che passa da pannello morbido a pill. Link e sezione attiva usano indicatori tonali scorrevoli; su mobile il contenuto passa a un dialog ordinato per sezioni.

### Product Frame

La cornice applicativa usa raggio `1rem`, bordo, shadow strutturale e una chrome neutra con tre punti in Grafite attenuata. Deve contenere esempi credibili e dichiaratamente dimostrativi, mai mockup che suggeriscano capability non disponibili.

## Do's and Don'ts

### Do:

- **Do** costruire prima una gerarchia monocromatica e aggiungere colore soltanto a uno stato reale.
- **Do** usare spazio, titoli brevi e prove incorniciate per rendere comprensibile il prodotto.
- **Do** mantenere una CTA primaria riconoscibile e azioni secondarie visivamente più quiete.
- **Do** rispettare tema scuro, forced colors, focus visibile e reduced motion in ogni composizione.

### Don't:

- **Don't** usare colori semantici come decorazione o creare gradienti cromatici estranei alla palette neutra.
- **Don't** trasformare ogni blocco in una card sollevata; bordo e tono sono la base della profondità.
- **Don't** usare Array per paragrafi, titoli lunghi o navigazione primaria estesa.
- **Don't** rendere il sito freddo da enterprise, giocoso o spettacolare a scapito di fiducia e chiarezza.
- **Don't** inventare prove, testimonianze o capability per riempire una composizione.
