# Tokens

## Cosa e
La sorgente TypeScript dei valori visivi ammessi dal design system Qoovex.

## Come e composto
- `colors.ts` per palette e semantica colore.
- `spacing.ts` per la scala spacing ufficiale.
- `typography.ts` per type scale, font family e pesi.
- `radius.ts`, `motion.ts`, `effects.ts`, `z-index.ts` per geometria, movimento e layer.
- `../tokens.css` e il mirror runtime: espone gli stessi valori come CSS variables usate da browser, Tailwind e componenti.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| token | string | n/a | Solo chiavi esportate dai file token |

## Token usati
- Spacing: scala `1`-`32`.
- Radius: `sm`, `md`, `lg`, `xl`, `2xl`, `full`.
- Tipografia: `xs`, `sm`, `base`, `lg`, `xl`, `2xl`.

## Regole ferree
- Non aggiungere valori visuali direttamente nelle app.
- Non duplicare token in file locali.
- Ogni nuovo valore parte da questi file TS e viene mirrorato in `styles/tokens.css`.
- `styles/tokens.css` non e una seconda fonte: e il contratto runtime generato o mantenuto in sync dai token TS.

## Esempi
```tsx
// Corretto
import { spacingTokens } from "@qoovex/ui";

// Sbagliato - valore visuale inventato in pagina
const gap = "13px";
```
