# Themes

## Cosa è
I temi runtime supportati dal design system Qoovex.

## Come è composto
- `dark.ts`: tema default basato sull'estetica attuale.
- `white.ts`: tema chiaro calibrato sugli stessi token semantici.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| theme | string | "dark" | "dark" / "white" |

## Token usati
- Colori: `--color-*`.
- Surface: `--color-bg`, `--color-surface`, `--color-surface-2`.
- Testi: `--color-text`, `--color-text-muted`, `--color-text-faint`.

## Regole ferree
- Non creare temi locali nelle app.
- Non usare colori hardcoded per compensare differenze tra temi.

## Esempi
```tsx
// Corretto
<ThemeProvider defaultTheme="dark" />

// Sbagliato
document.body.style.background = "#fff";
```

