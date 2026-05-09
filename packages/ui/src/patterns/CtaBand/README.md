# CtaBand

## Cosa è
Pattern CTA finale o intermedio.

## Come è composto
- `Card` bento.
- `Text` per titolo e descrizione.
- `Button` per azioni.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| title | ReactNode | n/a | testo |
| description | ReactNode | n/a | testo |
| actions | array | [] | azioni con href |

## Token usati
- Card bento tokens.
- Spacing: `--spacing-8`, `--spacing-10`.

## Regole ferree
- Non creare bande CTA locali.
- Non usare gradienti esterni al token card.

## Esempi
```tsx
// Corretto
<CtaBand title="Apri Qoovex" description="Inizia dal workspace." />

// Sbagliato
<div style={{ borderRadius: 31 }} />
```

