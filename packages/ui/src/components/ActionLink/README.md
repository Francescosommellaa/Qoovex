# ActionLink

## Cosa è
Link azione con estetica Button per navigazione e CTA.

## Come è composto
- Elemento `a`.
- Varianti tokenizzate condivise col linguaggio dei Button.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| variant | string | "primary" | "primary" / "secondary" / "ghost" |
| size | string | "md" | "sm" / "md" / "lg" |

## Token usati
- Spacing: `--spacing-*`.
- Radius: `--radius-full`.
- Colori e shadow button.

## Regole ferree
- Usare per link CTA, non annidare `Button` dentro `a`.
- Non creare classi bottone locali nelle app.

## Esempi
```tsx
// Corretto
<ActionLink href="/contact">Contatto</ActionLink>

// Sbagliato
<a style={{ padding: "13px" }} />
```

