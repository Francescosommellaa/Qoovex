# (auth)/ui

Componenti React locali del route group `(auth)`. **Non esportare al di fuori di `(auth)/`.**

| File | Scopo |
|---|---|
| `AuthCard.tsx` | Shell visiva: logo, titolo, subtitle, footer |
| `AuthField.tsx` | Input nativo con label, errore e hint (usato fuori da Clerk Elements) |
| `index.ts` | Barrel export |

## Regole
- Importa sempre da `../../ui` nelle pagine auth
- Solo classi CSS da `../global/auth.css`
- Nessuna dipendenza esterna oltre React