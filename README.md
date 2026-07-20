# Qoovex

Monorepo di Qoovex: il sistema piu semplice per piccole imprese e subappaltatori che devono tenere pronti documenti, scadenze e prove di cantiere.

## Stato

- `apps/workspace`: runtime Next.js per dashboard prodotto, auth, MFA, inviti, supporto auditato e API prodotto.
- `apps/web`: sito marketing pubblico e pagine legali.
- `apps/sirio`: catalogo e superficie di verifica del design system, con demo marketing e dashboard.
- `apps/mobile`: placeholder vuoto per la futura app mobile.
- `packages/db`: schema Prisma e migrazioni auth, Azienda, supporto e dominio MVP.
- `packages/types`: ruoli, permessi e DTO platform-neutral.
- `packages/ui`: unica sorgente del design system canonico condiviso.
- `packages/brand-resources`: asset SVG proprietari condivisi.

Il design system canonico e documentato in `docs/05_UI_BRAND_AND_SURFACES.md`. Usa shadcn `base-nova`, Base UI, Tabler Icons, Geist/Geist Mono, Tailwind CSS v4 e il tema Vercel light/dark/system. Sirio, web e workspace consumano componenti, hook, utility e foundation CSS tramite subpath espliciti di `@qoovex/ui`.

Il modello MVP per documenti, scadenze, cantieri e prove operative e definito come base tecnica generica. Le API server-side e i flussi auth, MFA, autorizzazioni, Prisma e storage restano confinati nel workspace e non appartengono al package UI.

## Regole

- Auth e sicurezza restano confinate in `apps/workspace`.
- Azienda, ruoli, support session e autorizzazioni derivano sempre dal server.
- Nessun ruolo o permesso proveniente dal client e fonte autorevole.
- Le app non importano codice da altre app.
- Il codice condiviso vive in `packages/*`; le composizioni di dominio restano app-locali.
- `packages/ui` non conosce sessioni, ruoli, permessi, Prisma o tipi di dominio.
- Gli import UI usano esclusivamente subpath come `@qoovex/ui/components/button`; il barrel root non esiste.
- Qoovex organizza documenti e stati operativi; non promette conformita o validita legale.
- `SITE_MANAGER` e `WORKER` usano filtri risorsa server-side, non accessi larghi all'Azienda.

## Comandi

`pnpm dev` avvia o riusa automaticamente Prisma Postgres locale `qoovex-local` e soltanto dopo avvia le app. Il bootstrap rifiuta target remoti e non consuma Operations dei database cloud.

```bash
pnpm install
pnpm dev
pnpm --filter @qoovex/db db:generate
pnpm --filter @qoovex/ui type-check
pnpm --filter @qoovex/ui test
pnpm --filter @qoovex/sirio build
pnpm --filter @qoovex/web build
pnpm --filter @qoovex/workspace build
pnpm check
```
