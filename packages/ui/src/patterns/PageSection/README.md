# PageSection

## Cosa è
Pattern per sezioni di pagina responsive e mobile-first.

## Come è composto
- `Box` per il contenitore.
- `Stack` per il ritmo verticale.
- `Text` per headline e descrizione.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| width | string | "wide" | "content" / "wide" / "full" |
| spacing | string | "16" | token spacing |

## Token usati
- Spacing: `--spacing-*`.
- Typography: `--text-xl`, `--text-base`.
- Container: `--container-*`.

## Regole ferree
- Non creare padding locali di sezione.
- Non usare heading diretti fuori da `Text`.

## Esempi
```tsx
// Corretto
<PageSection title="Funzioni" spacing="16" />

// Sbagliato
<section style={{ padding: "72px 18px" }} />
```

