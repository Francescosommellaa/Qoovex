# Sirio App

Showcase tecnico del design system Qoovex.

## Stato

Sirio mostra token Tailwind CSS v4 e primitive importate da `@qoovex/ui`. Non e la fonte canonica dei componenti e non contiene business logic.

## Responsabilita

- mostrare token base;
- mostrare Button, Card, Badge, Section e Container;
- mostrare input, controlli, stati generici e casi loading/empty/error prima dell'integrazione workspace;
- documentare esempi di stati operativi generici;
- separare copy prudente da copy da evitare.

## Unita in approvazione

`/foundations` isola la proposta mobile-first per token, tipografia, spacing e layout. La route serve per la revisione Sirio e non autorizza integrazioni nel workspace.

## Divieti

- niente Prisma o `@qoovex/db`;
- niente auth workspace;
- niente servizi prodotto;
- niente preset documentali, checklist, scadenze o obblighi;
- niente import Fontshare duplicati: la tipografia arriva solo da `@qoovex/brand-resources`.

## Comandi

```bash
pnpm --filter @qoovex/sirio type-check
pnpm --filter @qoovex/sirio build
```
