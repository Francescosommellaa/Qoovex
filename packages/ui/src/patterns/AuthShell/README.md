# AuthShell

## Cosa è
Pattern per schermate autenticazione mobile-first.

## Come è composto
- `Card`.
- `Stack`.
- `Text`.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| title | ReactNode | n/a | testo |
| subtitle | ReactNode | undefined | testo |
| steps | object | undefined | current/total |
| backAction | ReactNode | undefined | componente DS |
| variant | "card" / "split" | "card" | layout centrato o split desktop |
| aside | ReactNode | undefined | contenuto laterale visibile nel layout split |

## Token usati
- `--auth-card-width`.
- `--auth-shell-width`.
- `--auth-aside-width`.
- `--auth-step-dot`.
- Card e typography tokens.

## Regole ferree
- Non creare shell auth locali con CSS custom.
- Non usare padding o max-width hardcoded.

## Esempi
```tsx
// Corretto
<AuthShell title="Accedi">...</AuthShell>

// Sbagliato
<main style={{ maxWidth: "420px" }} />
```
