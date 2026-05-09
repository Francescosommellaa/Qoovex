# Box

## Cosa è
Primitive per layout e superfici token-safe.

## Come è composto
- Elemento HTML configurabile tramite `as`.
- Varianti centralizzate in `config/variants.ts`.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| as | string | "div" | tag HTML semantico |
| surface | string | "transparent" | "transparent" / "bg" / "surface" / "surface2" / "offset" / "raised" |
| padding | string | "none" | token spacing |
| radius | string | "none" | token radius |
| border | string | "none" | "none" / "subtle" / "divider" / "tone" |

## Token usati
- Spacing: `--spacing-*`.
- Radius: `--radius-*`.
- Color: `--color-*`.

## Regole ferree
- Non passare `style` con valori visuali.
- Non usare `div` locali quando serve una superficie DS.

## Esempi
```tsx
// Corretto
<Box surface="surface" padding="4" radius="lg" />

// Sbagliato
<div style={{ padding: "13px" }} />
```

