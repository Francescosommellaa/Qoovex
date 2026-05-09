# Text

## Cosa è
Primitive obbligatoria per ogni contenuto testuale.

## Come è composto
- Elemento HTML semantico configurabile tramite `as`.
- Scala tipografica tokenizzata.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| as | string | "p" | tag HTML semantico |
| size | string | "base" | "xs" / "sm" / "base" / "lg" / "xl" / "2xl" |
| tone | string | "neutral" | "neutral" / "muted" / "faint" / semantic tones |
| family | string | "body" | "body" / "display" / "mono" |

## Token usati
- Tipografia: `--text-*`.
- Colori: `--color-text*`.

## Regole ferree
- Non usare `p`, `h1`, `span` diretti nelle app.
- Non usare dimensioni font hardcoded.

## Esempi
```tsx
// Corretto
<Text as="h1" family="display" size="2xl">Qoovex</Text>

// Sbagliato
<h1 style={{ fontSize: "41px" }}>Qoovex</h1>
```

