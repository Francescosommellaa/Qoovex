# @qoovex/ui

Primitive UI condivise per le superfici pubbliche Qoovex.

## Scopo

Questo package nasce quando esistono due consumer reali:

- `apps/web`, sito marketing pubblico;
- `apps/sirio`, showcase del design system.

Contiene solo componenti generici, token CSS e stili base. Non contiene business logic, auth, Prisma, query DB, copy normativo o componenti specifici del workspace.

## Componenti

- `Button`
- `Card`
- `Badge`
- `Section`
- `Container`

## Stili

Importare i CSS globali nell'app consumer:

```css
@import "@qoovex/ui/styles/tokens.css";
@import "@qoovex/ui/styles/base.css";
```

I token sono semantici e provvisori: definiscono base visuale pulita e B2B, non un brand book definitivo.

## Regole

- Nessun import da `apps/*`.
- Nessun import da `@qoovex/db`.
- Nessun preset documentale, checklist o scadenza.
- Nessuna promessa di conformita, certificazione o validita legale.
