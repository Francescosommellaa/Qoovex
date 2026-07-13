# @qoovex/ui

Foundation UI condivisa per le superfici Qoovex.

## Scopo

Contiene solo componenti generici, token Tailwind CSS v4 e stili base. Non contiene business logic, auth, Prisma, query DB, ruoli, permessi, copy normativo o componenti specifici del workspace.

## Componenti

- `Button`
- `IconButton`
- `Card`
- `Panel`
- `Badge`
- `Status`
- `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`
- `Alert`, `LoadingState`, `EmptyState`, `ErrorState`
- `Section`
- `Container`

## Stili

Importare i CSS globali nell'app consumer:

```css
@import "tailwindcss";
@import "@qoovex/brand-resources/styles/fontshare.css";
@import "@qoovex/ui/styles/tokens.css";
@import "@qoovex/ui/styles/base.css";
```

I token sono semantici e sono definiti con `@theme static`, senza configurazione Tailwind JavaScript. Il provider Fontshare resta confinato in `@qoovex/brand-resources`: General Sans per il testo operativo e Cabinet Grotesk per i titoli.

La fondazione mobile-first espone:

- gutter pagina fluido da `1rem` a `2rem`;
- spaziatura di sezione fluida da `3.5rem` a `7rem`;
- contenitori `reading`, `content` e `wide`;
- scala tipografica fluida per body, heading, title e display;
- controlli con target base da `2.75rem` (44 px), focus visibile e reduced motion;
- ruoli semantici per canvas, superfici raised/sunken, contenuto, bordi, azione blu, enfasi corallo, feature violetta e stati;
- elevazioni skeuomorphiche tinte sul canvas, con feedback raised e pressed;
- tema light come default indipendente dal sistema e tema dark disponibile solo tramite `data-theme="dark"` esplicito; il marketing forza sempre `data-theme="light"`.

## Regole

- Nessun import da `apps/*`.
- Nessun import da `@qoovex/db`.
- Nessun import da Auth.js/NextAuth, API, ruoli o tipi di dominio.
- Nessun preset documentale, checklist o scadenza.
- Nessuna promessa di conformita, certificazione o validita legale.
