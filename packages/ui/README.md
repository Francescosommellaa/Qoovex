# @qoovex/ui

Unica sorgente di verita del design system canonico Qoovex.

## Foundation

- shadcn `base-nova` con primitive open code;
- Base UI per comportamenti accessibili;
- Tabler Icons;
- Tailwind CSS v4 CSS-first;
- General Sans (font principale) e ARRAY (font accent) caricati via Fontshare;
- tema Vercel light/dark/system con token OKLCH;
- ruoli semantici `info`, `success`, `warning` e `destructive`;
- supporto a focus visibile, forced colors e reduced motion.

Il package contiene primitive presentazionali, `PasswordInput`, `OtpInput`, `ThemeProvider`, `ThemeToggle`, `FloatingNavigation`, `MarketingCursor`, `BrandMark`, `cn` e `useIsMobile`. I controlli password e OTP gestiscono soltanto presentazione, accessibilita e valore form: non contengono auth, Prisma, ruoli, permessi, servizi o copy normativo.

`MarketingCursor` e un enhancement opt-in per le sole superfici marketing. Mantiene il punto di precisione, aggiunge un alone elastico e accetta micro-label dichiarative con `data-cursor-label`. Non viene attivato su touch, penna, reduced motion o forced colors e ripristina il cursore nativo su campi e contenuti editabili.

## Link e sottolineatura

Il ruolo del collegamento viene dichiarato con `data-link`: `inline` per link dentro testo sempre sottolineati, `quiet` per link autonomi sottolineati in hover e focus, `plain` per navigazione, card e CTA mai sottolineate. `data-link-scope="inline"` applica il contratto ai link non marcati dentro un contenitore di testo. Button e badge neutralizzano sempre la sottolineatura.

Il testo editoriale resta copiabile con un highlight neutro tokenizzato. Immagini e `BrandMark` non sono selezionabili; i mockup UI possono dichiarare `data-selection="none"` senza modificare la selezione delle superfici prodotto reali. Forced colors conserva l'highlight di sistema.

`ScrollbarController` rende attiva per un tempo breve la scrollbar nativa durante lo scroll e vicino ai bordi della viewport. Il CSS condiviso gestisce anche contenitori annidati, tabelle, menu e sidebar con thumb sottile tokenizzato; touch, pointer coarse e forced colors mantengono il comportamento nativo.

## API pubblica

Il barrel root `@qoovex/ui` non esiste. I consumer importano esclusivamente subpath espliciti:

```ts
import { Button } from "@qoovex/ui/components/button";
import { ThemeProvider } from "@qoovex/ui/components/theme-provider";
import { useIsMobile } from "@qoovex/ui/hooks/use-mobile";
import { cn } from "@qoovex/ui/lib/utils";
```

Ogni app importa una sola volta:

```css
@import "@qoovex/ui/styles/base.css";
@source "../**/*.{ts,tsx}";
```

`Button` e riservato alle azioni. Link e navigazione usano `<a>` o `Link` reali, eventualmente con `buttonVariants` per l'aspetto.

## Confini

- nessun import da `apps/*`, `@qoovex/db`, Auth.js o tipi di dominio;
- nessun componente condiviso duplicato nelle app;
- CSS app-local ammesso solo per layout o composizioni specifiche;
- provenienza e licenze in `THIRD_PARTY_NOTICES.md`;
- il guardrail `pnpm --filter @qoovex/ui test` controlla package e consumer.
