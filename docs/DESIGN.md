# Qoovex Design System — Specification & Guidelines (`DESIGN.md`)

> **Sorgente di Verità Visuale**: Il pacchetto monorepo [`@qoovex/ui`](file:///A:/Qoovex/packages/ui) costituisce l'unica fonte di verità per la visual foundation, i token CSS, i componenti atomici e i comportamenti d'interfaccia di tutte le applicazioni Qoovex (`apps/workspace`, `apps/web`, `apps/sirio`).

---

## 1. Filosofia del Design e Principi Architetturali

Il Design System di Qoovex è progettato attorno a principi di **minimalismo ad alta precisione**, **leggibilità editoriale**, **prestazioni nativo-fluidi** ed **estetica Vercel-inspired**.

### Principi Guida:
1. **Precision Engineering & Clean Density**: Spaziature rigorose, tipografia bilanciata e assenza di decorazioni superflue per concentrare l'attenzione sui dati di cantiere e le comunicazioni aziendali.
2. **Spazio Colore OKLCH**: Utilizzo di OKLCH per una percezione uniforme della brillantezza e del contrasto nei temi chiaro, scuro e ad alto contrasto.
3. **Ruoli Semantici Rigidi**: Differenziazione cromatica vincolata agli stati di sistema (`info`, `success`, `warning`, `destructive`) per evitare ambiguità nell'esperienza utente.
4. **Comportamento Adattivo & Accessibilità First**: Supporto nativo a `prefers-reduced-motion`, `forced-colors` (High Contrast Mode Windows), navigaibiltà via tastiera con focus visibile a 2px e controlli touch-friendly.
5. **Divieto di Accoppiamento di Dominio**: Le primitive di `@qoovex/ui` restano puramente presentazionali, disaccoppiate da modelli Prisma, permessi RBAC/ABAC o chiamate API.

---

## 2. Architettura Tecnica e Stack Visuale

| Strato / Strumento | Tecnologia Adottata | Descrizione e Ruolo |
| :--- | :--- | :--- |
| **Engine Styling** | Tailwind CSS v4 | Engine CSS-first con direttive `@import` e `@theme inline` |
| **Primitive Comportamentali**| Base UI & shadcn `base-nova` | Componenti accessibili privi di stile per modali, menu e form |
| **Set di Icone** | Tabler Icons (`@tabler/icons-react`) | Iconografia vettoriale minimalista e consistente (stroke 1.5px / 2px) |
| **Tipografia** | Geist & Geist Mono | Caricate via `next/font` nelle app (`var(--font-geist-sans)`, `var(--font-geist-mono)`) |
| **Design Tokens** | CSS Custom Properties OKLCH | Variabili dinamicamente iniettate su `[data-theme="vercel"]` e `.dark` |

---

## 3. Tipografia e Contratto Editoriale

### 3.1 Famiglie di Font
* **Sans-Serif (Interfaccia & Contenuto)**: `var(--font-sans)` (`Geist`, `sans-serif`)
* **Monospace (Dati, Codici, Importi & Token)**: `var(--font-mono)` (`Geist Mono`, `monospace`)

### 3.2 Scala Tipografiche e Line Height

| Token / Utilità | Dimensione (Font Size) | Interlinea (Line Height) | Esempio di Utilizzo |
| :--- | :--- | :--- | :--- |
| `var(--text-xs)` | `0.75rem` (12px) | `1.25` (`--leading-tight`) | Micro-label, timestamp, badge, cursor label |
| `var(--text-sm)` | `0.875rem` (14px) | `1.25` / `1.4` | Testo primario d'interfaccia, form inputs, tabelle |
| `base` (Standard) | `1.00rem` (16px) | `1.5` | Corpo del testo nei documenti e articoli |
| `lg` / `xl` | `1.125rem` - `1.25rem` | `1.3` | Titoli di sezioni e modali |
| `2xl` / `3xl` | `1.50rem` - `1.875rem` | `1.2` | Hero title, headings principali e pagine di overview |

### 3.3 Gestione dei Link (`data-link`)

La sottolineatura e l'interazione dei collegamenti ipertestuali sono regolate mediante contratti dichiarativi nel DOM:

```html
<!-- Link all'interno di paragrafi o testi editoriali (sempre sottolineati) -->
<a href="..." data-link="inline">Termini e Condizioni</a>

<!-- Link autonomi o secondari (sottolineati solo al passaggio del mouse o focus) -->
<a href="..." data-link="quiet">Vedi dettagli</a>

<!-- Elementi di navigazione, card o CTA (nessuna sottolineatura) -->
<a href="..." data-link="plain">Torna alla dashboard</a>

<!-- Scopo ereditato per un intero blocco di testo -->
<div data-link-scope="inline">
  <p>Tutti i link contenuti <a href="...">qui</a> saranno inline.</p>
</div>
```

* **Offset della sottolineatura**: `0.2em` (`--link-underline-offset`)
* **Spessore standard**: `max(1px, 0.07em)` (`--link-underline-thickness`)
* **Spessore attivo/hover**: `max(1.5px, 0.1em)` (`--link-underline-thickness-active`)
* **Transizione**: `160ms` con curva `--ease-standard`

---

## 4. Palette Colori e Sistema di Token OKLCH

### 4.1 Token Principali (Tema Light & Dark)

Tutti i colori d'interfaccia sono definiti nello spazio colore **OKLCH** per garantire una scala percettiva perfetta.

```css
[data-theme="vercel"] {
  /* Fondo e Primo Piano */
  --background: oklch(0.99 0 0);
  --foreground: oklch(0 0 0);

  /* Superfici e Modali */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0 0 0);
  --popover: oklch(0.99 0 0);
  --popover-foreground: oklch(0 0 0);

  /* Primario e Secondario */
  --primary: oklch(0 0 0);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.94 0 0);
  --secondary-foreground: oklch(0 0 0);

  /* Muted e Accent */
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.44 0 0);
  --accent: oklch(0.94 0 0);
  --accent-foreground: oklch(0 0 0);

  /* Bordi e Input */
  --border: oklch(0.92 0 0);
  --input: oklch(0.94 0 0);
  --ring: oklch(0 0 0);
}

[data-theme="vercel"].dark {
  /* Fondo e Primo Piano Scuro */
  --background: oklch(0 0 0);
  --foreground: oklch(1 0 0);

  /* Superfici e Modali */
  --card: oklch(0.14 0 0);
  --card-foreground: oklch(1 0 0);
  --popover: oklch(0.18 0 0);
  --popover-foreground: oklch(1 0 0);

  /* Primario e Secondario Invertiti */
  --primary: oklch(1 0 0);
  --primary-foreground: oklch(0 0 0);
  --secondary: oklch(0.25 0 0);
  --secondary-foreground: oklch(1 0 0);

  /* Muted e Accent Scuro */
  --muted: oklch(0.23 0 0);
  --muted-foreground: oklch(0.72 0 0);
  --accent: oklch(0.32 0 0);
  --accent-foreground: oklch(1 0 0);

  /* Bordi e Input */
  --border: oklch(0.26 0 0);
  --input: oklch(0.32 0 0);
  --ring: oklch(0.72 0 0);
}
```

### 4.2 Ruoli Semantici e Superfici Trasparenti

Per indicare stati, avvisi ed errori, si utilizzano le variabili semantiche combinate con `color-mix` per le superfici di sfondi soft:

```css
/* Definizioni Semantiche (Light) */
--destructive: oklch(0.63 0.19 23.03); /* Rosso Avviso */
--info:        oklch(0.55 0.22 264.53); /* Blu Informativo */
--success:     oklch(0.56 0.15 145);    /* Verde Conferma */
--warning:     oklch(0.81 0.17 75.35);  /* Giallo/Ambra Attenzione */

/* Superfici Calcolate tramite color-mix */
--destructive-surface: color-mix(in oklch, var(--destructive) 12%, transparent);
--info-surface:        color-mix(in oklch, var(--info) 12%, transparent);
--success-surface:     color-mix(in oklch, var(--success) 12%, transparent);
--warning-surface:     color-mix(in oklch, var(--warning) 16%, transparent);
```

---

## 5. Spaziature, Dimensioni, Raggi e Ombre

### 5.1 Token di Spaziatura (Grid 4px Base)

* `--spacing`: `0.25rem` (4px)
* `--space-1`: `0.25rem` (4px)
* `--space-2`: `0.50rem` (8px)
* `--space-3`: `0.75rem` (12px)
* `--space-4`: `1.00rem` (16px)
* `--space-5`: `1.25rem` (20px)
* `--space-6`: `1.50rem` (24px)

### 5.2 Dimensioni dei Controlli e Icone

* `--control` (Altezza Input/Button Standard): `2rem` (32px)
* `--control-lg` (Altezza Input/Button Large): `2.5rem` (40px)
* `--icon` (Dimensione Icone d'Interfaccia): `1rem` (16px)

### 5.3 Raggi di Curvatura (`Border Radius`)

* Base Radius (`--radius`): `0.5rem` (8px)
* `--radius-sm`: `calc(var(--radius) - 4px)` -> `4px`
* `--radius-md`: `calc(var(--radius) - 2px)` -> `6px`
* `--radius-lg`: `var(--radius)` -> `8px`
* `--radius-xl`: `calc(var(--radius) + 4px)` -> `12px`
* Full Pill / Circular: `999px`

### 5.4 Sistema di Ombre e Profondità (Layer Elevation)

```css
--shadow-2xs: 0 1px 2px 0 hsl(0 0% 0% / 0.09);
--shadow-xs:  0 1px 2px 0 hsl(0 0% 0% / 0.09);
--shadow-sm:  0 1px 2px 0 hsl(0 0% 0% / 0.18), 0 1px 2px -1px hsl(0 0% 0% / 0.18);
--shadow:     0 1px 2px 0 hsl(0 0% 0% / 0.18), 0 1px 2px -1px hsl(0 0% 0% / 0.18);
--shadow-md:  0 1px 2px 0 hsl(0 0% 0% / 0.18), 0 2px 4px -1px hsl(0 0% 0% / 0.18);
--shadow-lg:  0 1px 2px 0 hsl(0 0% 0% / 0.18), 0 4px 6px -1px hsl(0 0% 0% / 0.18);
--shadow-xl:  0 1px 2px 0 hsl(0 0% 0% / 0.18), 0 8px 10px -1px hsl(0 0% 0% / 0.18);
--shadow-2xl: 0 1px 2px 0 hsl(0 0% 0% / 0.45);
```

---

## 6. Animazioni, Easing e Transizioni

### 6.1 Curva di Easing Canonica
Tutte le transizioni d'interfaccia utilizzano la curva di accelerazione standard:
```css
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
```

### 6.2 Transizioni Navigazione Fluida (`FloatingNavigation`)
Indicatori elastici di focus e sfondi attivi nelle barre di navigazione:
```css
transition:
  width 260ms cubic-bezier(0.16, 1, 0.3, 1),
  height 260ms cubic-bezier(0.16, 1, 0.3, 1),
  transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
  opacity 120ms var(--ease-standard);
```

### 6.3 Cambio Tema con View Transitions API
Transizione ad espansione circolare originata dal punto di click dell'utente:
```css
@keyframes reveal {
  from {
    clip-path: circle(0% at var(--x, 50%) var(--y, 50%));
    opacity: 0.7;
  }
  to {
    clip-path: circle(150% at var(--x, 50%) var(--y, 50%));
    opacity: 1;
  }
}

::view-transition-new(root) {
  animation: reveal 0.4s ease-in-out forwards;
}
```

### 6.4 Riduzione del Movimento (`prefers-reduced-motion`)
Quando l'utente richiede la riduzione del movimento, le animazioni CSS e le transizioni vengono istantaneamente azzerate:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none !important;
  }
}
```

---

## 7. Sistemi d'Interazione Avanzati

### 7.1 Marketing Cursor (`<MarketingCursor />`)
Un elemento di cursore custom avanzato per superfici promozionali/landing page (`apps/web`):
* **Core**: Puntatore centrale di precisione (`width: 0.375rem`, `height: 0.375rem`).
* **Halo**: Alone visivo elastico (`width: 2rem`, `height: 2rem`) con effetto magnetico attorno ai pulsanti.
* **Modalità Supportate (`data-mode`)**:
  * `default`: Alone standard.
  * `action`: Espansione per CTA principali (`2.75rem`).
  * `label`: Mostra un testo micro in monospace (`Geist Mono`) con sfondo pieno.
  * `disabled`: Stato vietato/disabilitato con icona di sbarramento.
* **Filtri di attivazione**: Automaticamente **disattivato** su schermi touch, penna stilografica, `prefers-reduced-motion` o `forced-colors`. Ripristina il cursore nativo su campi di testo editabili (`data-cursor-native="text"`).

### 7.2 Controller Scrollbar Nativi (`<ScrollbarController />`)
* scrollbar sottile (`0.5rem`) e trasparente di default.
* Si attiva con un thumb tokenizzato (`--scrollbar-thumb`) durante lo scroll e in prossimità del bordo della viewport (`[data-scrollbar-active="true"]`).
* Ripristina la scrollbar nativa su dispositivi mobili e touch.

---

## 8. Catalogo delle Primitive e Componenti (`@qoovex/ui`)

Tutti i componenti sono esportati tramite subpath espliciti:

```ts
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { Input } from "@qoovex/ui/components/input";
import { PasswordInput } from "@qoovex/ui/components/password-input";
import { OtpInput } from "@qoovex/ui/components/otp-input";
import { FloatingNavigation } from "@qoovex/ui/components/floating-navigation";
import { ThemeProvider } from "@qoovex/ui/components/theme-provider";
import { ThemeToggle } from "@qoovex/ui/components/theme-toggle";
```

### Regola Aurea Action vs Navigazione:
* **`<Button>`**: Riservato **esclusivamente alle azioni/mutazioni** (submit form, conferma dialog, cancellazione, ecc.).
* **`<Link>` / `<a>`**: Riservato alla **navigazione tra pagine e contesti**. Per applicare lo stile di un pulsante a un link, utilizzare `buttonVariants({...})`.

---

## 9. Linee Guida per gli Sviluppatori Monorepo

1. **Import Unico del CSS**: Ogni applicazione Next.js importa il CSS condiviso una sola volta nel file root CSS:
   ```css
   @import "@qoovex/ui/styles/base.css";
   @source "../src/**/*.{ts,tsx}";
   ```
2. **Nessun Componente Duplicato**: Se un componente visuale viene utilizzato da più di un'applicazione, deve essere integrato in `@qoovex/ui/src/components`.
3. **Guardrail Automatici**: Eseguire prima di ogni commit il comando di verifica della foundation:
   ```bash
   pnpm --filter @qoovex/ui test
   ```