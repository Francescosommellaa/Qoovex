# FeatureShowcase

## Cosa è
Pattern per presentare funzioni o vantaggi in card DS.

## Come è composto
- `Card`, `Badge`, `Stack`, `Text` su superfici pastel controllate.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| items | array | n/a | title/body/tone/label/icon |

## Token usati
- Superfici Blush, Mint, Yellow e Lilac definite dai token.
- Badge tokens.
- Spacing: `--spacing-4`.

## Regole ferree
- Non creare feature card locali nelle app.
- Non passare markup con stili inline negli item.

## Esempi
```tsx
// Corretto
<FeatureShowcase items={[{ title: "Ricette", body: "Sempre ordinate." }]} />

// Sbagliato
<div className="grid gap-[19px]" />
```
