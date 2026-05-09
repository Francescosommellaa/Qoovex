# Primitives

## Cosa è
Mattoni atomici per layout, testo e icone.

## Come è composto
- `Box` per superfici e contenitori.
- `Stack` per layout flex tokenizzato.
- `Text` per ogni testo.
- `Icon` per icone Phosphor.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| gap | string | "4" | token spacing |
| size | string | "base" | token tipografici |
| radius | string | "none" | token radius |

## Token usati
- Spacing, typography, radius e colori da `styles/tokens`.

## Regole ferree
- Le app compongono layout con primitives, non con markup arbitrario.
- Nessun valore visuale inline.

## Esempi
```tsx
// Corretto
<Stack gap="4"><Text>Contenuto</Text></Stack>

// Sbagliato
<div style={{ margin: 13 }} />
```

