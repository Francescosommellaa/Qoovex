# Web App

Sito marketing pubblico Qoovex.

## Stato

Questa app contiene il sistema marketing pubblico responsive. Il copy resta intenzionalmente prudente e non deriva da ricerca inventata.

## Responsabilita

- homepage pubblica;
- SEO tecnico base;
- link configurabile verso il workspace tramite `NEXT_PUBLIC_WORKSPACE_URL`;
- uso di primitive condivise da `@qoovex/ui`.
- menu mobile nativo, hero contenuto, link testuali accessibili e banner cookie non sovrapposto ai contenuti.

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
