# Textarea

## Cosa ?
Componente condiviso del design system Qoovex.

## Come ? composto
- Implementazione React pubblica tramite `Textarea.tsx`.
- Tipi pubblici in `Textarea.types.ts`.
- Varianti dichiarate in `Textarea.variants.ts`.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| variant | string | dipende | valori esportati dai tipi del componente |
| size | string | dipende | valori esportati dai tipi del componente |

## Token usati
- Spacing: solo `--spacing-*` o token componente dedicati.
- Radius: solo `--radius-*` o token componente dedicati.
- Colori: solo `--color-*` e token semantici del componente.

## Regole ferree
- Non usare `style` inline nei consumer.
- Non creare copie locali del componente nelle app.
- Non passare classi con valori visuali hardcoded.

## Esempi
```tsx
// Corretto
<Textarea />

// Sbagliato
<div style={{ padding: "13px" }} />
```
