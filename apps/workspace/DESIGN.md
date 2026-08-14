---
name: Qoovex Workspace
description: Sistema operativo calmo e trasparente per il cantiere condiviso.
colors:
  calce: "var(--background)"
  inchiostro: "var(--foreground)"
  superficie: "var(--card)"
  superficie-popover: "var(--popover)"
  azione-principale: "var(--primary)"
  azione-principale-foreground: "var(--primary-foreground)"
  secondario: "var(--secondary)"
  nebbia: "var(--muted)"
  grafite: "var(--muted-foreground)"
  accento: "var(--accent)"
  bordo: "var(--border)"
  campo: "var(--input)"
  anello-focus: "var(--ring)"
  segnale-rosso: "var(--destructive)"
  informazione-blu: "var(--info)"
  conferma-verde: "var(--success)"
  attenzione-ambra: "var(--warning)"
typography:
  display:
    fontFamily: "General Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 5vw, 2.35rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  title:
    fontFamily: "General Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "-0.015em"
  body:
    fontFamily: "General Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Array, General Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  control: "8px"
  surface: "12px"
  sheet: "16px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
components:
  button-primary:
    backgroundColor: "{colors.azione-principale}"
    textColor: "{colors.azione-principale-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "32px"
  button-outline:
    backgroundColor: "{colors.calce}"
    textColor: "{colors.inchiostro}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "32px"
  card-default:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.inchiostro}"
    typography: "{typography.body}"
    rounded: "{rounded.surface}"
    padding: "24px"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.inchiostro}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
    height: "36px"
  badge-status:
    backgroundColor: "{colors.nebbia}"
    textColor: "{colors.inchiostro}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "22px"
---

# Design System: Qoovex Workspace

## Overview

**Creative North Star: "Il Cantiere Trasparente"**

Qoovex Workspace deve sembrare un luogo di lavoro dove ogni elemento è visibile, ordinato e comprensibile. La struttura monocromatica riduce il rumore, mentre gerarchia, spaziatura e stati semantici aiutano persone diverse a capire cosa sta accadendo e quale azione viene dopo.

Il carattere è rassicurante, calmo, accessibile, umano, tracciabile e operativo. L'interfaccia evita sia la freddezza impersonale del software enterprise sia il tono giocoso che indebolirebbe la fiducia in documenti, richieste e conferme. La precisione resta al servizio della semplicità, mai dell'esibizione tecnica.

**Key Characteristics:**

- Monocromia strutturale con colore riservato ai segnali che hanno un significato.
- Gerarchie leggibili, contenuti compatti senza risultare compressi e prossimo passo sempre riconoscibile.
- Superfici stratificate e contenute, definite prima da tono e bordo e solo dopo dall'ombra.
- Interazioni tattili con discrezione, morbide, chiare e prevedibili.
- Parità reale tra tema chiaro, tema scuro, tastiera, movimento ridotto e colori forzati.

## Colors

La palette nasce dal contrasto adattivo tra **Calce** e **Inchiostro**. **Nebbia** e **Grafite** organizzano superfici e informazioni secondarie; il colore compare soltanto quando comunica stato, rischio o avanzamento.

### Primary

- **Calce** (light oklch(0.99 0 0), dark oklch(0 0 0)): fondo principale e spazio di respiro; nel tema scuro il ruolo si inverte semanticamente senza cambiare contratto.
- **Inchiostro** (light oklch(0 0 0), dark oklch(1 0 0)): testo, icone e azioni ad alta priorità.
- **Azione principale** (light oklch(0 0 0), dark oklch(1 0 0)): massimo contrasto per l'azione primaria, sempre accompagnata dal relativo foreground.

### Neutral

- **Superficie** (light oklch(1 0 0), dark oklch(0.14 0 0)): card e contenitori operativi sopra il fondo.
- **Nebbia** (light oklch(0.97 0 0), dark oklch(0.23 0 0)): aree secondarie, selezioni leggere e raggruppamenti.
- **Grafite** (light oklch(0.44 0 0), dark oklch(0.72 0 0)): descrizioni, metadati e testo a priorità ridotta.
- **Bordo** (light oklch(0.92 0 0), dark oklch(0.26 0 0)): separazione discreta tra regioni, controlli e righe.
- **Accento** (light oklch(0.94 0 0), dark oklch(0.32 0 0)): risposta neutra a hover, selezione e navigazione; non è un colore decorativo.

