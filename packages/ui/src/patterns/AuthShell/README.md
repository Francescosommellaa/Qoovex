# AuthShell

## Cosa e'
Pattern per schermate autenticazione mobile-first.

Il layout e light-first; eventuali pannelli scuri sono contesti locali e non
dipendono da un provider di tema.

## Come e' composto
- `Card`.
- `Stack`.
- `Text`.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| title | ReactNode | n/a | testo |
| subtitle | ReactNode | undefined | testo |
| steps | object | undefined | current/total/labels |
| backAction | ReactNode | undefined | componente DS |
| variant | "card" / "split" / "split-open" | "card" | layout centrato, split desktop, o split con form libero desktop |
| aside | ReactNode | undefined | contenuto laterale visibile nel layout split |

## Token usati
- `--auth-card-width`.
- `--auth-form-width`.
- `--auth-shell-width`.
- `--auth-aside-width`.
- `--auth-step-dot`.
- `--auth-step-marker-size`.
- `--auth-pattern-*`.
- Card e typography tokens.

## Regole ferree
- Non creare shell auth locali con CSS custom.
- Non usare padding o max-width hardcoded.
- Per form desktop fuori card usare `variant="split-open"`, non markup alternativo locale.

## Esempi
```tsx
// Corretto
<AuthShell title="Accedi">...</AuthShell>

// Corretto, split desktop con form libero
<AuthShell
  title="Crea account"
  variant="split-open"
  aside={<Preview />}
  steps={{ current: 1, total: 3, labels: ["Email", "Codice", "Credenziali"] }}
>
  ...
</AuthShell>

// Sbagliato
<main className="custom-auth-shell">...</main>
```
