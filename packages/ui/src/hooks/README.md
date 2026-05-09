# Hooks

## Cosa è
Hook UI generici usati dai componenti e dalle app.

## Come è composto
- `useMedia` per media query controllate.
- `useToggle` per stato booleano locale.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| query | string | n/a | media query CSS |
| defaultValue | boolean | false | true / false |

## Token usati
- Nessun token visuale diretto.

## Regole ferree
- Non inserire logica di business.
- Non duplicare hook UI nelle app.

## Esempi
```tsx
// Corretto
const isDesktop = useMedia("(min-width: 768px)");

// Sbagliato
window.matchMedia("(max-width: 643px)");
```