### Semantic

- **Segnale Rosso** (light oklch(0.54 0.19 23.03), dark oklch(0.69 0.2 23.91)): errori, azioni distruttive e stati di pericolo.
- **Informazione Blu** (light oklch(0.53 0.22 264.53), dark oklch(0.68 0.17 260.84)): contesto informativo che richiede attenzione senza urgenza.
- **Conferma Verde** (light oklch(0.51 0.15 145), dark oklch(0.72 0.15 145)): esiti positivi e stati completati.
- **Attenzione Ambra** (light oklch(0.81 0.17 75.35), dark oklch(0.84 0.16 80)): attese, incompletezze e condizioni che richiedono verifica.

**The Semantic Signal Rule.** Rosso, blu, verde e ambra compaiono soltanto quando il loro significato è reale; non colorano sezioni per varietà estetica.

**The Theme Parity Rule.** Tema chiaro e scuro mantengono la stessa gerarchia, gli stessi significati e la stessa leggibilità; nessuno dei due è una variante di seconda classe.

## Typography

**Display Font:** General Sans (with fallback ui-sans-serif, system-ui, sans-serif)

**Body Font:** General Sans (with fallback ui-sans-serif, system-ui, sans-serif)

**Label Font:** Array (with fallback General Sans, ui-sans-serif, system-ui, sans-serif)

**Character:** General Sans porta quasi tutta la voce: diretta, umana e leggibile. Array entra con parsimonia in badge, metadati, valori, etichette compatte e dettagli operativi, offrendo precisione senza trasformarsi in decorazione.

### Hierarchy

- **Display** (600, scala fluida, line-height 1.05): titoli di pagina e momenti di orientamento principali.
- **Title** (600, 1rem, line-height 1.375): titoli di card, pannelli e gruppi funzionali.
- **Body** (400, 0.875rem, line-height 1.5): copy operativo, descrizioni e contenuto dei controlli; i paragrafi esplicativi restano brevi e leggibili.
- **Label** (600, 0.6875rem, tracking 0.08em): badge, intestazioni tabellari, timestamp e metadati ad alta scansione.

**The One Voice Rule.** General Sans governa titoli, sottotitoli e testo; Array è un accento funzionale e non sostituisce mai la voce principale.

## Layout

Workspace usa una shell operativa a viewport pieno: sidebar persistente e ridimensionabile su desktop, topbar fissa e solo contenuto centrale scorrevole. La pagina interna è centrata fino a una larghezza massima ampia e mantiene un ritmo base di 4px, con gap ricorrenti da 12, 16 e 24px.

Il contenuto parte da una singola colonna leggibile e aggiunge colonne soltanto quando lo spazio consente di mantenere gerarchia e azioni chiare. Sotto il breakpoint desktop la sidebar diventa un drawer; i pannelli affiancati tornano a impilarsi e le modali diventano fogli ancorati al fondo. Il padding del contenuto cresce progressivamente da 12px a 24px.

**The Next Step Rule.** Ogni composizione deve rendere evidente il prossimo passo senza affidarsi a memoria, hover o conoscenza del sistema.

## Elevation & Depth

La profondità è stratificata e contenuta. Fondo, superfici tonali e bordi sottili definiscono l'architettura ordinaria; ombre brevi e neutre rafforzano soltanto card, popover, modali, stati interattivi e superfici che devono separarsi dal piano corrente. Le superfici non fluttuano per decorazione.

### Shadow Vocabulary

- **Contatto minimo** (`0 1px 2px 0 hsl(0 0% 0% / 0.09)`): per pulsanti, card e contenitori a riposo.
- **Sollevamento operativo** (`0 1px 2px 0 hsl(0 0% 0% / 0.18), 0 2px 4px -1px hsl(0 0% 0% / 0.18)`): per hover e pannelli temporanei.
- **Overlay** (`0 1px 2px 0 hsl(0 0% 0% / 0.18), 0 8px 10px -1px hsl(0 0% 0% / 0.18)`): per dialog, sheet e autenticazione, sempre accompagnato da bordo o backdrop.

