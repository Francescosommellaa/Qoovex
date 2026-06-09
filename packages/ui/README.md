# Qoovex UI

## Cosa e
Fonte unica del design system Qoovex per token, primitives, components e patterns.

## Come e composto
- `src/primitives`: Box, Stack, Text, Icon.
- `src/components`: componenti UI riutilizzabili con README, tipi e variants.
- `src/patterns`: sezioni composte e shell applicative.
- `styles/tokens`: token TypeScript e mirror CSS runtime.
- `config/variants.ts`: mappe CVA e scale globali.

## Props / API
| Export | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| `@qoovex/ui` | package API | centrale | primitives, components, patterns, hooks, tokens |
| `@qoovex/ui/styles/tokens` | CSS | light | token CSS variables |
| `@qoovex/ui/styles/base` | CSS | base | reset e base layer |

## Token usati
- Spacing: solo scala `spacing`.
- Radius: solo scala `radius`.
- Colors: solo semantici `colors`.
- Typography: solo scala `typography`.
- Motion/effects/z-index: solo token dedicati.
- Tema globale: light-first; Obsidian e Violet sono superfici contestuali.

## Regole ferree
- Le app assemblano UI importando da `@qoovex/ui`.
- Nessun valore visuale hardcoded fuori da token source, README o eccezioni documentate.
- Nessun componente visuale locale nelle app quando manca un blocco: prima si crea qui.
- Ogni componente ha cartella, tipi, variants, README ed export.

## Esempi
```tsx
// Corretto
import { PageSection, Stack, Text } from "@qoovex/ui";

<PageSection title="Menu">
  <Stack gap="4">
    <Text tone="muted">Contenuto</Text>
  </Stack>
</PageSection>

// Sbagliato: niente valori locali
<div style={{ marginTop: "13px", color: "#fff" }}>Contenuto</div>
```
