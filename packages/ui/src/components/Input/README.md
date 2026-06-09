# Input

Campo testuale accessibile con label, messaggi, stato e contesto di superficie.

## API

- `status`: `default | error | success`
- `surface`: `light | dark`
- Supporta label visibile o screen-reader-only, helper, prefissi, suffissi e
  toggle password.

```tsx
<Input label="Titolo ricetta" />
<Input label="Cerca" surface="dark" />
```

`surface="dark"` si usa solo dentro superfici Obsidian o Violet.
