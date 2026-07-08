# Web App

Sito marketing pubblico Qoovex.

## Stato

Questa app contiene una base provvisoria, non la landing definitiva. Il copy e intenzionalmente prudente e non deriva da ricerca inventata.

## Responsabilita

- homepage pubblica;
- SEO tecnico base;
- link configurabile verso il workspace tramite `NEXT_PUBLIC_WORKSPACE_URL`;
- uso di primitive condivise da `@qoovex/ui`.

## Divieti

- niente Prisma o `@qoovex/db`;
- niente auth workspace;
- niente servizi prodotto;
- niente preset documentali, checklist, scadenze o obblighi;
- niente pricing, testimonianze, casi studio o keyword research inventata.

## Comandi

```bash
pnpm --filter @qoovex/web type-check
pnpm --filter @qoovex/web build
```
