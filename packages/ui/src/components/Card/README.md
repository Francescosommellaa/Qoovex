# Card

## Cosa è
Surface riutilizzabile per panel, bento, preview, slot media e gruppi di contenuto.

## Come è composto
- `Card` come contenitore principale.
- `CardHeader`, `CardBody`, `CardFooter` per slot strutturali.
- `CardMedia` per immagini o preview con ratio controllato.
- Varianti e token definiti nel package UI.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| variant | string | "surface" | "surface" \| "panel" \| "bento" \| "quiet" |
| tone | string | "neutral" | "neutral" \| "primary" \| "success" \| "warning" \| "error" |
| padding | string | "md" | "none" \| "sm" \| "md" \| "lg" |
| span | string | "auto" | "auto" \| "wide" \| "tall" \| "featured" |
| overflow | string | "hidden" | "hidden" \| "visible" |
| interactive | boolean | false | true \| false |

## Token usati
- Spacing: `--card-padding-*`, `--card-gap`, `--spacing-*` per span composti.
- Radius: `--card-radius-surface`, `--card-radius-bento`.
- Colori: `--card-bg-*`, `--card-border-*`, `--card-tone-*`.
- Effects: `--shadow-card-*`.

## Regole ferree
- Non usare `style` inline nei consumer.
- Non creare copie locali del componente nelle app.
- Usa `overflow="visible"` solo quando il contenuto ufficiale del DS deve uscire dal frame, per esempio dropdown o popover in preview.
- Non passare classi con valori visuali hardcoded.

## Esempi
```tsx
// Corretto
<Card variant="panel" padding="lg">
  <CardBody>Contenuto</CardBody>
</Card>

// Corretto per preview con dropdown
<Card overflow="visible">
  <CardBody>
    <Select options={options} />
  </CardBody>
</Card>

// Sbagliato
<div style={{ padding: "13px" }} />
```
