# @qoovex/ui

Foundation UI condivisa per le superfici Qoovex.

## Scopo

Contiene solo componenti generici, token Tailwind CSS v4 e stili base. Non contiene business logic, auth, Prisma, query DB, ruoli, permessi, copy normativo o componenti specifici del workspace.

## Componenti

- `Button`
- `Icon`
- `IconButton`
- `Card`
- `Panel`
- `Badge`
- `Status`
- `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`
- `Alert`, `LoadingState`, `EmptyState`, `ErrorState`
- `Section`
- `Container`

`Icon` accetta esclusivamente componenti Phosphor tipizzati. `Button` supporta icone e loading nel ramo button; `Field` collega automaticamente label, descrizione, errore e attributi ARIA al controllo. `Alert` e `Status` restano statici finche il consumer non richiede esplicitamente un annuncio live.

## Stili

Importare i CSS globali nell'app consumer:

```css
@import "tailwindcss";
@import "@qoovex/brand-resources/styles/fontshare.css";
@import "@qoovex/ui/styles/tokens.css";
@import "@qoovex/ui/styles/base.css";
```

I token sono semantici e sono definiti con `@theme`, senza configurazione Tailwind JavaScript. Il provider font resta confinato in `@qoovex/brand-resources`.

I link inseriti nel testo usano una sottolineatura persistente. Focus, touch target, cursor, ombre, livelli e dimensioni dei container sono definiti centralmente.

## Regole

- Nessun import da `apps/*`.
- Nessun import da `@qoovex/db`.
- Nessun import da Auth.js/NextAuth, API, ruoli o tipi di dominio.
- Nessun preset documentale, checklist o scadenza.
- Nessuna promessa di conformita, certificazione o validita legale.
