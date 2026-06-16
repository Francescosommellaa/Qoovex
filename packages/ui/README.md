# @qoovex/ui

Fondazione styles-only temporanea del Qoovex Design System Measured Heat.

Questo package non espone componenti React approvati. In questa fase possiede
solo:

- `styles/tokens.css`;
- `styles/base.css`;
- `styles/index.css`, entrypoint pubblico `@qoovex/ui/styles.css`.

## Regole

- Non aggiungere componenti in `packages/ui` finche la fondazione Sirio non e'
  approvata.
- Usare token semantici, non valori primitivi diretti, quando verranno creati i
  componenti.
- Sirio puo' usare markup app-local per mostrare la direzione, ma non crea API
  runtime.
- Nessun font esterno o font self-hosted e' canonico in questa fase.

## Utilizzo

```ts
import "@qoovex/ui/styles.css";
```

## Comandi

- `pnpm --filter @qoovex/ui lint`
- `pnpm --filter @qoovex/ui type-check`
- `pnpm --filter @qoovex/ui test`
- `pnpm --filter @qoovex/ui build`

