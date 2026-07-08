# Sirio App

Showcase tecnico del design system Qoovex.

## Stato

Sirio mostra token e primitive importate da `@qoovex/ui`. Non e la fonte canonica dei componenti e non contiene business logic.

## Responsabilita

- mostrare token base;
- mostrare Button, Card, Badge, Section e Container;
- documentare esempi di stati operativi generici;
- separare copy prudente da copy da evitare.

## Divieti

- niente Prisma o `@qoovex/db`;
- niente auth workspace;
- niente servizi prodotto;
- niente preset documentali, checklist, scadenze o obblighi;
- niente brand asset definitivi inventati.

## Comandi

```bash
pnpm --filter @qoovex/sirio type-check
pnpm --filter @qoovex/sirio build
```
