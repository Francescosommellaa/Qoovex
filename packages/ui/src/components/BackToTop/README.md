# BackToTop

## Cosa è
Pulsante flottante riutilizzabile per tornare all'inizio di una pagina lunga.

## Come è composto
- Anchor accessibile con `href` verso un target della pagina.
- `Icon` primitive con icona Phosphor `ArrowUp`.
- Stili ufficiali `qv-back-to-top` definiti nel package UI.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| targetId | string | "top" | id esistente nella pagina |
| label | ReactNode | "Torna su" | testo breve |
| showLabel | boolean | false | true \| false |
| threshold | number | 320 | numero di scroll behavior-only |
| size | string | "md" | "md" |
| variant | string | "floating" | "floating" |

## Token usati
- Spacing: `--back-to-top-offset`, `--back-to-top-mobile-offset`, `--spacing-*`.
- Radius: `--back-to-top-radius`.
- Colori: `--back-to-top-bg`, `--back-to-top-text`, `--color-focus-ring`.
- Effects: `--back-to-top-shadow`, `--duration-*`, `--ease-qoovex`.

## Regole ferree
- Non duplicare pulsanti locali per tornare in alto nelle app.
- Non usare posizionamenti o colori inline.
- Il `targetId` deve puntare a una sezione reale della pagina.

## Esempi
```tsx
// Corretto
<BackToTop targetId="overview" />

// Corretto con label visibile
<BackToTop targetId="top" showLabel label="Torna su" />

// Sbagliato
<button style={{ position: "fixed", bottom: "24px" }}>Su</button>
```
