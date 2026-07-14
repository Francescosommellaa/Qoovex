# @qoovex/ui

Fondazione condivisa di Traccia Operativa per tutte le superfici Qoovex.

## Contratto

Il package contiene token CSS-first, stili base e primitive esclusivamente presentazionali. Non contiene logica di dominio, auth, Prisma, ruoli, permessi o copy normativo.

Primitive pubbliche:

- controlli: `Button`, `IconButton`, `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`;
- layout: `Container`, `Section`;
- feedback: `Alert`, `LoadingState`, `EmptyState`, `ErrorState`;
- grammatica: `Trace`, `TraceNode`, `TraceGap`, `TraceTerminal`;
- iconografia: `Icon` e un insieme curato di glyph Phosphor.

`Card`, `Panel`, `Badge` e `Status` sono stati rimossi. Le situazioni operative appartengono al workspace, non alla libreria generica.

## Fondazione visiva

- esclusivamente light-first;
- palette canonica campo, carta, nebbia, inchiostro, linea e cobalto;
- General Sans per il linguaggio operativo, Cabinet Grotesk per orientamento e marketing;
- colore di brand separato dai colori semantici;
- nessuna informazione affidata soltanto al colore;
- raggi limitati a controlli, focus e overlay reali;
- nessuna elevazione statica; l'unica ombra pubblica appartiene agli overlay;
- supporto a `forced-colors`, contrasto aumentato e `prefers-reduced-motion`.

Import canonico:

```css
@import "tailwindcss";
@import "@qoovex/brand-resources/styles/fontshare.css";
@import "@qoovex/ui/styles/tokens.css";
@import "@qoovex/ui/styles/base.css";
```

## Confini

- nessun import da `apps/*`, `@qoovex/db`, Auth.js o tipi di dominio;
- nessun alias permanente per token o primitive legacy;
- nessun preset documentale o promessa di conformità;
- le prop funzionali dei controlli restano stabili durante la migrazione visuale.
