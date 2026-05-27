# Auth UI (route-local)

Scopo: componenti UI usati solo dal route group `(auth)`.

Eccezione FSD documentata: questa cartella non è API condivisa del prodotto.

| File | Ruolo |
|------|--------|
| `sign-in-form.tsx` | Form accesso: email/password, Google, pulsante dev-auth (solo localhost) |

Non importare questi componenti da `features`, `widgets` o `views` fuori da `(auth)`.
