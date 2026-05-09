# UI Components

## Cosa e
Catalogo dei componenti riutilizzabili del design system Qoovex.

## Come e composto
Ogni componente vive in una cartella dedicata:
- `ComponentName.tsx`
- `ComponentName.types.ts`
- `ComponentName.variants.ts`
- `index.ts`
- `README.md`

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| `variant` | string | componente | solo varianti documentate |
| `size` | string | componente | solo scale documentate |
| `tone` | string | componente | `neutral`, `primary`, `success`, `warning`, `error` |

## Token usati
- Spacing: padding/gap solo da `spacing`.
- Radius: solo da `radius`.
- Color: solo semantici `colors`.
- Motion: solo da `motion`.

## Regole ferree
- Non creare componenti visuali locali nelle app.
- Non accettare prop numeriche libere per spacing, radius o colore.
- Non usare SVG manuali quando esiste icona Phosphor tramite `Icon`.
- Ogni componente deve avere README, tipi e variants.

## Esempi
```tsx
// Corretto
<Button variant="primary" size="md">Conferma</Button>

// Sbagliato: niente stile inline o valori fuori scala
<button style={{ padding: 13, borderRadius: 11 }}>Conferma</button>
```
