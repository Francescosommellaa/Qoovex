# (auth)/ui

Componenti React locali del route group `(auth)`. **Non esportare al di fuori di `(auth)/`.**

| File | Scopo |
|---|---|
| `AuthShell.tsx` | Shell visiva: logo, titolo, sottotitolo, step, indietro, area form |
| `OAuthButton.tsx` | Pulsanti OAuth Clerk (Google / Apple) |
| `index.ts` | Barrel export |

## Regole

- Importa da `../ui` nelle pagine `(auth)`.
- Stili auth dedicati: `../globals.css` del route group `(auth)` (non sovrascrivere il design system in `packages/ui`; token e componenti da `@qoovex/ui`).
