---
name: Sirio
description: Il Banco di Prova - catalogo denso, dimostrativo e sistematico del design Qoovex.
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
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.333
    letterSpacing: "-0.025em"
  body:
    fontFamily: "General Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "Array, General Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.333
    letterSpacing: "0.1em"
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
  catalog-mobile: "1rem"
  catalog-desktop: "2rem"
components:
  catalog-button:
    backgroundColor: "{colors.inchiostro}"
    textColor: "{colors.calce}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0 0.75rem"
  specimen-card:
    backgroundColor: "{colors.calce}"
    textColor: "{colors.inchiostro}"
    rounded: "{rounded.lg}"
    padding: "1.5rem"
  token-label:
    textColor: "{colors.grafite}"
    typography: "{typography.label}"
---

# Design System: Sirio

## Overview

**Creative North Star: "Il Banco di Prova"**

Sirio espone il sistema Qoovex come un banco di lavoro ordinato: ogni token, componente e stato viene isolato abbastanza da poter essere osservato, confrontato e verificato. La densità è maggiore rispetto al sito pubblico, ma la gerarchia rimane calma grazie alla stessa foundation monocromatica, alla tipografia controllata e a superfici contenute.

L'identità è dimostrativa e sistematica, non promozionale. Sidebar, topbar, breadcrumb, campioni e specimen rendono visibili struttura, comportamento e accessibilità senza inventare una seconda estetica o confondere una prova tecnica con una capability di prodotto.

**Key Characteristics:**

- Shell operativa con sidebar adattiva, topbar persistente e area di prova scorrevole.
- Densità informativa controllata da griglie, gruppi e separatori coerenti.
- Token mostrati con nome, variabile e risultato visivo nello stesso contesto.
- Componenti provati in stati realistici, inclusi focus, disabled, errori e responsive.
- Una sola foundation condivisa; Sirio compone e verifica, non duplica.

## Colors

Sirio usa la palette Qoovex senza reinterpretarla: Calce/Inchiostro per struttura, Nebbia/Grafite per metadati e separazione, colori semantici per mostrare stati reali.

### Primary

- **Inchiostro** (`oklch(0 0 0)`): testo, selezione attiva, indicatori forti e controlli primari.
- **Calce** (`oklch(0.99 0 0)`): canvas del catalogo e contrasto inverso; il tema scuro inverte i ruoli tramite i token condivisi.

### Secondary

- **Nebbia** (`oklch(0.97 0 0)`): pannelli di specimen, hover, codici e superfici di confronto.
- **Grafite** (`oklch(0.44 0 0)`): descrizioni, variabili, breadcrumb secondari e metadati.

### Tertiary

- **Segnale Rosso** (`oklch(0.54 0.19 23.03)`): esempi distruttivi ed errori.
- **Informazione Blu** (`oklch(0.53 0.22 264.53)`): esempi informativi.
- **Conferma Verde** (`oklch(0.51 0.15 145)`): esempi di successo e conferma.
- **Attenzione Ambra** (`oklch(0.81 0.17 75.35)`): warning e richieste di attenzione.

### Named Rules

**The Token Is the Evidence Rule.** Sirio mostra il token effettivamente consumato; non sostituisce valori con approssimazioni locali.

**The Semantic Color Rule.** Ogni colore di feedback viene provato con testo, superficie e contrasto, non come campione isolato senza contesto.

## Typography

**Display Font:** General Sans (con fallback di sistema sans-serif)
**Body Font:** General Sans (con fallback di sistema sans-serif)
**Accent Font:** Array, con General Sans come fallback

**Character:** General Sans sostiene scansione, confronto e lettura tecnica. Array marca variabili, identificatori, eyebrow, cifre e status brevi, rendendo riconoscibili i dati senza trasformare il catalogo in un terminale.

### Hierarchy

- **Display** (600, `2.25rem`, 1.111): copertine e specimen tipografici di massimo impatto.
- **Headline** (600, `1.875rem`, 1.2): titolo principale della pagina catalogo.
- **Title** (600, `1.5rem`, 1.333): gruppi di token e sezioni di componenti.
- **Body** (400, `1rem`, 1.75): spiegazioni e campioni leggibili.
- **Label** (400, `0.75rem`, tracking `0.1em`): Array per nomi tecnici, codici e metadati brevi.

### Named Rules

**The Ninety Ten Rule.** General Sans porta circa il novanta per cento dell'interfaccia; Array resta un accento raro e riconoscibile.

**The Example Must Read Rule.** Un campione tipografico dimostra scala e carattere senza sacrificare leggibilità o contesto d'uso.

## Layout

Sirio usa una shell a piena altezza viewport: sidebar adattiva e collassabile, topbar alta `3.5rem`, area contenuto indipendente con overflow verticale. Il contenuto usa padding `1rem` su mobile e `2rem` da small viewport, con larghezza massima `72rem` per le pagine di fondazione.

