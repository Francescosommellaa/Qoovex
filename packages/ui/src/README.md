# UI Source

## Cosa e
Sorgente TypeScript del design system pubblico Qoovex.

## Come e composto
- `primitives`: layout, testo e icone token-safe.
- `components`: componenti presentazionali riutilizzabili.
- `patterns`: composizioni ufficiali per sezioni e shell.
- `hooks`: hook UI senza logica business.
- `lib`: utility interne.
- `index.ts`: export pubblico.

## Props / API
| Area | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| primitives | React components | token-safe | solo token scale |
| components | React components | documented | props documentate nei README |
| patterns | React compositions | DS layout | primitives + components |

## Token usati
- Ogni elemento visivo deve passare da `styles/tokens`.
- Le classi arbitrarie sono ammesse solo se leggono `var(--token)`.

## Regole ferree
- Non importare da app.
- Non introdurre business logic.
- Non esportare API non documentate.
- Non usare `div`, `p`, `h*`, `span` nelle app quando esiste una primitive.

## Esempi
```tsx
// Corretto
import { Box, Stack, Text } from "@qoovex/ui";

<Box surface="surface" radius="lg" padding="4">
  <Stack gap="3">
    <Text as="h2" size="lg">Titolo</Text>
  </Stack>
</Box>

// Sbagliato
<section className="p-7 rounded-[18px]">Titolo</section>
```
