# Stack

## Cosa è
Primitive per impilare contenuti con gap tokenizzati.

## Come è composto
- Flex container.
- Gap, direzione e allineamento controllati da varianti.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| direction | string | "column" | "row" / "column" |
| gap | string | "4" | token spacing |
| align | string | "stretch" | "start" / "center" / "end" / "stretch" |
| justify | string | "start" | "start" / "center" / "end" / "between" |

## Token usati
- Spacing: `--spacing-*`.

## Regole ferree
- Non usare `gap-*` arbitrari in pagina.
- Non usare `div + className` per layout base se `Stack` basta.

## Esempi
```tsx
// Corretto
<Stack gap="4"><Text>Voce</Text></Stack>

// Sbagliato
<div style={{ gap: "13px" }} />
```

