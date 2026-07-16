# @qoovex/ui

Unica sorgente di verita del design system canonico Qoovex.

## Foundation

- shadcn `base-nova` con primitive open code;
- Base UI per comportamenti accessibili;
- Tabler Icons;
- Tailwind CSS v4 CSS-first;
- Geist e Geist Mono caricati dalle app con `next/font`;
- tema Vercel light/dark/system con token OKLCH;
- ruoli semantici `info`, `success`, `warning` e `destructive`;
- supporto a focus visibile, forced colors e reduced motion.

Il package contiene primitive presentazionali, `ThemeProvider`, `ThemeToggle`, `FloatingNavigation`, `BrandMark`, `cn` e `useIsMobile`. Non contiene auth, Prisma, ruoli, permessi, servizi o copy normativo.

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
