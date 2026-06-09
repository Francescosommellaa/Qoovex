# Text

Primitive tipografica canonica. General Sans e l'unica famiglia del sistema.

## API

- `as`: elemento HTML semantico.
- `textStyle`: `caption | eyebrow | body-sm | body | subheading | heading-sm |
  heading | heading-lg | display | hero`.
- `tone`: neutro, attenuato, inverso o semantico.

Le props legacy `size` e `family` restano disponibili solo per la migrazione.
Il nuovo codice usa ruoli tipografici.

```tsx
<Text as="h1" textStyle="hero">Il prossimo passo.</Text>
<Text textStyle="body" tone="muted">Descrizione operativa.</Text>
```
