# FieldControl

## Cosa è
Helper interno per label, helper text, stato e tooltip dei campi form.

## Come è composto
- `FieldLabel`
- `FieldHelperText`
- `FieldErrorTooltip`
- classi di stato condivise da Input, Select e Textarea

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| status | string | "default" | "default" | "error" | "success" |
| srOnly | boolean | false | true | false |
| live | string | "off" | "off" | "polite" | "assertive" |

## Token usati
- Spacing: `--input-gap`, `--spacing-2`, `--spacing-3`
- Radius: `--radius-md`
- Color: `--color-input-*`, `--color-tooltip-*`, `--color-error`
- Shadow: `--shadow-md`

## Regole ferree
- Non esportarlo come building block app-level.
- Non usarlo per contenuti non form.
- Non aggiungere dimensioni fuori token.

## Esempi
```tsx
// Corretto
<FieldLabel htmlFor="name">Nome</FieldLabel>

// Sbagliato
<label style={{ fontSize: "13px" }}>Nome</label>
```