**The Layered, Not Floating Rule.** Prima tono e bordo, poi ombra; l'elevazione deve spiegare una relazione spaziale o uno stato interattivo.

## Shapes

La forma è morbida ma utilitaria. Controlli e alert usano angoli da 8px; card, tabelle e contenitori principali usano 12px; sheet e superfici ampie possono arrivare a 16px. Badge, indicatori e controlli circolari usano la pillola completa. I bordi sono sottili e a basso contrasto; la geometria resta compatta e mai giocosa.

**The Soft Utility Rule.** Gli angoli accompagnano l'interazione senza trasformare card e controlli in bolle decorative.

## Components

I componenti devono essere tattili con discrezione, morbidi, chiari e prevedibili. Tutti gli stati mantengono focus visibile, semantica accessibile e feedback comprensibile anche senza colore.

### Buttons

- **Shape:** controllo compatto con angoli morbidi da 8px e altezze principali da 32px; la variante grande arriva a 38px.
- **Primary:** massimo contrasto tra azione e foreground, bordo trasparente e ombra minima.
- **Hover / Focus:** lieve variazione tonale e scala quasi impercettibile; focus ad anello, press con compressione controllata.
- **Outline / Secondary / Ghost:** gerarchia progressivamente più quieta, senza perdere target, contrasto o stato attivo.

### Chips

- **Style:** badge a pillola con Array, tracking leggero e colore semantico diluito su fondo e bordo.
- **State:** l'icona affianca il testo quando chiarisce il significato; non sostituisce mai l'etichetta.

### Cards / Containers

- **Corner Style:** superficie morbida da 12px.
- **Background:** superficie piena, trasparente o Nebbia leggera secondo gerarchia.
- **Shadow Strategy:** contatto minimo a riposo; piccolo sollevamento soltanto per card realmente interattive.
- **Border:** bordo sottile sempre presente nelle superfici standard.
- **Internal Padding:** 24px per la densità standard, 16px per la variante compatta.

### Inputs / Fields

- **Style:** campo trasparente o tonalmente attenuato, bordo sottile, altezza base 36px e raggio 8px.
- **Focus:** bordo di focus e anello contenuto; nessun bagliore decorativo.
- **Error / Disabled:** rosso semantico per errore; opacità e superficie attenuata per disabled, mantenendo leggibilità.

### Navigation

La sidebar usa etichette compatte, icone Tabler da 16px, superfici neutre e indicatore di hover scorrevole. Lo stato attivo è tonale, non cromatico. La topbar resta traslucida e aderente al viewport; su mobile navigazione e modali adottano pattern nativi di drawer e bottom sheet.

### Alerts and Operational States

Alert, badge e stati vuoti combinano icona, titolo e descrizione. I colori semantici sono diluiti sul fondo e rinforzati da bordo e testo; warning ed errori non dipendono mai dal solo colore.

**The Quiet Tactility Rule.** Hover, focus e press confermano l'interazione con piccoli cambi di tono, posizione o scala; non introducono movimento spettacolare.

## Do's and Don'ts

### Do:

- **Do** usare Calce, Inchiostro, Nebbia e Grafite per costruire la maggior parte della gerarchia.
- **Do** riservare Segnale Rosso, Informazione Blu, Conferma Verde e Attenzione Ambra a stati verificabili.
- **Do** rendere il prossimo passo visibile attraverso ordine, copy chiaro e priorità delle azioni.
- **Do** usare General Sans per la voce principale e Array soltanto per accenti informativi circoscritti.
- **Do** preservare tema chiaro/scuro, focus da tastiera, movimento ridotto e forced colors in ogni componente.

### Don't:

- **Don't** rendere Workspace freddo, impersonale o denso come un software enterprise tradizionale.
- **Don't** usare colori, forme gonfie, illustrazioni o motion con tono giocoso.
- **Don't** aggiungere ombre se tono e bordo spiegano già la separazione.
- **Don't** usare il colore come unico vettore di stato o autorizzazione.
- **Don't** introdurre font, icone o primitive alternative alla foundation condivisa senza una decisione esplicita.
