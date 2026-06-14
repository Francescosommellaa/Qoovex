# @qoovex/ui

Core runtime del Qoovex Design System Stable v0.5.

## Contratto

- `Surface` possiede Paper, Crystal e Inverse.
- `Card` compone lo stesso contratto materiale; non esistono varianti glass
  alternative.
- Form e dati densi restano Paper.
- Crystal e` consentito soltanto con uno scopo:
  `navigation`, `focus`, `feature`, `overlay`.
- React 19, props native, `className` e ref sono preservati.
- Radix gestisce comportamento accessibile degli overlay e delle selezioni
  complesse; Qoovex possiede interamente la resa visuale.
- Phosphor e` l'unico sistema iconografico.

## Utilizzo

```tsx
import { Button, Card, Surface } from "@qoovex/ui";
import "@qoovex/ui/styles.css";

export function Example() {
  return (
    <Surface material="crystal" purpose="focus">
      <Card>
        <h2>Ricetta verificata</h2>
        <Button>Genera menu</Button>
      </Card>
    </Surface>
  );
}
```

Non annidare una superficie Crystal dentro un'altra. Gli input inseriti in una
lente usano sempre Paper.

## Comandi

- `pnpm --filter @qoovex/ui lint`
- `pnpm --filter @qoovex/ui type-check`
- `pnpm --filter @qoovex/ui test`
- `pnpm --filter @qoovex/ui build`

I font Cabinet Grotesk e Synonym sono self-hosted in WOFF2 variable. La licenza
Fontshare originale e` inclusa in `styles/fonts/FONT-LICENSE.txt`.
