# EmptyState

## Cosa è
Pattern per stati vuoti o errori leggeri.

## Come è composto
- `Card`, `Stack`, `Text`.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| title | ReactNode | n/a | testo |
| description | ReactNode | undefined | testo |
| action | ReactNode | undefined | componente DS |

## Token usati
- Card tokens.
- Typography tokens.

## Regole ferree
- Non costruire empty state locali.
- Non usare icone non Phosphor.

## Esempi
```tsx
// Corretto
<EmptyState title="Nessun risultato" />

// Sbagliato
<div className="rounded-[20px]" />
```

