# ThemeProvider

## Cosa è
Provider runtime per applicare il tema Qoovex dark/white.

## Come è composto
- React context.
- `data-theme` su `document.documentElement`.
- `ThemeToggle` per cambio tema.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| defaultTheme | string | "dark" | "dark" / "white" |
| storageKey | string | "qoovex-theme" | chiave localStorage |

## Token usati
- Colori e transizioni da `styles/tokens`.

## Regole ferree
- Non creare provider tema locali.
- Non mutare colori direttamente nelle app.

## Esempi
```tsx
// Corretto
<ThemeProvider><ThemeToggle /></ThemeProvider>

// Sbagliato
document.body.style.color = "#111";
```

