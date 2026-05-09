# Icon

## Cosa è
Primitive per icone Phosphor coerenti con size e tone del DS.

## Come è composto
- Wrapper `span`.
- Componente icona Phosphor passato via prop `icon`.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| icon | component | n/a | icona Phosphor |
| size | string | "md" | "xs" / "sm" / "md" / "lg" / "xl" |
| tone | string | "current" | "current" / semantic tones / "muted" / "faint" |

## Token usati
- Colori: `--color-*`.
- Size: scala icone interna del DS.

## Regole ferree
- Non importare librerie icone diverse da Phosphor.
- Non usare SVG inline nelle app.

## Esempi
```tsx
// Corretto
<Icon icon={ArrowRight} tone="primary" />

// Sbagliato
<svg />
```

