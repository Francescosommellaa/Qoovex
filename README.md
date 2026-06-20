# Qoovex

Monorepo di Qoovex Pre-Service Brain: l’assistente operativo che trasforma
eventi e regole interne in calcoli, briefing e preparazioni verificabili.

## Stato

- `apps/web`: futuro sito marketing.
- `apps/workspace`: futuro prodotto web responsive, account, auth e servizi.
- `apps/mobile`: scaffold documentale della futura app Expo iOS/Android.
- `apps/sirio`: scope, direzione grafica e componenti candidati.
- `packages/ui`: token platform-neutral, nessun componente runtime Approved.
- `packages/db`: baseline Prisma auth-only.
- `packages/brand`: unica fonte del marchio Qoovex.

Il prodotto web resterà Next.js; la futura app mobile userà Expo iOS/Android.
Backend Event e AI non sono ancora definiti.

Domini canonici: `qoovex.com` per il web pubblico, `app.qoovex.com` per il
prodotto e `sirio.qoovex.com` per scope e design system.

## Regole

- Pre-Service è il centro; Service Mode resta consultivo e minimale.
- Phone serve piani e registrazioni puntuali; desktop pianifica e approva.
- Query DB solo in repository o servizi server-only autorizzati.
- NextAuth resta confinato a `apps/workspace`.
- Codice cross-app nei package; package mai dipendenti dalle app.
- Logo solo da `@qoovex/brand`, icone applicative solo Phosphor.

## Comandi

```bash
pnpm check:repo
pnpm lint
pnpm type-check
pnpm test:unit
pnpm build
pnpm test:e2e
```
