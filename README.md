# Qoovex

Monorepo del prodotto Qoovex per professionisti della cucina.

## Stato Corrente

- `apps/web`: superficie pubblica minimale. Espone `/`, `/contact`, `/legal`
  e `/legal/[document]`.
- `apps/workspace`: runtime API-only con NextAuth, servizi e repository.
- `apps/sirio`: scaffold Next.js vuoto.
- `packages/ui`: scaffold TypeScript privato e vuoto.
- `packages/brand`: fonte canonica del logo originale Qoovex.

La UX e la UI non sono definite. Non esistono componenti, token, font,
pattern, temi o regole visuali canoniche.

## Stack

- pnpm workspaces e Turborepo
- Next.js 16, React 19 e TypeScript
- Prisma 7 e PostgreSQL
- NextAuth v5 nel solo workspace
- Vercel Blob e Resend

## Regole

- I limiti prodotto arrivano da `packages/config/plan_rules.json`.
- Il workspace mantiene l'ordine FSD `shared -> entities -> features ->
  widgets -> views -> app` quando i layer frontend verranno ricostruiti.
- Le query passano da repository e servizi server-only.
- Il codice condiviso cross-app vive in `packages/*`.
- Usare solo Phosphor per le icone future; non disegnare SVG alternativi se
  esiste un'icona adatta.
- Il logo arriva solo da `packages/brand`; non duplicarlo nelle app.

## Comandi

```bash
pnpm dev
pnpm check:repo
pnpm lint
pnpm type-check
pnpm build
pnpm test:e2e
```
