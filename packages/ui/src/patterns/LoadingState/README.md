# LoadingState

## Cosa è
Pattern skeleton per caricamenti standard.

## Come è composto
- `Card`.
- `Skeleton`.
- `Stack`.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| rows | number | 6 | numero intero positivo |

## Token usati
- Skeleton tokens.
- Card tokens.

## Regole ferree
- Non usare box placeholder locali.
- Non usare height hardcoded nelle app.

## Esempi
```tsx
// Corretto
<LoadingState rows={5} />

// Sbagliato
<div style={{ height: "40px" }} />
```

