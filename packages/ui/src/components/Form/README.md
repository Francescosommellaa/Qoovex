# Form

Sistema slot-composed canonico per form marketing, auth e workspace.

- Varianti: `plain | ghost | surface | panel`
- Layout: `stack | grid | inline`
- Densità: `compact | comfortable | spacious`
- `FormControl` propaga id, required, disabled, status e attributi ARIA.
- Label default in sentence case; helper, error e success restano semantici.
- `surface` usa Paper; `panel` usa Cream senza gradienti decorativi.
- Sezioni e actions usano divider Ink al 5–6%.

Input, Select, Textarea e OTP devono ereditare i token del form senza override
locali.
