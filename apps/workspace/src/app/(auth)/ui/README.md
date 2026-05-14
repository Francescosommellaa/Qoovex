# (auth)/ui

Componenti React locali del route group `(auth)`. **Non esportare al di fuori di `(auth)/`.**

Questa cartella e` una eccezione route-local documentata al placement FSD: resta in `app`
perche` compone solo pagine auth Clerk e non rappresenta UI shared del prodotto.

| File | Scopo |
|---|---|
| `AuthShell.tsx` | Shell visiva: logo, titolo, sottotitolo, step, indietro, area form |
| `OAuthButton.tsx` | Pulsanti OAuth Clerk (Google / Apple) |
| `index.ts` | Barrel export |

## Regole

- Importa da `../ui` nelle pagine `(auth)`.
- Stili auth dedicati: `../globals.css` del route group `(auth)` (non sovrascrivere il design system in `packages/ui`; token e componenti da `@qoovex/ui`).
- Se un componente diventa riusabile fuori dall'auth, spostarlo nel layer corretto invece di importarlo da questa cartella.
