# ProductPreviewFrame

## Cosa è
Pattern per mostrare una preview compatta del workspace Qoovex.

## Come è composto
- `Box`, `Stack`, `Text`, `Icon`.
- `Badge` e `Skeleton`.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| activeScreen | string | "recipes" | "recipes" / "menus" / "workplan" / "explore" |

## Token usati
- `--product-preview-*`.
- Surface, border, spacing, radius e skeleton tokens.

## Regole ferree
- Non ricreare mockup prodotto locali nelle app.
- Non usare colori semaforo hardcoded.

## Esempi
```tsx
// Corretto
<ProductPreviewFrame activeScreen="recipes" />

// Sbagliato
<div style={{ width: 460 }} />
```