Le griglie partono da due colonne per campioni compatti e crescono fino a cinque colonne sui viewport ampi. Le pagine mantengono `3rem` tra gruppi principali, `2rem` tra header e contenuto e `1rem` tra campioni correlati. Su mobile la sidebar passa off-canvas e i controlli della topbar si riducono senza perdere breadcrumb, ricerca o tema.

**The Compare Without Crowding Rule.** La densità può aumentare per facilitare il confronto, ma ogni specimen mantiene etichetta, valore e area visiva distinguibili.

## Elevation & Depth

La profondità resta stratificata e contenuta. La shell usa bordi e superfici tonali; specimen e campioni ricevono ombre minime; menu, select, tooltip e dialog usano ombre più chiare soltanto perché si sovrappongono al piano di lavoro. La topbar usa trasparenza e blur per restare separata durante lo scroll.

### Shadow Vocabulary

- **Specimen** (`0 1px 2px 0 hsl(0 0% 0% / 0.09)`): swatch, card e controlli a riposo.
- **Floating Control** (`0 1px 2px 0 hsl(0 0% 0% / 0.18), 0 2px 4px -1px hsl(0 0% 0% / 0.18)`): menu, tooltip e select.
- **Modal** (`0 1px 2px 0 hsl(0 0% 0% / 0.18), 0 8px 10px -1px hsl(0 0% 0% / 0.18)`): dialog e pannelli temporanei sopra la shell.

**The Workbench Stays Flat Rule.** Il piano di catalogo non galleggia; soltanto gli elementi temporaneamente sovrapposti ricevono profondità evidente.

## Shapes

Controlli e campioni usano prevalentemente `0.5rem`; card strutturate e dialog usano `0.75rem`; badge, tabs e indicatori ricorrono alla pill completa. I bordi neutrali descrivono i confini del campione. Icone e marker restano geometrici, semplici e allineati alla scala Tabler.

La sidebar può diventare una colonna iconica senza cambiare forma dei controlli. Gli indicatori scorrevoli sono pill o rettangoli morbidi e seguono la geometria dell'elemento che evidenziano.

## Components

### Buttons

- **Shape:** `0.5rem`, altezza base `2rem`, varianti compatte per il catalogo.
- **Primary:** Inchiostro su Calce inversa; testo medio e icona Tabler da `1rem`.
- **Hover / Focus:** variazione tonale, scala lieve e ring leggibile; ogni stato compare nello specimen.
- **Secondary / Ghost / Destructive:** dimostrati separatamente, con semantica e gerarchia invarianti.

### Chips

- **Style:** pill Array, bordo sottile e superficie semantica a bassa intensità.
- **State:** ogni variant mostra default e, se interattiva, hover, focus e active.

### Cards / Containers

- **Corner Style:** `0.5rem` per specimen semplici, `0.75rem` per card condivise.
- **Background:** Calce o trasparente su canvas Calce/Nebbia.
- **Shadow Strategy:** hairline; il bordo resta il principale segnale di struttura.
- **Internal Padding:** `1.5rem` per specimen, `1rem` per esempi compatti.

### Inputs / Fields

- **Style:** altezza `2.25rem`, bordo input, fondo trasparente, raggio `0.5rem`.
- **Focus:** bordo ring più ring sottile; lo specimen include label e messaggio.
- **Error / Disabled:** stati visibili e descritti, senza affidarsi soltanto al colore.

### Navigation

La sidebar raggruppa Foundations e Componenti UI, usa Tabler da `1rem`, indicatori tonali e label compatte. La topbar combina controllo sidebar, breadcrumb, ricerca e tema in `3.5rem`; su mobile mantiene le azioni essenziali e nasconde soltanto il testo ridondante.

### Token Specimen

Ogni campione abbina risultato visivo, nome leggibile e variabile tecnica. Gli swatch usano altezza `5rem`, raggio `0.375rem`, bordo e ombra minima; le griglie si adattano senza troncare il significato del token.

## Do's and Don'ts

### Do:

- **Do** dimostrare componenti e token reali importati da `@qoovex/ui`.
- **Do** mostrare stati limite, focus, responsive e tema scuro insieme allo stato ideale.
- **Do** mantenere label tecniche vicine al risultato visuale che descrivono.
- **Do** usare densità per facilitare il confronto, non per comprimere indiscriminatamente.

### Don't:

- **Don't** creare varianti locali concorrenti soltanto per rendere il catalogo più ricco.
- **Don't** presentare dati dimostrativi o composizioni rappresentative come capability operative.
- **Don't** usare Array come corpo principale o trasformare Sirio in un terminale estetico.
- **Don't** nascondere errori di contrasto, overflow o interazione con campioni troppo perfetti.
- **Don't** aggiungere decorazione che non aiuti a osservare, confrontare o verificare.
