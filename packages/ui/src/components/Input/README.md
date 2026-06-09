# Input

Campo testuale accessibile con label, messaggi, stato e contesto di superficie.

## API

- `status`: `default | error | success`
- `surface`: `light | dark`
- `size`: `sm | md | lg`, rispettivamente 40, 44 e 48 px.
- Supporta label visibile o screen-reader-only, helper, prefissi, suffissi e
  toggle password.
- La superficie light usa Paper 96%, radius 12 px, bordo Ink 12% e focus nero
  con ring esterno 3 px.
- `surface="dark"` ridefinisce localmente testo, bordo, placeholder e focus:
  non attiva un tema globale.

```tsx
<Input label="Titolo ricetta" />
<Input label="Cerca" surface="dark" />
```

`surface="dark"` si usa solo dentro superfici Obsidian o Violet.
